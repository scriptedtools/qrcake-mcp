# File codes

A file code opens a file the customer uploaded: a PDF menu, a price list, a recording, a video, a photo or a set of photos. Because the code is dynamic, the file can be swapped later and every printed copy opens the new one. Use this when the customer asks for "a QR code for this PDF", "a QR code for our menu" with a file in hand, "a QR code that plays this video", or "replace the PDF behind my code".

Read [files on a QR code](uploads.md) first: it covers how the file reaches QR Cake, the accepted types and sizes, and the `uploads` list every example below depends on.

Checked on 13 November 2026 against the QR Cake website.

## The kinds

| `metadata.type` | File key | Takes |
| --- | --- | --- |
| `pdf` | `file` | one PDF |
| `audio` | `file` | one audio file |
| `video` | `file` | one video file |
| `file` | `file` | one file of any accepted kind |
| `image` | `gallery` | one or more images |

Choose `pdf`, `audio` or `video` when the file is one of those, and `image` for pictures. `file` is the general kind; use it only when the customer asks for it.

## Two ways a file code can open

- **Straight to the file** (`"onlyFile": true`): scanning opens the file itself, with nothing around it.
- **A page around the file** (`"onlyFile": false`): a QR Cake page that shows the file in a viewer or player, with an optional title, short description and logo.

Use the website's own default for each kind unless the customer asks for the other:

| Kind | Default |
| --- | --- |
| `pdf`, `audio` | a page, which gives the PDF a viewer and the recording a player |
| `video`, `file`, `image` with one image | straight to the file |
| `image` with two or more images | always a page, shown as a gallery |

A customer who wants a title or text with the file needs a page. One who says "just open the PDF" wants it straight.

## Straight to the file

- Top-level `redirect`: the file's `url`.
- `options`: `{ "forwarding": false }`.
- `metadata`: `name`, `type`, `"onlyFile": true`, the file object under `file`, `redirect` set to the same `url`, and the design defaults from [the product contract](product-contract.md).
- `uploads`: the file's key.

```json
{
  "redirect": "https://cdn.qrcake.com/uploads/<key>",
  "metadata": {
    "name": "Welcome video",
    "type": "video",
    "onlyFile": true,
    "file": { "id": "<key>", "url": "https://cdn.qrcake.com/uploads/<key>", "type": "video/mp4" },
    "redirect": "https://cdn.qrcake.com/uploads/<key>",
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
  "uploads": ["<key>"],
  "options": { "forwarding": false }
}
```

An image code with exactly one image is stored the same way, with `"type": "image"`, the image object as the only entry of `gallery` instead of `file`, and both `redirect` values set to that image's `url`.

## A page around the file

- Top-level `redirect`: `https://qrcake.com/x`, exactly. `options`: `{ "forwarding": true }`.
- `metadata`: `name`, `type`, `"onlyFile": false`, the file under `file` (or the images under `gallery`), the design defaults, and any of `mainTitle`, `description` and `logo`. No `metadata.redirect`.
- `uploads`: every file in the metadata, including a `logo`.

```json
{
  "redirect": "https://qrcake.com/x",
  "metadata": {
    "name": "Dinner menu",
    "type": "pdf",
    "onlyFile": false,
    "file": { "id": "<key>", "url": "https://cdn.qrcake.com/uploads/<key>", "type": "application/pdf" },
    "mainTitle": "Dinner menu",
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
  "uploads": ["<key>"],
  "options": { "forwarding": true }
}
```

Leave `mainTitle` and `description` out when the customer gave none. An image code with two or more images is this shape, with the images in `gallery` in the order they should appear.

## Starting without the file

The upload link needs a code to exist, so when the file will arrive by link, create the code first and finish it when the reference is pasted.

1. Create the code with `redirect` `https://qrcake.com/x`, `options` `{ "forwarding": true }`, and `metadata` holding `name`, `type`, `onlyFile` as it will finally be, and the design defaults. No file key and no `uploads`. It counts against the plan limit like any code.
2. Give the upload link for that code, with `for=file` (`for=gallery` for an image code), and say plainly that the code shows a notice instead of the file until the file is added, so it is not ready to print or share yet.
3. When the reference arrives and passes its checks, send one update that completes the code in the shape it should have: the file under its key, `uploads`, and the `redirect` and `options` for "straight to the file" or for a page.

If the customer never uploads, the code stays unfinished. Mention it when it comes up again; do not delete it without the usual confirmation.

## Changing a file code

Call `get_qr_code` first and send the complete `metadata` back, as for every update.

- **Swap the file** (a new menu, a corrected PDF): upload the new file, put its object under `file`, and send `uploads` with the new key in place of the old one. On a "straight to the file" code also send the new `url` as the top-level `redirect` and as `metadata.redirect`; on a page, leave `redirect` and `options` out. The new file must suit the code's `type`; a PDF code takes only a PDF.
- **Add images** to an image code: add them to the end of `gallery` and send the full `uploads` list. When a one-image code gains a second image it becomes a page: set `"onlyFile": false`, send `redirect` `https://qrcake.com/x` and `options` `{ "forwarding": true }`, and remove `metadata.redirect`. Tell the customer that scans now open a gallery page.
- **Add or change a title or text**: on a page, change the text keys only. On a "straight to the file" code this turns it into a page: set `"onlyFile": false`, add the text keys, send `redirect` `https://qrcake.com/x` and `options` `{ "forwarding": true }`, and remove `metadata.redirect`. No file changes either way, so leave `uploads` out.
- **Open the file straight instead of on a page**: set `"onlyFile": true`, send the file's `url` as the top-level `redirect` and as `metadata.redirect`, and `options` `{ "forwarding": false }`. Not possible for an image code with more than one image.
- **Rename, pause, reactivate**: as for any code. Leave `uploads` out.

A password-protected code (`passwordProtected` true with a `password`) always goes through QR Cake's page so the password can be asked for. When changing its file, leave the top-level `redirect` and `options` out of the call and change only `metadata` and `uploads`. Never show or alter the password.

Never change a code's `type`. A different kind of file is a new code.

## Before and after

1. Before creating, confirm the name and which file it is. For a page, show the title and text as well.
2. Check the plan limit as for any new code.
3. After the write, reply with the name, the scan link and the editor link. Say that the file can be replaced later without reprinting, and that colours, a frame and password protection are set in the editor.
4. Do not paste the file's address as the thing to share: the scan link is what the printed code carries.
