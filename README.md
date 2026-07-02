# QR Cake connector for Claude

An [MCP](https://modelcontextprotocol.io) server that lets Claude create and manage
**dynamic** QR Cake QR codes from a conversation. Because the codes are dynamic, the
destination can be changed later without reprinting — so Claude can make a code now
and repoint it next week.

## Tools

| Tool | What it does |
| --- | --- |
| `create_qr_code` | Create a dynamic QR code pointing to a URL (optional name + colours). |
| `list_qr_codes` | List the account's QR codes with destinations and scan links. |
| `get_qr_code` | Get one code's details by id. |
| `update_qr_destination` | Change where an existing code points. The printed code is unchanged. |
| `delete_qr_code` | Permanently delete a code. |
| `get_account` | Show plan tier, usage, and limit. |
| `get_qr_analytics` | Scan analytics: per-day counts, countries, or devices over a week/month/year. |

`get_qr_analytics` needs a QR Cake plan with analytics, and a backend deployment that
includes the `/v1/analytic/api` route (analytic-service + gateway-service). The query is
async on the backend; the tool polls for up to ~40s and asks Claude to retry if the
query is still running.

## Prerequisites

- Node.js 20 or newer.
- A QR Cake account and an **API key**. Create one in your dashboard under
  **API Keys** ([qrcake.com/dashboard/api](https://qrcake.com/dashboard/api)). The key
  is sent as the `x-api-key` header; it scopes every action to your account.

## Install and build

```bash
npm install
npm run build
```

## Configuration

The server is configured entirely through environment variables:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `QRCAKE_API_KEY` | yes | — | Your QR Cake API key. |
| `QRCAKE_API_URL` | no | `https://api.qrcake.com` | API base URL. Point at dev to test. |
| `QRCAKE_WEB_URL` | no | `https://qrcake.com` | Website base, used for dashboard links. |

## Add it to Claude

### Claude Desktop — one-click extension (.mcpb)

Build the desktop extension bundle:

```bash
npm run bundle:mcpb
```

This produces `dist-mcpb/qrcake-<version>.mcpb` (manifest + single-file server, validated
with the official `mcpb` CLI). Double-click it, or in Claude Desktop go to
Settings → Extensions → Install extension, then paste your API key when prompted.
The key is stored by Claude Desktop in the OS keychain.

### Claude Code (CLI)

```bash
claude mcp add qrcake \
  --env QRCAKE_API_KEY=your-api-key-here \
  -- node /absolute/path/to/qrcake-mcp/dist/index.js
```

### Claude Desktop

Add this to your `claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "qrcake": {
      "command": "node",
      "args": ["/absolute/path/to/qrcake-mcp/dist/index.js"],
      "env": {
        "QRCAKE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Restart Claude Desktop after saving. See [`claude-config.example.json`](./claude-config.example.json).

## Example prompts

- "Create a QR code for my new landing page at https://example.com/launch and call it Launch Poster."
- "The launch page moved — point my Launch Poster code at https://example.com/live instead."
- "List my QR codes and show where each one points."
- "How many QR codes am I using on my plan?"

## Testing against dev

Point the connector at the dev environment by setting
`QRCAKE_API_URL=https://api.dev.qrcake.com` and using a dev-account API key. Everything
else is identical.

## Roadmap

- **QR image rendering** — return a rendered PNG/SVG of the code, not just the scan link.
- **File QR codes** — point a code at an uploaded file (PDF, image) via the upload flow.
- **Remote / hosted connector** with OAuth "connect your account", so it can be listed in
  the Claude connector directory instead of configured with a pasted key.

## How it works

The connector is a thin adapter over QR Cake's public API-key REST API
(`/v1/product/api/*`, documented at [qrcake.com/openapi.json](https://qrcake.com/openapi.json)).
Products live in QRPush; the connector never stores anything itself.

## Privacy Policy

QR Cake's privacy policy: **<https://qrcake.com/privacy>**

Connector-specific data handling:

- **What it collects**: nothing. The connector runs locally and keeps no data of its own —
  no logs, no telemetry, no analytics.
- **Where data goes**: tool calls are sent directly from your machine to the QR Cake API
  (`api.qrcake.com`) over HTTPS, authenticated with your API key. No third parties are
  contacted.
- **What QR Cake receives**: the QR code operations you ask for (destinations, names,
  colours) — the same data as using the QR Cake dashboard. Handling and retention are
  governed by the [QR Cake privacy policy](https://qrcake.com/privacy).
- **Credential storage**: your API key is stored by the Claude client (in Claude Desktop,
  the OS keychain via the extension's sensitive config), never by this connector. Revoke
  it anytime in the dashboard under API Keys.
- **Contact**: <support@qrcake.com>.
