export interface QrCakeConfig {
  apiKey: string;
  apiUrl: string;
  webUrl: string;
}

const DEFAULT_API_URL = 'https://api.qrcake.com';
const DEFAULT_WEB_URL = 'https://qrcake.com';

const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

/**
 * Reads connector configuration from the environment. The only required value is
 * an API key, which the user creates in their QR Cake dashboard. API URL and web
 * URL default to production but can be pointed at dev for testing.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): QrCakeConfig {
  const apiKey = env.QRCAKE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'QRCAKE_API_KEY is not set. Create an API key in your QR Cake dashboard and set it in the connector configuration.',
    );
  }

  return {
    apiKey,
    apiUrl: stripTrailingSlash(env.QRCAKE_API_URL?.trim() || DEFAULT_API_URL),
    webUrl: stripTrailingSlash(env.QRCAKE_WEB_URL?.trim() || DEFAULT_WEB_URL),
  };
}
