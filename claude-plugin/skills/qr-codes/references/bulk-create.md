# Create many codes at once

Use this when the customer gives several links to turn into codes: a pasted list, a table, or a spreadsheet or CSV file they share. Every code is an ordinary plain URL code, built exactly as in [the product contract](product-contract.md).

## Before creating anything

1. Build the list. Each row needs a destination URL. A name is optional: use the customer's, or choose a short clear one from the link or its label. A row may also carry campaign tags; see [campaign tracking](campaign-tracking.md).
2. Check every URL the usual way: HTTP or HTTPS, no embedded credentials, within 2048 characters. Set aside rows that fail and say why.
3. Remove exact repeats within the list. Call `list_qr_codes` and point out rows whose destination already has a code, so the customer can skip them.
4. Call `get_plan_limits`. The room left is `codes.limit` minus `codes.used`, and new codes are active, so `active.limit` minus `active.used` applies too. If the list does not fit, stop and follow "When a plan limit stops a request" in the skill: offer the upgrade first, then creating only as many as fit, chosen by the customer.
5. Confirm once before creating when the list has more than five rows, or when any row was skipped, renamed or removed as a repeat. Show the final list as a table of name and destination with the count. A short list the customer wrote out exactly needs no second confirmation.

## Creating

- Call `create_qr_code` once per row, one after another, in the customer's order. Do not send them at the same moment: the plan limit is counted per call.
- Stop at the first refusal. Report it as it is; the rows after it were not created.
- After an uncertain result (a timeout, `Request failed`), stop, call `list_qr_codes`, and work out which rows exist before doing anything else. Never repeat a row that may have been created.
- For a long list, work in batches of about 25 and report after each.

## Afterwards

Give one table: name, destination, scan link, editor link (`https://qrcake.com/create/{id}`). In the table, write the scan and editor links as Markdown links, as the skill's "How to write a link" requires. List any rows that were not created, with the reason. State the totals: asked for, created, skipped, failed.

Offer, and do only if wanted:

- A spreadsheet or CSV of the results, where files can be made in this conversation. In a file, write each address in full as plain text; the Markdown link form is for chat only.
- A plain preview image per code with `render_qr_code`, passing each `scanUrl`. As SVG these can be saved as files. Styled, print-ready images come from the editor.
