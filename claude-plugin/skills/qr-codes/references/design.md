# Design a code from a description

Use this when the customer describes the look they want in words: "make it navy", "rounded dots", "put the Instagram logo in the middle", "add a Scan me frame", "match our brand colour". Claude writes the design; the customer does not have to open anything. To let the customer adjust the look by hand, open the designer instead: see "Design a code" in the skill.

The design is a set of keys inside the code's `metadata`. The rule from the product contract applies in full: **an update's `metadata` replaces everything stored for the code.** Every design change is therefore: call `get_qr_code`, copy the whole `metadata` object, change only the design keys below, send the whole object with `update_qr_code`, then compare the returned `metadata` with what was read.

A design change never touches `redirect`, `state`, `name`, `type`, hosted content, `password` or `domain`. It does not change the short link, so codes already printed keep working. They also keep the look they were printed with: only a newly downloaded image shows the new design.

## Before writing

1. Find the code and read it with `get_qr_code`.
2. Turn the request into exact values from the tables below. Use only the keys and values listed here. A value that is not listed is drawn as the default or not at all.
3. A clear request ("make the code dark green") authorizes the change. A vague one ("make it look nicer", "something more modern") does not: propose one concrete design in a sentence and wait for a yes.
4. For a brand colour, ask for the hex code when the customer names only the brand. Do not guess a company's colours.
5. Run the checks under "Checks before saving". If one fails, do not write: say why and offer the nearest design that passes.

## Dots

`style` is the shape of the small squares that make up the code.

| The customer says | `style` |
| --- | --- |
| square, classic, standard | `square` |
| rounded, soft, connected | `rounded` |
| dots, circles, dotted | `dots` |
| fluid, organic, blobs | `fluid` |

## Corners

The three large corner squares are stored in one of two ways. Write exactly one of them and delete the keys of the other from the object.

**A shape.** Set `eyeOuterStyle` and `eyeInnerStyle` to the same value and delete `eyeStyle`.

| The customer says | Both keys |
| --- | --- |
| square | `square` |
| slightly rounded | `rounded` |
| round, circular | `round` |
| diamond | `diamond` |
| leaf | `leaf` |

**A pattern**, where the corners are drawn out of the same dots as the code. Set `eyeStyle` to `dots` or `fluid` and delete `eyeOuterStyle`, `eyeInnerStyle` and `eyeInnerColour`.

Always write the frame and the centre of the corner as the same shape. Mixed pairs are where codes stop scanning: a diamond with any other shape, and a square with a round, cannot be read.

## Colours

Write every colour as `#RRGGBB` in capitals.

| Key | What it colours |
| --- | --- |
| `primaryColour` | the code |
| `bgColour` | the background |
| `eyeColour` | the corners; when the customer recolours the whole code, set it to the same value as `primaryColour` |
| `eyeInnerColour` | the centre of each corner; only with shape corners, and only when the customer asks for a different centre |

- Keep the code darker than the background. A light code on a dark background does not scan on many phones: if the customer asks for one, say so and offer the same colours the other way round.
- A transparent background is `"bgColour": "#00000000"`. It cannot be combined with a logo behind the code. Tell the customer the result then depends on what it is printed on.
- **Gradient.** Set `gradient` to `{ "type": "linear", "colorStart": "#RRGGBB", "colorEnd": "#RRGGBB", "direction": "diagonal" }`. `type` is `linear` or `radial`. `direction` is `horizontal` (left to right), `vertical` (top to bottom), `diagonal` (down) or `diagonal-reverse` (up), and is left out for `radial`. Keep any other key already inside `gradient`. To remove a gradient, delete the `gradient` key. Both gradient colours must pass the contrast check against the background.

## Margin and durability

- `margin` is the quiet space around the code: a whole number from 0 to 10. 4 is used when the key is absent. Do not go below 2 unless the customer asks for it or a frame supplies the space.
- `errorCorrectionLevel` is how much of the code can be damaged or covered and still scan: `L` (about 7%), `M` (15%), `Q` (25%) or `H` (30%). Use `Q` or `H` whenever a logo covers part of the code. A higher level makes the squares smaller, so do not raise it without a reason.

## Logo in the middle

A built-in logo needs no file. Set `logoImage` to one of these objects exactly, and `"showLogoImage": true`:

| Logo | `id` | `url` | `type` |
| --- | --- | --- | --- |
| Facebook | `preset-facebook` | `https://qrcake.com/logo-presets/facebook.webp?v=2` | `image/webp` |
| PayPal | `preset-paypal` | `https://qrcake.com/logo-presets/paypal.png?v=2` | `image/png` |
| Menu | `preset-menu` | `https://qrcake.com/logo-presets/menu.png` | `image/png` |
| Instagram | `preset-instagram` | `https://qrcake.com/logo-presets/instagram.webp` | `image/webp` |
| LinkedIn | `preset-linkedin` | `https://qrcake.com/logo-presets/linkedin.png?v=2` | `image/png` |
| Bitcoin | `preset-bitcoin` | `https://qrcake.com/logo-presets/bitcoin.png` | `image/png` |
| Ethereum | `preset-ethereum` | `https://qrcake.com/logo-presets/ethereum.png?v=2` | `image/png` |
| Scan Me | `preset-scan-me` | `https://qrcake.com/logo-presets/scan-me.png` | `image/png` |
| Scan icon | `preset-scan-icon` | `https://qrcake.com/logo-presets/scan-icon.png` | `image/png` |

A built-in logo is not a file of the customer's: its `id` never goes in `uploads`.

The customer's own logo is a file. Follow [files on a QR code](uploads.md) to add, replace or remove it, including when a built-in logo would replace a logo they uploaded: that removes their file, which needs their confirmation first.

- **Hide the logo** without removing it: `"showLogoImage": false`. Leave `logoImage` in place.
- **Size**: `logoHeight` and `logoWidth`, always the same number, from 0 to 80. 40 is half of the largest size. Stay at 40 or below unless the customer asks for a bigger logo, and say that a bigger logo covers more of the code.
- **Clear the code behind the logo**: `"removeQrCodeBehindLogo": true`, with `logoPaddingStyle` `square` or `circle` for the cleared shape and `logoPadding` from 0 to 10 for the space around the logo.
- **Logo behind the code**, where the whole code is drawn over a large, faded logo: `"logoUnderlay": true` and `"removeQrCodeBehindLogo": false`. The background must be a solid colour: if `bgColour` is transparent, set it to `#FFFFFF`. `logoUnderlaySize` is how much of the code the logo fills, from 0.25 to 0.9 in steps of 0.05. To turn it off, set `"logoUnderlay": false`.

## Frame

`frameStyle` draws a frame around the code. `frameText` is its caption.

| The customer says | `frameStyle` | Caption |
| --- | --- | --- |
| a border, an outline | `border` | none |
| a card | `card` | yes |
| a caption or banner below | `band` | yes |
| a caption or banner above | `bandTop` | yes |

- For a frame with a caption, write `frameText`. When the customer gives no words, use `SCAN ME`.
- The caption is one short line and is cut off when it is too long: about 15 average letters fit. Wide letters such as W and M count for more, and Chinese, Japanese and Korean characters count for almost two. Shorten a longer caption and tell the customer what was used.
- To remove a frame, delete the `frameStyle` key. `frameText` can stay.

## Checks before saving

1. **Contrast.** Work out the contrast ratio between `primaryColour` and `bgColour`, and between each corner colour and `bgColour`, with the method in [the print check](print-check.md). Below 3 the code will not scan: do not save it. Between 3 and 4 it is on the edge: save it only after saying so. With a gradient, check both of its colours.
2. **Corners.** The frame and the centre of the corner are the same shape, or the corners are a pattern.
3. **Logo.** When a logo covers part of the code, `errorCorrectionLevel` is `Q` or `H`.
4. **Nothing else changed.** Every key that is not part of the request is exactly as it was read, including `password`.

## After saving

1. Say what changed in plain words, one line per change, with the colours as hex codes.
2. Show the result. The image tools here draw plain black on white, so never present a `render_qr_code` image as the new design. When `design_qr_code` is available, call it now with the code's `id`: the designer opens on the saved design, and the customer can adjust it there. Always add the editor link, where the styled image is downloaded: `[Open in the editor](https://qrcake.com/create/{id})`.
3. Say that codes already printed still work and keep their old look.
4. Offer [the print check](print-check.md) before the new design is printed. Do not say that a design scans: only a real scan shows that.

## Undo

Keep the `metadata` object read before the change for the rest of the conversation. When the customer asks to go back, read the code again with `get_qr_code`, restore only the design keys that were changed to the values they had, and send the whole object.
