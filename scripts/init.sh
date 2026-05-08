#!/bin/bash

mkdir -p wireguard
mkdir -p guacamole
mkdir -p navidrome
mkdir -p kavita/books
mkdir -p kavita/config
mkdir -p romm

./scripts/authelia.sh
./scripts/guacamole.sh
./scripts/searxng.sh
./scripts/api.sh
