# Hosted pages

A hosted code opens a small page that QR Cake serves: a list of links, a contact card, an event, a set of review links or an app page. An email code opens a ready-written email instead of a page. Use this when the customer asks for one of those: "a QR code with all my links", "a digital business card", "a QR code for our event", "a QR code to collect reviews", "a QR code that emails us".

The kinds below are made of text and links, with an optional logo and, on a contact card, a photo. Create the page first with its text, then offer to add the picture: it is a file, and [files on a QR code](uploads.md) explains how it gets there (`logo` for the logo at the top of a link list, contact card, review page or app page; `avatar` for the photo on a contact card). Codes that are a file themselves (a PDF, audio, video or an image gallery) are in [file codes](file-codes.md).

Checked on 13 November 2026 against the QR Cake website. The page is drawn by the website from the saved metadata, so a key that is misspelt or missing simply does not appear. Use only the keys listed here.

## How a hosted code is stored

Every kind except email:

- Top-level `redirect`: `https://qrcake.com/x`, exactly. The short link goes to the page, which looks the code up.
- `options`: `{ "forwarding": true }`. Without this the page cannot tell which code was scanned.
- `metadata.type`: the kind. `metadata.name`: the code's name in the dashboard, 1-160 characters.
- The content keys for that kind, and the design defaults from [the product contract](product-contract.md).
- No `metadata.redirect`.

Leave out any content key the customer did not give. Do not invent placeholder links, phone numbers or text. Links inside a page must be complete `https://` addresses, or `mailto:` and `tel:` links where that is what the customer wants.

## Link list (`type`: `link`)

A page of buttons. Needs at least one real link, in `links` or `socials`.

| Key | Meaning |
| --- | --- |
| `mainTitle` | Page title, at most 40 characters |
| `description` | Short intro, at most 120 characters |
| `links` | Buttons, in order: `{ "label": "...", "link": "https://..." }`. Add `"featured": true` to make one stand out |
| `socials` | Icons: `{ "brand": "...", "link": "https://..." }` |

`brand` is one of: `X`, `facebook`, `reddit`, `github`, `telegram`, `instagram`, `tiktok`, `fiverr`, `discord`, `snapchat`, `spotify`, `youtube`, `vimeo`, `twitch`, `soundcloud`, `pintrest`, `skype`, `foursquare`, `steam`, `linkedin`, `dropbox`, `apple`, `appstore`, `playstore`, `android`. Use these spellings exactly, including `X` in upper case and `pintrest`. A network that is not on the list goes in `links` as an ordinary button.

```json
{
  "redirect": "https://qrcake.com/x",
  "metadata": {
    "name": "Cafe links",
    "type": "link",
    "mainTitle": "Harbour Cafe",
    "description": "Menu, bookings and where to find us",
    "links": [
      { "label": "Menu", "link": "https://example.com/menu", "featured": true },
      { "label": "Book a table", "link": "https://example.com/book" }
    ],
    "socials": [{ "brand": "instagram", "link": "https://instagram.com/example" }],
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
  "options": { "forwarding": true }
}
```

The other kinds use the same frame: the same `redirect`, `options` and design keys, with their own content keys.

## Contact card (`type`: `vCard`)

A digital business card with a "save contact" button. Needs `mainTitle`.

| Key | Meaning |
| --- | --- |
| `mainTitle` | Full name |
| `company` | Company |
| `title` | Job title |
| `phone` | Phone number, with country code |
| `email` | Email address |
| `website` | Website, `https://...` |
| `address` | Postal address |
| `description` | Short bio |
| `links` | Extra buttons, as in a link list |
| `socials` | Icons, as in a link list |

The photo (`avatar`) and company logo (`logo`) are files: add them after the card exists, following [files on a QR code](uploads.md).

## Event (`type`: `event`)

An event page with the date, the place and an "add to calendar" button. Needs `mainTitle` and `event`.

| Key | Meaning |
| --- | --- |
| `mainTitle` | Event name |
| `title` | Subtitle |
| `event` | Start: `YYYY-MM-DD` for an all-day event, or `YYYY-MM-DDTHH:MM` with a time, for example `2026-12-05T18:30` |
| `eventEnd` | End, same format, and later than the start. Optional |
| `location` | Venue or address; the page links it to a map |
| `description` | Details |
| `links` | Action buttons such as "Tickets", as in a link list |

Write the time exactly as the customer said it, with no time zone and no `Z`. The page shows it as written, so confirm the date and time with the customer before creating; a wrong date on a printed invitation is costly.

## Review page (`type`: `review`)

A page that sends people to the customer's review pages. Needs at least one entry in `reviews` with a `url`.

| Key | Meaning |
| --- | --- |
| `mainTitle` | Page title, for example "How did we do?" |
| `description` | Short intro |
| `reviews` | In order: `{ "platform": "...", "url": "https://..." }`. Add `"featured": true` to the one to push |

`platform` is one of: `google`, `trustpilot`, `yelp`, `facebook`, `tripadvisor`, `amazon`, `appstore`, `googleplay`, `other`. The `url` must be the customer's own review link for that platform. Ask for it; never build or guess one.

## App page (`type`: `app`)

A page for an app with its store links. Needs at least one real link in `links`.

| Key | Meaning |
| --- | --- |
| `mainTitle` | App name |
| `description` | Short intro |
| `links` | Store and other buttons: `{ "label": "App Store", "link": "https://..." }` |
| `socials` | Icons, as in a link list; `appstore`, `playstore`, `apple` and `android` are available |

## Email (`type`: `email`)

Scanning opens the person's email app with a message ready to send. This kind has no page: the short link goes straight to a `mailto:` link.

- `metadata.email`: one or more addresses, separated by commas. Required.
- `metadata.emailSubject`: optional, at most 150 characters.
- `metadata.emailBody`: optional, at most 1000 characters.
- Top-level `redirect` and `metadata.redirect`: the same `mailto:` link, built as below.
- `options`: `{ "forwarding": false }`.

Building the link: `mailto:` then the addresses joined by commas, then `?subject=` and `&body=` for the parts that are present (`?body=` when there is no subject). Percent-encode the subject and the body: a space is `%20`, a line break is `%0D%0A`, and `&`, `?`, `=`, `#`, `%` and `+` must all be encoded. Leave the `@` in addresses as it is.

```json
{
  "redirect": "mailto:hello@example.com?subject=Table%20booking&body=Hi%2C%0D%0AI%27d%20like%20to%20book%20a%20table.",
  "metadata": {
    "name": "Booking email",
    "type": "email",
    "email": "hello@example.com",
    "emailSubject": "Table booking",
    "emailBody": "Hi,\nI'd like to book a table.",
    "redirect": "mailto:hello@example.com?subject=Table%20booking&body=Hi%2C%0D%0AI%27d%20like%20to%20book%20a%20table.",
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

## Before creating

1. Collect the content. Ask only for what is required and missing; offer the optional parts in one line instead of a questionnaire.
2. Show the customer what the page will say: the title, the text, and each button with its link, in order. Fix anything they correct. For a page with more than a few items, wait for their go-ahead.
3. Check the plan limit as for any new code, then call `create_qr_code` once.
4. Reply with the name, the scan link and the editor link (`https://qrcake.com/create/{id}`). Offer to add a logo, or a photo on a contact card. Say that colours, fonts and password protection are set in the editor, and that the page shows a short ad before it on the Free plan.

## Changing a hosted page

Text and links on these six kinds can be changed here: a title, a description, a date, a phone number, adding, removing or reordering buttons. Follow the update rule in the skill without exception: call `get_qr_code`, send the complete `metadata` with only that change, and compare the result.

- Leave the top-level `redirect` and `options` out of the call, except for an email code, where the `mailto:` link must be rebuilt and sent as both `redirect` and `metadata.redirect`.
- Keep every key that is already there, including ones this page does not list, such as `logo`, `avatar`, `fontFamily`, `domain` and the password fields.
- A text or link change never touches a file key (`logo`, `logoImage`, `avatar`, `image`, `file`, `gallery`) and leaves `uploads` out of the call. To add, replace or remove a file, follow [files on a QR code](uploads.md).
- Never change `type`. A different kind of page is a new code.
- A password-protected page can be edited the same way; never show or alter `password` or `passwordProtected`.

For a PDF, file, audio, video or image code, follow [file codes](file-codes.md).
