# Account check-up

A read-only review of the customer's codes that points out what is worth fixing. Use it when they ask to check, review, audit or tidy their codes, or ask whether anything is wrong with their account. Nothing is changed during the check-up; every fix afterwards follows the normal rules in the skill.

## Gather

Call `list_qr_codes` and `get_plan_limits`.

A code is a **plain link code** when `metadata.type` is `redirect`, it is not password protected, and its top-level `redirect` is the customer's own URL. Any other code is a hosted or protected code whose short link goes to a QR Cake page.

## What to look for

1. **Plan room.** Codes used against the limit, and active codes against theirs. Say when either is full or one away from full.
2. **Repeats.** Codes that go to the same place. Compare destinations after lowercasing the host, dropping a trailing slash and ignoring `utm_` parameters. Two codes for one place can be deliberate (different posters), so call them possible repeats.
3. **Unclear names.** The default name "My QR Code", an empty name, or one name shared by several codes.
4. **Paused codes.** `state` is `INACTIVE`: any printed copy of that code does nothing right now.
5. **Destinations that look wrong.** A likely typo in a link (a misspelt word or domain), a link to a login page, or a temporary or test address. Say "worth checking", never "broken", for anything that is only a suspicion.
6. **Destinations that do not load.** Only when this conversation has a tool that can open web pages, and only for plain link codes:
   - Open the destination, never the `scanUrl`. Opening the short link counts as a scan in the customer's analytics.
   - Check at most 25 links; for more, ask which matter most.
   - Report a missing page, a server error or a domain that does not exist. A site that refuses automated visitors is "could not be checked from here", not a failure.
   - Skip `mailto:` links and hosted or protected codes.
7. **File codes with no file.** `metadata.type` is `pdf`, `file`, `audio` or `video` and there is no `metadata.file`, or it is `image` and `metadata.gallery` is missing or empty. The code shows a notice instead of a file. Offer the upload link from [files on a QR code](uploads.md) to finish it.
8. **Codes nobody scans.** Only on a plan with analytics, and only if the customer wants it: follow [the report](report.md) for up to ten codes and list those with no scans in the last month.

## Report

Start with one line: how many codes, how many are fine, how many need a look. Then one short group per finding that has something in it, naming each code with its destination and editor link (`https://qrcake.com/create/{id}`). Leave out groups with nothing to say. Do not paste metadata.

End by offering the fixes that apply, and wait for the customer to choose:

- Rename a code, or point a plain link code somewhere else.
- Pause or reactivate a code.
- Add the missing file to an unfinished file code.
- Delete a code the customer names, with the confirmation the skill requires. Never pick which repeat to delete for them.
- When the plan is full: the upgrade first, with https://qrcake.com/prices.
