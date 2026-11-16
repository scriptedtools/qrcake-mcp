"""QR Cake REST API with Python 3 (standard library only).

Needs an API key from your QR Cake dashboard:  QRCAKE_API_KEY=... python3 python.py
Docs: https://qrcake.com/docs
"""
import json
import os
import urllib.error
import urllib.request

API = "https://api.qrcake.com/v1/product/api"
KEY = os.environ.get("QRCAKE_API_KEY")
if not KEY:
    raise SystemExit("Set QRCAKE_API_KEY to an API key from your QR Cake dashboard")


def call(method, path, body=None):
    headers = {"x-api-key": KEY}
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(API + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            text = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        raise SystemExit(f"{method} {path} failed: {error.code} {error.read().decode('utf-8')}")
    return json.loads(text) if text else None


print("What this key may do:", call("GET", "/permission"))

codes = call("GET", "/product")
print(f"You have {len(codes)} QR codes")

# A dynamic QR code for a URL.
created = call("POST", "/product", {"redirect": "https://example.com/menu", "metadata": {"type": "redirect"}})
code_id = created["productId"]
print("Created", code_id)

# Point it somewhere new. The printed code stays the same.
call("PUT", f"/product/{code_id}", {"redirect": "https://example.com/autumn-menu"})

# Pause it, then switch it back on.
call("PUT", f"/product/{code_id}", {"state": "INACTIVE"})
call("PUT", f"/product/{code_id}", {"state": "ACTIVE"})

# Delete it. This is permanent: printed copies stop working.
call("DELETE", f"/product/{code_id}")
print("Deleted", code_id)
