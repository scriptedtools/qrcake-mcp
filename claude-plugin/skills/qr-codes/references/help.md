# What this plugin can do

Use this when the customer asks what they can do here, how the QR Cake plugin works, which commands exist, why a tool is missing, or how to connect. Answer the question that was asked: give the whole list only when they ask for everything.

## Shortcuts

| Shortcut | What it does |
| --- | --- |
| `/qrcake:overview` | Your plan, your codes and this week's scans at a glance |
| `/qrcake:list-qr` | Every code on the account |
| `/qrcake:find-qr` | Codes that match a name |
| `/qrcake:create-qr` | A new code for a link |
| `/qrcake:bulk-create` | One code for each link in a list |
| `/qrcake:update-qr` | Point a code at a new link; printed copies follow |
| `/qrcake:pause-qr` | Pause a code, or switch it back on |
| `/qrcake:design-qr` | Change a code's look from a description, or open the designer |
| `/qrcake:add-file` | A code that opens a PDF, photo or video, or a logo on a code |
| `/qrcake:wifi-qr` | A QR image that joins a WiFi network |
| `/qrcake:contact-qr` | A QR image that saves a contact |
| `/qrcake:report` | How the codes performed over a week, month or year |
| `/qrcake:check-up` | Problems worth fixing across the account |
| `/qrcake:print-check` | Whether one code is ready to print |
| `/qrcake:help` | This list |

Every one of these also works as a plain request, for example "pause the Summer menu code".

## What needs the QR Cake website

Password protection, custom domains, print-ready downloads, the plan and billing, and deleting the account. Give the link: the editor for a code is `https://qrcake.com/create/{id}`, plans are at https://qrcake.com/prices.

## Permissions

When connecting, the customer approves up to three permissions. A tool that is missing means its permission was not approved: they reconnect QR Cake in Claude's connector settings and allow it.

| Permission | What it allows |
| --- | --- |
| Read your codes | listing, finding, the overview, the check-up, the print check, plan limits |
| Change your codes | creating, updating, pausing, deleting, files |
| Read scan analytics | scan figures and the report; also needs a Pro or Business plan |

The designer needs both reading and changing codes. Making a WiFi or contact image needs no permission.

## Connecting and common problems

- **Connecting.** The customer signs in on QR Cake and approves the permissions there. No password or API key is typed into a chat. API keys are for the QR Cake REST API and do not work here.
- **The first sign-in fails.** Connecting with Google or Apple to an account that already exists with the same email can fail once. Connecting again works.
- **Asked to connect again.** A connection lasts up to 30 days.
- **Analytics is refused.** Scan analytics comes with the Pro and Business plans.
- **A code cannot be created or switched on.** The plan's limit is reached: see "When a plan limit stops a request" in the skill.
- **The designer does not appear.** Not every app can show it. The editor link does the same job.
- **Anything else.** https://qrcake.com/contact
