# Performance report

A summary of how the customer's codes performed over a period. Use it for "how are my codes doing", "weekly report", "monthly report", "which code is best", or a request to compare this period with the last one. It builds on the "Scan analytics" section of the skill, which explains the tool, the `status` check and the plan requirement.

Scan analytics comes with the Pro and Business plans. If `get_plan_limits` shows `analytics` is false, stop and offer the upgrade as the skill describes.

## Which codes

- The codes the customer named.
- Otherwise every code, when there are ten or fewer.
- Otherwise ask: a few named codes, or the ten most recently changed (`updatedAt`). Do not fetch analytics for a large account without asking.

## Which figures

The tool has three fixed windows and no "previous period", so take the longer window and split it by date:

| Report | Fetch `interactions` for | Compare |
| --- | --- | --- |
| Weekly | `month` | the last 7 days with the 7 days before |
| Monthly | `year` | the last 30 days with the 30 days before |
| Yearly | `year` | no earlier period is available; show the months side by side |

For each code, add up `total` for the period and for the one before it. Totals arrive as text. A date with no entry had no scans.

Then, for the three codes with the most scans in the period, also fetch `locations` and `devices` for the matching window (`week`, `month` or `year`), so the report can say where and on what they were scanned. Add `geo` only when the customer asks about cities.

Check `status` on every result as the skill describes, and leave a code out of the ranking, with a note, if its figures never finish.

## The report

1. **Headline.** Total scans across the codes for the period, and the change from the period before as a number and a percentage. With no scans in the earlier period, say "new" instead of a percentage.
2. **Ranking.** A table, most scans first: name, scans, change, and top country where known.
3. **Highlights.** The best performer, the biggest rise and the biggest fall, and codes with no scans at all. For the leaders: the busiest day, and hour where the figures have it, the top countries, and the split between phones by operating system.
4. **Suggestions.** Two or three, each tied to a figure in the report, and marked as suggestions. No benchmarks, no invented causes.
5. **Links.** The analytics page (`https://qrcake.com/dashboard/analytics`) and the editor link for any code that needs attention.

Where this conversation can make charts or documents, offer a chart of scans over time for the leaders, or the report as a document. Keep the chat version short enough to read in a minute.

## Repeating it

If the customer wants the report regularly and this conversation can schedule tasks, offer to set it up, weekly on a Monday by default. Write the scheduled instruction so it stands alone: which codes, which period, and that it must use the QR Cake tools. Each run reads fresh figures; nothing is stored between runs.
