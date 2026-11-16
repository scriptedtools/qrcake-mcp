# QR Cake for Claude

Manage your QR Cake dynamic QR codes from Claude chat and Cowork, with your existing QR Cake account.

## What it does

- **Scan analytics.** Ask how your codes are performing: scans over time, the countries and cities they come from, and the devices used, for the last week, month or year. Get a ranked report that compares a period with the one before. Pro and Business plans.
- **Create.** A dynamic QR code for a link, with campaign tags if you want scans to show in your own analytics. Many codes at once from a list or a spreadsheet.
- **Hosted pages.** A link list, a digital contact card, an event page, a review page, an app page, or a code that opens a ready-written email.
- **Files.** A code that opens your PDF, audio, video or photos, a logo in the middle of a QR code, a logo or photo on a hosted page. Swap the file later and every printed code opens the new one. In chat, Claude gives you a QR Cake link to upload the file and you paste back the short reference the page shows.
- **Design.** Describe the look you want ("navy with rounded dots and the Instagram logo", "add a Scan me frame") and Claude applies it, or open the QR Cake designer inside the conversation and change the shapes, colours, logo and frame yourself. Where the app cannot show the designer, Claude gives you the link to the editor.
- **Manage.** List all your codes, find codes by name, rename them, change where a link code points, edit the text and links on a hosted page, pause or reactivate, or delete.
- **Check.** Review your whole account for repeats, unclear names, paused codes and links that no longer load. Check one code before it goes to print.
- **Overview.** Your plan, your codes and this week's scans on one screen.
- **Extras.** Check your plan limits, and make one-off QR images for WiFi details and similar content.

Password protection, custom domains and print-ready downloads stay in the QR Cake editor; the plugin links to it.

## What is inside

| Part | Purpose |
| --- | --- |
| `.mcp.json` | The QR Cake connector: the remote MCP server at `https://api.qrcake.com/mcp` |
| `skills/qr-codes` | How Claude creates, finds and changes codes safely. `references/` holds the exact payloads (`product-contract.md`) and one guide each for hosted pages, file codes, uploads, designing from a description, campaign tracking, bulk create, the overview, the check-up, the report, the print check and help |
| `commands/` | Shortcuts: `/qrcake:overview`, `/qrcake:list-qr`, `/qrcake:find-qr`, `/qrcake:create-qr`, `/qrcake:bulk-create`, `/qrcake:update-qr`, `/qrcake:pause-qr`, `/qrcake:design-qr`, `/qrcake:add-file`, `/qrcake:wifi-qr`, `/qrcake:contact-qr`, `/qrcake:report`, `/qrcake:check-up`, `/qrcake:print-check` and `/qrcake:help` |

## Connecting your account

Install the plugin, then connect QR Cake when Claude asks. In Claude Code:

```
/plugin install qrcake --marketplace scriptedtools/qrcake-mcp
```

In the Claude apps, use the Customize > Plugins controls. You sign in on QR Cake and approve what Claude may do: read your codes, change your codes, and read scan analytics. No password or API key ever goes into a chat. QR Cake API keys are for the REST API and do not work with this connector.

A connection lasts up to 30 days, after which Claude asks you to connect again. The first time you connect with Google or Apple on an account that already exists with the same email, the attempt can fail once; connect again and it goes through.

## Try

- "Create a QR code for https://example.com/menu called Summer menu."
- "List all my QR codes."
- "Find my restaurant QR codes."
- "Give me an overview of my QR codes."
- "Make the Summer menu code dark green with rounded dots."
- "Add a Scan me frame to the Summer menu code."
- "Open the designer for the Summer menu code."
- "What can I do with QR Cake here?"
- "Change Summer menu to point at https://example.com/autumn-menu."
- "Pause the Summer menu code."
- "How many QR codes can I create on my current plan?"
- "How do I remove the ads from my QR codes?"
- "How many scans did Summer menu get this month, and where were they from?"
- "Which of my menu codes got the most scans this year?"
- "What time of day do people scan the Summer menu code?"
- "Make a WiFi QR code for the network Cafe Guest."
- "Make a QR code with links to our menu, bookings and Instagram."
- "Make a QR code for our dinner menu PDF."
- "Put our logo in the middle of the Summer menu code."
- "Replace the PDF behind the Dinner menu code with the new one."
- "Create codes for these ten links and tag them for the spring campaign."
- "Check my codes for anything that needs fixing."
- "Is the Summer menu code ready to print?"

## Things to know

- Changes reach already-printed codes immediately.
- Deleting a code is permanent: printed copies stop working.
- Files: images up to 25 MB, audio (mp3, wav, m4a) 100 MB, video 200 MB and PDFs 50 MB. Other documents need saving as a PDF first. A file you upload but never attach to a code is removed after 3 days, and a file you replace or remove is deleted.
- An edit made in the website at the same moment as one made by Claude can overwrite it.
- The designer changes how a code looks, not where it goes. Codes already printed keep working and keep the look they were printed with.
- Images drawn in chat are plain black on white. The styled, print-ready image comes from the editor.
