---
description: Make a QR image that joins a WiFi network
argument-hint: "<network name> [password]"
---

Use the QR Cake qr-codes skill and its "QR images and one-off content" section to make a WiFi QR image for the network in $ARGUMENTS. Ask for the network name if it is missing, and for the password unless the customer says the network is open. Build the content with build_qr_content and draw it with render_qr_code. Do not repeat the password in the reply. Say that this image is static: it is not saved to the account and must be made again if the password changes.
