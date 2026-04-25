#!/bin/bash

mkdir -p authelia
mkdir -p caddy
mkdir -p wireguard
mkdir -p guacamole
mkdir -p searxng
mkdir -p openclaw

./scripts/authelia.sh
./scripts/caddy.sh
./scripts/guacamole.sh
./scripts/searxng.sh
./scripts/openclaw.sh
./scripts/api.sh
