#!/usr/bin/env bash
set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")/.." && pwd)/data"
CERT_FILE="$CERT_DIR/cert.pem"
KEY_FILE="$CERT_DIR/cert.key"

FORCE=0
if [ "${1:-}" = "--force" ]; then
  FORCE=1
fi

mkdir -p "$CERT_DIR"

if [ -f "$CERT_FILE" ] && [ "$FORCE" -eq 0 ]; then
  echo "cert already exists at $CERT_FILE — pass --force to regenerate"
  exit 0
fi

# Pin notAfter to Jan 19 2038 03:14:07 UTC (signed 32-bit time_t cap)
openssl req -x509 -newkey rsa:4096 -sha256 -nodes \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -not_after 20380119031407Z \
  -subj "/CN=iptv-local" \
  -addext "subjectAltName=DNS:localhost,DNS:rb,IP:192.168.0.125,IP:127.0.0.1" \
  -addext "keyUsage=digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=serverAuth" \
  -addext "basicConstraints=CA:FALSE"

chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

echo "wrote $CERT_FILE"
echo "wrote $KEY_FILE"
