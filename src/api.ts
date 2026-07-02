import type { QrCakeConfig } from './config.js';

/**
 * A QR code as returned by the QR Cake API-key product routes
 * (`/v1/product/api/product`). Products live in QRPush, so fields beyond the ones
 * we read are passed through untyped. `metadata` is the caller-supplied custom
 * object (name, colours, etc.) — the API unwraps it from `metadata.custom`.
 */
export interface QrProduct {
  productId: string;
  redirect?: string;
  shortUrl?: string;
  url?: string;
  state?: string;
  createdAt?: number;
  updatedAt?: number;
  metadata?: QrProductMetadata | null;
}

export interface QrProductMetadata {
  name?: string;
  type?: string;
  targetType?: string;
  primaryColour?: string;
  bgColour?: string;
  [key: string]: unknown;
}

export interface QrPermission {
  tier?: string;
  active?: boolean;
  analytics?: boolean;
  productTotal?: number;
  productLimit?: number;
  productActiveTotal?: number;
  productActiveLimit?: number;
}

export interface CreateProductInput {
  redirect: string;
  metadata?: QrProductMetadata;
  state?: string;
}

export interface UpdateProductInput {
  redirect?: string;
  metadata?: QrProductMetadata;
  state?: string;
}

export type AnalyticsType = 'interactions' | 'locations' | 'devices';
export type AnalyticsPeriod = 'week' | 'month' | 'year';

/**
 * Analytics queries run asynchronously (Athena behind QRPush): the endpoint returns
 * the query state and callers poll until SUCCEEDED. Row totals are numeric strings.
 */
export interface AnalyticsResponse {
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  results: AnalyticsRow[];
  updatedAt?: number;
}

export interface AnalyticsRow {
  total: string;
  date?: string;
  hour?: string;
  country?: string;
  browser?: string;
  vendor?: string;
  model?: string;
  os?: string;
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  result?: T | null;
  status?: number;
}

/** Thrown for any non-successful API response, with a user-facing message. */
export class QrCakeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'QrCakeApiError';
  }
}

const PRODUCT_PATH = '/v1/product/api/product';
const PERMISSION_PATH = '/v1/product/api/permission';
const ANALYTICS_PATH = '/v1/analytic/api/analytics';

/** Turns a raw backend error into a message an assistant can relay usefully. */
function friendlyError(status: number, rawMessage: string): string {
  const message = rawMessage.toLowerCase();
  if (status === 401 || status === 403) {
    if (/analytics access requires/.test(message)) {
      return 'Scan analytics needs a QR Cake plan that includes analytics. Upgrade at qrcake.com/prices.';
    }
    if (/product limit reached|productlimit|invalid permissions/.test(message)) {
      return "You've reached your QR Cake plan's QR code limit. Upgrade at qrcake.com/prices to add more.";
    }
    if (/active product limit/.test(message)) {
      return "You've reached your plan's active QR code limit. Upgrade or deactivate a code to add more.";
    }
    return 'Your QR Cake API key was rejected or lacks permission. Check the key in the connector configuration.';
  }
  if (status === 404) {
    return "That QR code doesn't exist, or it belongs to a different account.";
  }
  return rawMessage || `QR Cake request failed (HTTP ${status}).`;
}

export class QrCakeClient {
  constructor(private readonly config: QrCakeConfig) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T | null> {
    let response: Response;
    try {
      response = await fetch(`${this.config.apiUrl}${path}`, {
        method,
        headers: {
          'x-api-key': this.config.apiKey,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (cause) {
      throw new QrCakeApiError(
        `Could not reach QR Cake at ${this.config.apiUrl}. ${cause instanceof Error ? cause.message : ''}`.trim(),
        0,
      );
    }

    let parsed: ApiEnvelope<T> | null = null;
    try {
      parsed = (await response.json()) as ApiEnvelope<T>;
    } catch {
      parsed = null;
    }

    if (!response.ok || parsed?.success === false) {
      const rawMessage = parsed?.message || response.statusText;
      throw new QrCakeApiError(friendlyError(response.status, rawMessage), response.status);
    }

    return parsed?.result ?? null;
  }

  async createProduct(input: CreateProductInput): Promise<QrProduct> {
    const product = await this.request<QrProduct>('POST', PRODUCT_PATH, {
      redirect: input.redirect,
      ...(input.state ? { state: input.state } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {}),
      options: { forwarding: true, forwardIdentifier: true },
    });
    if (!product?.productId) {
      throw new QrCakeApiError('QR Cake created the code but returned no details. Try listing your codes.', 0);
    }
    return product;
  }

  async listProducts(): Promise<QrProduct[]> {
    const products = await this.request<QrProduct[]>('GET', PRODUCT_PATH);
    return Array.isArray(products) ? products : [];
  }

  async getProduct(productId: string): Promise<QrProduct> {
    const product = await this.request<QrProduct>('GET', `${PRODUCT_PATH}/${encodeURIComponent(productId)}`);
    if (!product?.productId) {
      throw new QrCakeApiError("That QR code doesn't exist, or it belongs to a different account.", 404);
    }
    return product;
  }

  async updateProduct(productId: string, input: UpdateProductInput): Promise<QrProduct> {
    const product = await this.request<QrProduct>('PUT', `${PRODUCT_PATH}/${encodeURIComponent(productId)}`, {
      ...(input.redirect ? { redirect: input.redirect } : {}),
      ...(input.state ? { state: input.state } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {}),
    });
    if (!product?.productId) {
      throw new QrCakeApiError('QR Cake updated the code but returned no details.', 0);
    }
    return product;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.request<void>('DELETE', `${PRODUCT_PATH}/${encodeURIComponent(productId)}`);
  }

  async getPermission(): Promise<QrPermission> {
    const permission = await this.request<QrPermission>('GET', PERMISSION_PATH);
    return permission ?? {};
  }

  /**
   * Fetch scan analytics, polling while the backing Athena query is QUEUED/RUNNING.
   * Returns the last response either way — callers check `status`.
   */
  async getAnalytics(
    productId: string,
    type: AnalyticsType,
    period: AnalyticsPeriod,
    { maxWaitMs = 40_000, pollIntervalMs = 2_500 }: { maxWaitMs?: number; pollIntervalMs?: number } = {},
  ): Promise<AnalyticsResponse> {
    const path = `${ANALYTICS_PATH}/${encodeURIComponent(productId)}?type=${type}&periodicity=${period}`;
    const deadline = Date.now() + maxWaitMs;

    for (;;) {
      const response = await this.request<AnalyticsResponse>('GET', path);
      if (!response) {
        throw new QrCakeApiError('QR Cake returned no analytics data. Try again in a moment.', 0);
      }
      const pending = response.status === 'QUEUED' || response.status === 'RUNNING';
      if (!pending || Date.now() >= deadline) {
        return response;
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }

  /** The scannable short link a QR code encodes. */
  scanUrl(product: QrProduct): string | undefined {
    return product.shortUrl || product.url;
  }
}
