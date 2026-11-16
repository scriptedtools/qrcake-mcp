# Campaign tracking

Campaign tracking adds `utm_` tags to the link a code sends people to, so its scans show up in the customer's own analytics tool, such as Google Analytics, under a source, medium and campaign. It is separate from QR Cake's scan analytics, works on every plan, and applies only to plain link codes (`metadata.type` is `redirect`). Use it when the customer asks for campaign tags, UTM tags or parameters, or to see scans in Google Analytics.

The website stores the tags in the code's metadata and keeps the clean link there too. This plugin does the same, so the code opens correctly in the editor.

## How a tracked code is stored

- `metadata.redirect`: the clean link, exactly as the customer gave it.
- `metadata.utmEnabled`: `true`.
- `metadata.utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`: only the ones the customer chose. Leave the others out.
- Top-level `redirect`: the clean link with the tags added. This is where the short link really goes.

## Building the tagged link

1. Start from the clean link. Remove any `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` and `utm_term` already on it. Keep every other parameter, in order.
2. Add, in this order, after the remaining parameters:
   - `utm_source`: the customer's value, or `qr-code`.
   - `utm_medium`: the customer's value, or `qr`.
   - `utm_campaign`: the customer's value, or the code's name in lower case with every run of other characters turned into one dash and no dash at either end (at most 60 characters). Leave it out if that gives nothing.
   - `utm_content` and `utm_term`: only when the customer gave them.
3. A link with no path gets a `/` before the `?`: `https://example.com` becomes `https://example.com/?utm_source=...`. A `#fragment` stays at the very end.
4. Prefer values made of lower-case letters, digits and dashes. Anything else must be percent-encoded, with a space written as `+`.

## Create a tracked code

Everything in the plain URL payload from [the product contract](product-contract.md), with the tags added:

```json
{
  "redirect": "https://example.com/menu?utm_source=qr-code&utm_medium=qr&utm_campaign=spring-menu&utm_content=table-tent",
  "metadata": {
    "name": "Spring menu",
    "type": "redirect",
    "redirect": "https://example.com/menu",
    "utmEnabled": true,
    "utmCampaign": "spring-menu",
    "utmContent": "table-tent",
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

Tell the customer the tags that were set, including the defaults, so they know what to look for in their analytics.

## Change a tracked code

Call `get_qr_code` first. A code is a tracked plain link code when all of these hold:

- `metadata.type` equals `redirect`, and `metadata.utmEnabled` is true.
- `metadata.passwordProtected` is not true, and `metadata.password` is absent or empty.
- The top-level `redirect`, with its five `utm_` parameters removed, is the same link as `metadata.redirect`. A `/` added before the `?` on a link with no path does not count as a difference.

If any check fails, give the editor link (`https://qrcake.com/create/{id}`) and change nothing. Otherwise, always sending the complete metadata as the skill requires:

- **New destination:** set `metadata.redirect` to the new clean link and the top-level `redirect` to the new link with the same tags.
- **Different tags:** change the `utm` keys in the metadata and rebuild the top-level `redirect` from `metadata.redirect`.
- **Tracking off:** set `metadata.utmEnabled` to false and the top-level `redirect` to `metadata.redirect`. Leave the other `utm` keys as they are.

## Turn tracking on for an existing code

Only for a code that passes every plain URL check in the product contract. Send the complete metadata with `utmEnabled` true and the chosen tags added, and the top-level `redirect` set to the tagged form of `metadata.redirect`.

Printed copies keep working through every one of these changes: only where the short link leads is different.
