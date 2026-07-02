#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { QrCakeClient, QrCakeApiError, type AnalyticsRow, type QrProduct } from './api.js';
import { loadConfig } from './config.js';

const HEX_COLOUR = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const config = loadConfig();
const client = new QrCakeClient(config);

const server = new McpServer({ name: 'qrcake', version: '0.1.0' });

type ToolResult = {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
};

const text = (value: string): ToolResult => ({ content: [{ type: 'text', text: value }] });

/** Runs a tool body, turning QR Cake errors into a clean assistant-facing message. */
async function run(body: () => Promise<ToolResult>): Promise<ToolResult> {
  try {
    return await body();
  } catch (error) {
    const message =
      error instanceof QrCakeApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Unexpected error talking to QR Cake.';
    return { content: [{ type: 'text', text: message }], isError: true };
  }
}

function describeProduct(product: QrProduct): string {
  const name = product.metadata?.name?.trim() || '(unnamed)';
  const scan = client.scanUrl(product);
  const lines = [
    `- ${name} (id: ${product.productId})`,
    scan ? `  scan: ${scan}` : undefined,
    product.redirect ? `  points to: ${product.redirect}` : undefined,
    product.state ? `  status: ${product.state}` : undefined,
  ];
  return lines.filter(Boolean).join('\n');
}

server.registerTool(
  'create_qr_code',
  {
    title: 'Create a dynamic QR code',
    description:
      'Create a dynamic QR Cake QR code that points to a URL. Dynamic means the destination can be changed later ' +
      'with update_qr_destination without reprinting the code. Returns the scannable short link and the code id.',
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    inputSchema: {
      destination_url: z.string().url().describe('The URL the QR code should point to (where a scan lands).'),
      name: z.string().max(120).optional().describe('A label to identify this code in the dashboard.'),
      dark_color: z
        .string()
        .regex(HEX_COLOUR)
        .optional()
        .describe('Hex colour for the QR modules, e.g. "#111827".'),
      light_color: z
        .string()
        .regex(HEX_COLOUR)
        .optional()
        .describe('Hex background colour, e.g. "#ffffff".'),
    },
  },
  async ({ destination_url, name, dark_color, light_color }) =>
    run(async () => {
      const label = name?.trim() || 'Claude QR Code';
      const product = await client.createProduct({
        redirect: destination_url,
        metadata: {
          name: label,
          type: 'redirect',
          targetType: 'website',
          ...(dark_color ? { primaryColour: dark_color } : {}),
          ...(light_color ? { bgColour: light_color } : {}),
        },
      });
      const scan = client.scanUrl(product);
      return text(
        [
          `Created QR code "${product.metadata?.name ?? label}".`,
          scan ? `Scan link (this is what the QR encodes): ${scan}` : undefined,
          `Code id: ${product.productId}`,
          `Points to: ${product.redirect ?? destination_url}`,
          `You can change where it points anytime with update_qr_destination — the printed code stays the same.`,
          `Manage it in your dashboard: ${config.webUrl}/dashboard`,
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }),
);

server.registerTool(
  'list_qr_codes',
  {
    title: 'List QR codes',
    description: 'List the QR codes on the connected QR Cake account, with their destinations and scan links.',
    annotations: { readOnlyHint: true, openWorldHint: false },
    inputSchema: {},
  },
  async () =>
    run(async () => {
      const products = await client.listProducts();
      if (products.length === 0) {
        return text('No QR codes yet. Use create_qr_code to make your first one.');
      }
      const body = products.map(describeProduct).join('\n');
      return text(`You have ${products.length} QR code${products.length === 1 ? '' : 's'}:\n${body}`);
    }),
);

server.registerTool(
  'get_qr_code',
  {
    title: 'Get a QR code',
    description: 'Get the details of a single QR code by its id, including its current destination and scan link.',
    annotations: { readOnlyHint: true, openWorldHint: false },
    inputSchema: {
      product_id: z.string().describe('The QR code id (returned by create_qr_code / list_qr_codes).'),
    },
  },
  async ({ product_id }) =>
    run(async () => {
      const product = await client.getProduct(product_id);
      return text(describeProduct(product));
    }),
);

server.registerTool(
  'update_qr_destination',
  {
    title: 'Update a QR code destination',
    description:
      'Change where an existing QR code points. The physical/printed code is unchanged — only the destination URL ' +
      'updates. This is the core benefit of dynamic QR codes.',
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      product_id: z.string().describe('The QR code id to update.'),
      destination_url: z.string().url().describe('The new URL the QR code should point to.'),
    },
  },
  async ({ product_id, destination_url }) =>
    run(async () => {
      const product = await client.updateProduct(product_id, { redirect: destination_url });
      return text(
        [
          `Updated. QR code ${product.productId} now points to ${product.redirect ?? destination_url}.`,
          `The printed code and its scan link are unchanged.`,
        ].join('\n'),
      );
    }),
);

server.registerTool(
  'delete_qr_code',
  {
    title: 'Delete a QR code',
    description:
      'Permanently delete a QR code. After this, scanning the printed code will no longer resolve. This cannot be undone.',
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      product_id: z.string().describe('The QR code id to delete.'),
    },
  },
  async ({ product_id }) =>
    run(async () => {
      await client.deleteProduct(product_id);
      return text(`Deleted QR code ${product_id}. Scans of the printed code will no longer resolve.`);
    }),
);

server.registerTool(
  'get_account',
  {
    title: 'Get account plan and usage',
    description: 'Show the connected QR Cake account plan tier, how many QR codes are used, and the plan limit.',
    annotations: { readOnlyHint: true, openWorldHint: false },
    inputSchema: {},
  },
  async () =>
    run(async () => {
      const permission = await client.getPermission();
      const tier = permission.tier ?? 'free';
      const used = permission.productTotal ?? 0;
      const limit = permission.productLimit ?? 0;
      return text(
        [
          `Plan: ${tier}`,
          `QR codes used: ${used}${limit ? ` of ${limit}` : ''}`,
          `Analytics enabled: ${permission.analytics ? 'yes' : 'no'}`,
          used >= limit && limit > 0 ? `You're at your limit — upgrade at ${config.webUrl}/prices to add more.` : undefined,
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }),
);

const sumTotals = (rows: AnalyticsRow[]): number =>
  rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);

/** Aggregates rows by a key and renders "label: n" lines, largest first. */
function topLines(rows: AnalyticsRow[], keyOf: (row: AnalyticsRow) => string, limit: number): string[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = keyOf(row);
    counts.set(key, (counts.get(key) ?? 0) + (Number(row.total) || 0));
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => `  ${label}: ${count}`);
}

server.registerTool(
  'get_qr_analytics',
  {
    title: 'Get QR code scan analytics',
    description:
      'Get scan analytics for a QR code: total scans and a per-day breakdown (interactions), scan counts by ' +
      'country (locations), or by device/OS/browser (devices), over the last week, month, or year. Requires a ' +
      'QR Cake plan with analytics. The query runs asynchronously — if results are still being computed, ' +
      'call the tool again shortly.',
    annotations: { readOnlyHint: true, openWorldHint: false },
    inputSchema: {
      product_id: z.string().describe('The QR code id to get analytics for.'),
      type: z
        .enum(['interactions', 'locations', 'devices'])
        .optional()
        .describe('What to break scans down by. Default: interactions (scans over time).'),
      period: z.enum(['week', 'month', 'year']).optional().describe('Time window. Default: month.'),
    },
  },
  async ({ product_id, type, period }) =>
    run(async () => {
      const analyticsType = type ?? 'interactions';
      const analyticsPeriod = period ?? 'month';
      const response = await client.getAnalytics(product_id, analyticsType, analyticsPeriod);

      if (response.status === 'QUEUED' || response.status === 'RUNNING') {
        return text(
          'The analytics query is still being computed. Ask for the analytics again in about 30 seconds.',
        );
      }
      if (response.status !== 'SUCCEEDED') {
        return {
          content: [{ type: 'text', text: `The analytics query ${response.status.toLowerCase()}. Try again in a moment.` }],
          isError: true,
        };
      }

      const rows = response.results ?? [];
      const total = sumTotals(rows);
      const header = `${total} scan${total === 1 ? '' : 's'} in the last ${analyticsPeriod} for QR code ${product_id}.`;
      if (rows.length === 0 || total === 0) {
        return text(`No scans recorded in the last ${analyticsPeriod} for QR code ${product_id}.`);
      }

      let breakdown: string[];
      if (analyticsType === 'interactions') {
        breakdown = ['By day:', ...topLines(rows, (row) => row.date ?? 'unknown', 400).sort()];
      } else if (analyticsType === 'locations') {
        breakdown = ['By country:', ...topLines(rows, (row) => row.country ?? 'unknown', 15)];
      } else {
        breakdown = ['By device:', ...topLines(rows, (row) => `${row.os ?? 'unknown'} · ${row.browser ?? 'unknown'}`, 15)];
      }

      return text([header, ...breakdown].join('\n'));
    }),
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr is safe for logging; stdout is reserved for the MCP protocol stream.
  process.stderr.write(`QR Cake MCP server running (api: ${config.apiUrl}).\n`);
}

main().catch((error) => {
  process.stderr.write(`Fatal: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
