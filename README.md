# QR Cake MCP server, Claude plugin and API examples

[QR Cake](https://qrcake.com/) is a dynamic QR code generator. A QR Cake code points at a short link, so you can change where it goes after it is printed, [see how often and where it is scanned](https://qrcake.com/qr-code-tracking), and keep it working: [codes on the free plan do not expire](https://qrcake.com/qr-code-generator-no-expiry).

This repository holds everything needed to use QR Cake from an AI assistant or from your own code:

- setup for the hosted **MCP server** at `https://api.qrcake.com/mcp`
- the **QR Cake plugin for Claude** (`claude-plugin/`)
- **REST API examples** in curl, Node.js and Python (`examples/rest/`)

The server itself is hosted by QR Cake; there is nothing to run or deploy. Full reference: [QR Cake API and MCP docs](https://qrcake.com/docs).

## Connect an AI assistant

The server speaks MCP over Streamable HTTP. You sign in with your QR Cake account and approve what the assistant may do: read your codes, change your codes, read scan analytics. No API key or password goes into a chat.

### Claude

Install the QR Cake plugin, then connect your account when Claude asks.

In Claude Code, install it in one step:

```
/plugin install qrcake --marketplace scriptedtools/qrcake-mcp
```

In the Claude apps, install the plugin from Customize > Plugins.

The plugin adds the connector plus a skill and shortcuts such as `/qrcake:overview`, `/qrcake:create-qr`, `/qrcake:design-qr`, `/qrcake:report` and `/qrcake:help`. See [`claude-plugin/`](claude-plugin/).

### Claude Code

```sh
claude mcp add --transport http qrcake https://api.qrcake.com/mcp
```

Then run `/mcp` inside Claude Code and sign in.

### Cursor

In `~/.cursor/mcp.json`, or `.cursor/mcp.json` in a project:

```json
{
  "mcpServers": {
    "qrcake": {
      "url": "https://api.qrcake.com/mcp"
    }
  }
}
```

### VS Code

In `.vscode/mcp.json`:

```json
{
  "servers": {
    "qrcake": {
      "type": "http",
      "url": "https://api.qrcake.com/mcp"
    }
  }
}
```

The client opens the QR Cake sign-in the first time it connects. A connection lasts up to 30 days, after which the client asks you to sign in again.

Claude, Claude Code, Cursor and VS Code can connect. Other clients are not accepted yet.

## Tools

| Tool | What it does | Permission |
|---|---|---|
| `list_qr_codes` | List every QR code on the account with its short link, destination and state | Read codes |
| `get_qr_code` | Get one QR code by id | Read codes |
| `get_plan_limits` | Plan, codes used against the limit, whether analytics is included | Read codes |
| `create_qr_code` | Create a dynamic QR code whose short link redirects to a URL | Change codes |
| `update_qr_code` | Change a code's destination, state or content without reprinting it | Change codes |
| `delete_qr_code` | Delete a code permanently; printed copies stop working | Change codes |
| `create_file_upload` | Get an upload slot for a PDF, image, audio or video file to attach to a code | Change codes |
| `design_qr_code` | Open an interactive designer for a code in the conversation, to change its shapes, colours, logo and frame; apps that cannot show it get the code's details | Read codes and change codes |
| `get_qr_code_analytics` | Scans over time, locations and devices for one code, over a week, month or year (Pro and Business plans) | Read analytics |
| `render_qr_code` | Draw any text or URL as a plain QR image (PNG or SVG); nothing is stored | None |
| `build_qr_content` | Encode WiFi details, a contact card, an email, SMS, event, location and similar as QR text | None |
| `analyze_qr_design` | Estimate how much error correction a styled design uses up | None |

## Things you can ask

- "Create a QR code for https://example.com/menu called Summer menu."
- "Change Summer menu to point at https://example.com/autumn-menu."
- "How many scans did Summer menu get this month, and where were they from?"
- "Pause the Summer menu code."
- "Make a QR code for our dinner menu PDF."
- "Create codes for these ten links and tag them for the spring campaign."
- "Make the Summer menu code dark green with rounded dots and a Scan me frame."
- "Make a WiFi QR code for the network Cafe Guest."
- "Is the Summer menu code ready to print?"

## REST API

The REST API uses an API key instead of a sign-in. Create one in your QR Cake dashboard and send it in the `x-api-key` header. API keys work with the REST API only, not with the MCP server.

```sh
# List your QR codes
curl https://api.qrcake.com/v1/product/api/product \
  -H "x-api-key: $QRCAKE_API_KEY"

# Create a dynamic QR code for a URL
curl -X POST https://api.qrcake.com/v1/product/api/product \
  -H "x-api-key: $QRCAKE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"redirect": "https://example.com/menu", "metadata": {"type": "redirect"}}'

# Point it somewhere new; the printed code stays the same
curl -X PUT https://api.qrcake.com/v1/product/api/product/$PRODUCT_ID \
  -H "x-api-key: $QRCAKE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"redirect": "https://example.com/autumn-menu"}'
```

| Method and path | Purpose |
|---|---|
| `GET /product` | List QR codes |
| `GET /product/{productId}` | Get one QR code |
| `POST /product` | Create a QR code |
| `PUT /product/{productId}` | Update a QR code |
| `DELETE /product/{productId}` | Delete a QR code |
| `GET /permission` | Show what the API key may do |

Longer examples are in [`examples/rest/`](examples/rest/). The machine-readable spec is at [qrcake.com/openapi.json](https://qrcake.com/openapi.json).

## Plans and limits

The free plan includes up to 5 dynamic QR codes with unlimited scans, and the codes do not expire. Free-plan scans show a short ad before the destination. Scan analytics are part of the Pro and Business plans. The assistant works within your plan's limits and tells you when one is reached. Details: [QR Cake prices](https://qrcake.com/prices).

## Good to know

- A change reaches codes that are already printed straight away.
- Deleting a code is permanent: printed copies stop working.
- Images drawn in a chat are plain black on white. Colours, frames and logos are set in the designer or the [QR Cake editor](https://qrcake.com/), and print-ready downloads come from the editor.

## Links

- Website: [qrcake.com](https://qrcake.com/)
- API and MCP docs: [qrcake.com/docs](https://qrcake.com/docs)
- QR code tracking and scan analytics: [qrcake.com/qr-code-tracking](https://qrcake.com/qr-code-tracking)
- QR codes that do not expire: [qrcake.com/qr-code-generator-no-expiry](https://qrcake.com/qr-code-generator-no-expiry)
- Support: [qrcake.com/contact](https://qrcake.com/contact)

## Licence

[MIT](LICENSE) © Scripted Tools Ltd
