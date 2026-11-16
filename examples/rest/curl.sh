#!/usr/bin/env bash
# QR Cake REST API with curl: check the key, list, create, change the destination, pause, delete.
# Needs an API key from your QR Cake dashboard:  export QRCAKE_API_KEY=...
# Docs: https://qrcake.com/docs
set -euo pipefail

API="https://api.qrcake.com/v1/product/api"
: "${QRCAKE_API_KEY:?Set QRCAKE_API_KEY to an API key from your QR Cake dashboard}"

call() { # call METHOD PATH [JSON]
  if [ $# -ge 3 ]; then
    curl -sS --fail-with-body -X "$1" "$API$2" -H "x-api-key: $QRCAKE_API_KEY" -H "Content-Type: application/json" -d "$3"
  else
    curl -sS --fail-with-body -X "$1" "$API$2" -H "x-api-key: $QRCAKE_API_KEY"
  fi
}

echo "What this key may do:";  call GET /permission; echo
echo "Your QR codes:";         call GET /product;    echo

echo "Create a dynamic QR code for a URL:"
created=$(call POST /product '{"redirect": "https://example.com/menu", "metadata": {"type": "redirect"}}')
echo "$created"
id=$(printf '%s' "$created" | sed -n 's/.*"productId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
[ -n "$id" ] || { echo "No productId in the response" >&2; exit 1; }

echo "Point it somewhere new (the printed code stays the same):"
call PUT "/product/$id" '{"redirect": "https://example.com/autumn-menu"}'; echo

echo "Pause it:"
call PUT "/product/$id" '{"state": "INACTIVE"}'; echo

echo "Delete it (permanent: printed copies stop working):"
call DELETE "/product/$id"; echo
