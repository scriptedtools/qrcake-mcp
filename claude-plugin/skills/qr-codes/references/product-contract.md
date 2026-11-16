# QR Cake product contract

The plugin prepares QR-specific product data. The QR Cake MCP server authenticates the customer, enforces ownership and plan limits, validates inputs and stores exactly the fields it is given. It does not choose a QR type, apply design defaults, merge metadata or stop an edit that would erase content.

Checked on 13 November 2026 against the QR Cake API and website. The website remains the source for new QR content types; do not guess how an unfamiliar type redirects.

## Tools

| Tool | Input | Result |
| --- | --- | --- |
| `get_plan_limits` | none | `{ tier, codes: { used, limit }, active: { used, limit }, analytics, domainLimit }` |
| `list_qr_codes` | none | every code the customer owns |
| `get_qr_code` | `id` | one code |
| `create_qr_code` | `redirect`, optional `state`, `metadata`, `uploads`, `options` | the saved code |
| `update_qr_code` | `id`, optional `redirect`, `state`, `metadata`, `uploads`, `options` | the saved code |
| `create_file_upload` | `fileName` | `{ key, url, upload, fields, type, maxSize }`: a one-hour permit to store one file |
| `delete_qr_code` | `id` | `Deleted {id}` |
| `design_qr_code` | `id` | one code, and the designer for it shown in the conversation where the app supports that |
| `get_qr_code_analytics` | `id`, `type`, `periodicity` | the analytics for that breakdown and window |
| `render_qr_code` | `text`, optional `format` (`png` or `svg`), `scale`, `margin`, `errorCorrectionLevel` | a PNG image or SVG markup, black on white |
| `build_qr_content` | `template: { type, ...fields }` | the text to encode |
| `analyze_qr_design` | `text`, optional `options` | `{ version, matrixSize, blocks, worstBlockHealth, blocksOverBudget, verdict, note }` |

A code is `{ id, scanUrl, redirect, state, metadata, createdAt, updatedAt }`. `id` is 10 characters. `scanUrl` is the permanent QR payload. The top-level `redirect` is where the short link really sends people; for a hosted or protected code it is QR Cake's own page, not the content URL in `metadata`. `options` and `uploads` are accepted on writes but are not returned; the files a code uses are read from the file objects in its `metadata`.

Which tools are present depends on the permissions the customer approved when connecting: reading codes, changing codes (which includes `create_file_upload`), and reading analytics. `design_qr_code` needs both reading and changing codes. The three image and content tools are always present.

A refused call comes back as an error with the backend's own message, for example a plan limit. Any other failure is the generic `Request failed`; treat that as an uncertain result and check the account before writing again.

## How updates behave

- `redirect`, `state` and `options`: an omitted field keeps its stored value.
- `metadata`: **the value sent replaces the stored value completely.** There is no merge. Sending `{ "name": "New name" }` leaves the code with a name and nothing else: its type, design, hosted content, password and custom domain are gone.
- `uploads`: omitted, the stored list of files is kept. **A list that is sent replaces the stored list, and a file that drops off it is deleted for good.** Send it only when a file is added, replaced or removed, and then list every file in the metadata. The rules are in [files on a QR code](uploads.md).

So:

1. Call `get_qr_code` first.
2. To change anything inside `metadata`, send the entire object that was returned, with only the intended key changed. Keep every other key and value exactly as read, including ones this plugin does not understand.
3. To change only `state` (or only `redirect` on a code whose metadata needs no change), leave `metadata` out of the call. Leave `uploads` out of every call that does not change a file.
4. Compare the `metadata` in the result with what was read. If a key is missing or different, send the original object again with the intended change and tell the customer.

`metadata` may hold up to 32 KiB. If the object is too large to send back exactly, do not attempt the edit: give the customer the editor link.

## New plain URL code

Check the destination is HTTP or HTTPS and has no embedded credentials. Use the final URL in both places below. Replace the example name and URL with the customer's values. Omit `state` to get the normal active default.

```json
{
  "redirect": "https://example.com/menu",
  "metadata": {
    "name": "Menu",
    "type": "redirect",
    "redirect": "https://example.com/menu",
    "primaryColour": "#000000",
    "eyeColour": "#000000",
    "bgColour": "#FFFFFF",
    "logoHeight": 40,
    "logoWidth": 40,
    "style": "square",
    "errorCorrectionLevel": "Q",
    "colour1": "#262262",
    "colour2": "#262262",
    "colour3": "#c5abdb",
    "colour4": "#ffffff",
    "colour5": "#262262",
    "colour6": "#ffffff",
    "removeQrCodeBehindLogo": false,
    "pageStyle": "Rounded"
  },
  "options": { "forwarding": false }
}
```

These are the website's defaults for a new code. Never apply them to an existing code. Hosted and protected codes route through the website's own page with forwarding enabled: the text-and-link kinds are covered in [hosted pages](hosted-pages.md), codes that open a file in [file codes](file-codes.md), and logos and photos in [files on a QR code](uploads.md). Password protection belongs in the editor.

## Pause or reactivate any owned code

```json
{ "id": "AbCdEf0123", "state": "INACTIVE" }
```

Use `ACTIVE` to reactivate. Use the exact state values the tool lists. No `metadata` is sent, so nothing else changes.

## Rename any owned code

Fetch it, then send its complete metadata with the new name. The example shows a plain URL code; a hosted code's object is longer and every key of it must be sent.

```json
{
  "id": "AbCdEf0123",
  "metadata": {
    "name": "Dinner menu",
    "type": "redirect",
    "redirect": "https://example.com/menu",
    "primaryColour": "#000000",
    "eyeColour": "#000000",
    "bgColour": "#FFFFFF",
    "logoHeight": 40,
    "logoWidth": 40,
    "style": "square",
    "errorCorrectionLevel": "Q",
    "colour1": "#262262",
    "colour2": "#262262",
    "colour3": "#c5abdb",
    "colour4": "#ffffff",
    "colour5": "#262262",
    "colour6": "#ffffff",
    "removeQrCodeBehindLogo": false,
    "pageStyle": "Rounded"
  }
}
```

## Change a plain URL destination

Fetch the current code. Change the destination here only when all of these hold:

- `metadata.type` equals `redirect`.
- `metadata.passwordProtected` is not true, and `metadata.password` is absent or empty.
- The top-level `redirect` is exactly equal to `metadata.redirect`.

The last check is what identifies a plain code. It fails for a protected or hosted code (the short link goes to QR Cake's page) and for a code with campaign tracking (the short link carries tags). A tracked code is changed by the rules in [campaign tracking](campaign-tracking.md). For any other failure, give the customer the editor link and do not try to repair the configuration.

For an eligible code, validate the new HTTP(S) URL, then send it as `redirect` together with the complete metadata, changing only `metadata.redirect`. Omit `state` and `options`.

```json
{
  "id": "AbCdEf0123",
  "redirect": "https://example.com/dinner",
  "metadata": {
    "name": "Menu",
    "type": "redirect",
    "redirect": "https://example.com/dinner",
    "primaryColour": "#000000",
    "eyeColour": "#000000",
    "bgColour": "#FFFFFF",
    "logoHeight": 40,
    "logoWidth": 40,
    "style": "square",
    "errorCorrectionLevel": "Q",
    "colour1": "#262262",
    "colour2": "#262262",
    "colour3": "#c5abdb",
    "colour4": "#ffffff",
    "colour5": "#262262",
    "colour6": "#ffffff",
    "removeQrCodeBehindLogo": false,
    "pageStyle": "Rounded"
  }
}
```

## Delete

```json
{ "id": "AbCdEf0123" }
```

Permanent. Confirm the exact code with the customer first.

## Scan analytics

```json
{ "id": "AbCdEf0123", "type": "interactions", "periodicity": "month" }
```

The result is `{ results, status, updatedAt }`. `status` is `QUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED` or `CANCELLED`; only `SUCCEEDED` carries finished figures. `updatedAt` is when the figures were last refreshed. Each entry of `results` depends on `type`, and `total` is usually a number written as text:

| `type` | An entry of `results` |
| --- | --- |
| `interactions` | `{ date, total }`, sometimes with `hour`; `date` is `YYYY-MM-DD` |
| `locations` | `{ country, total }`; `country` is a two-letter code |
| `geo` | `{ country, region, city, latitude, longitude, total }`; at most 500 places, busiest first, coordinates rounded to about 1 km. Only scans that could be placed are included, so the sum can be lower than the country totals |
| `devices` | `{ browser, os, vendor, model, total }` |

The windows are the last week, month or year. A code the customer does not own answers "Product not found". A plan without analytics answers "Analytics access requires a subscription".

## One-off content

`build_qr_content` nests its fields under `template`, with `type` one of `wifi`, `vcard`, `mecard`, `email`, `sms`, `phone`, `event`, `geo`, `url`, `bitcoin`, `whatsapp`, `maps` or `facetime`; the tool's own schema lists each type's fields.

```json
{ "template": { "type": "wifi", "ssid": "Cafe Guest", "password": "example-pass", "encryption": "WPA" } }
```

Pass the returned text to `render_qr_code`. `scale` is 1 to 10 pixels per module and `margin` 1 to 16 modules. The image is always black on white; colours, logos and frames come from the editor. Nothing is saved to the account.

## After any write

Show the customer the name, the destination, the scan link and the editor link (`https://qrcake.com/create/{id}`). Write each as a Markdown link with the full address inside the parentheses, never as a bare address: an id can end in `_`, which chat apps drop from a bare address. Never offer the editor link as the thing to print or scan. A timeout is not proof of failure: inspect the account before any further write.
