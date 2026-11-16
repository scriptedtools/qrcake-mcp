# Account overview

Use this when the customer asks how their account is doing overall, for a summary or a snapshot of their QR codes, or runs the overview shortcut. It is a quick picture that fits on one screen. For the full performance figures use [the report](report.md); for problems to fix use [the check-up](check-up.md). The overview changes nothing.

## Read

1. `get_plan_limits`: the plan, codes used against the limit, active codes used against the limit, and whether scan analytics is included.
2. `list_qr_codes`: every code, with its state, kind and dates.
3. Only when the plan includes analytics: `get_qr_code_analytics` with `type` `interactions` and `periodicity` `week`, once per code, for at most the ten most recently updated active codes. Follow the rules for unfinished results under "Scan analytics" in the skill. Do not call it on a plan without analytics.

## Answer

Keep it to a short block the customer can read in half a minute:

1. **Plan.** The plan name and the two counts, for example "Free plan: 4 of 5 codes, 4 of 5 active". Say so when a limit is reached or one code away.
2. **Codes.** How many are active and how many are paused, and the kinds in plain words when there is more than one ("6 links, 2 PDFs, 1 contact card").
3. **This week.** With analytics: total scans across the codes read, the busiest code and any active code with no scans. Say how many codes were read when the account has more than ten. Without analytics: one line that scan figures come with the Pro and Business plans, with the link https://qrcake.com/prices. Do not push it further.
4. **Worth a look.** At most three things that stand out from what was read: a paused code, two codes with the same name or destination, a code still called "My QR Code". Skip this part when nothing stands out.
5. **Next.** Offer one or two fitting follow-ups: the full report, the check-up, or the list of every code.

Never show a figure that was not read. An unfinished analytics result is "not ready yet", never zero.
