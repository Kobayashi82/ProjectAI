#!/bin/bash

set -a
source .env
set +a

if [ ! -f openclaw/openclaw.json ]; then
	# Generate openclaw.json
    cat > openclaw/openclaw.json <<EOF
{
  "gateway": {
    "remote": {
      "url": "https://${OPENCLAW_DOMAIN}/?token=${OPENCLAW_TOKEN}"
    },
    "trustedProxies": ["172.18.0.0/16"],
    "controlUi": {
      "allowInsecureAuth": true,
      "dangerouslyDisableDeviceAuth": true,
      "allowedOrigins": [
        "http://localhost:18789",
        "http://127.0.0.1:18789",
		"https://${OPENCLAW_DOMAIN}"
      ]
    }
  },
  "meta": {
    "lastTouchedVersion": "2026.4.21",
    "lastTouchedAt": "2026-04-25T14:16:30.786Z"
  }
}
EOF
fi