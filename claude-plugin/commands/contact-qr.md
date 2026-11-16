---
description: Make a QR image that saves a contact
argument-hint: <name, phone, email, ...>
---

Use the QR Cake qr-codes skill and its "QR images and one-off content" section to make a contact QR image from the details in $ARGUMENTS. Ask for a name and at least one way to reach the person if they are missing. Build the content with build_qr_content and draw it with render_qr_code. Say that this image is static, and offer the editable alternative: a contact card page from the hosted pages reference, which can be updated after printing.
