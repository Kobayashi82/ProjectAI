<div align="center">

![Infrastructure](https://img.shields.io/badge/Infrastructure-VPS%20Docker-2f855a?style=for-the-badge)
![Network](https://img.shields.io/badge/Network-WireGuard-1f6feb?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Dashboard-Monitoring-8a5cf6?style=for-the-badge)

*Unified dashboard focused on Open WebUI, ComfyUI and OpenClaw in a home and VPS environment*

</div>

<div align="center">
  <img src="/images/ProjectAI.jpg">
</div>

# Project AI

[README en Espanol](README_es.md)

`Project AI` is a centralized web `dashboard` hosted on a `VPS` with `Docker`, focused on `Open WebUI`, `ComfyUI`, and `OpenClaw`, with integrated monitoring, remote access, and operations across all nodes.

## Main Focus

- `Open WebUI` centralized access
- `ComfyUI` centralized access
- `OpenClaw` centralized access
- Unified service control and quick launch panel

## Infrastructure Overview

`Project AI` connects and manages:

- `PADRE` Windows PC behind `CG-NAT`, connected through `WireGuard`
- `Raspberry Pi` behind `CG-NAT`, connected through `WireGuard`, same local network as `PADRE` node
- `VPS` host machine

## Architecture

The architecture is based on:

- `Dashboard` service on `VPS` for observability and remote operations
- `Caddy` as the web server and reverse proxy
- `Authelia` as single-user authentication (password-only login)
- `WireGuard` tunnel to securely reach Windows and `Raspberry Pi` behind `CG-NAT`
- `Guacamole` for connecting to remote control servers

## Quick Start (`VPS`)

Prerequisites:

- `Docker` + `docker compose`
- `Make`
- `bash`
- `openssl`

Setup:

1. Copy `.env.example` to `.env` and adjust domains, users, IPs and ports.
2. Put private keys in `scripts/keys/put_private_keys_here` and then rename/move them to `scripts/keys/` using the same filenames referenced in `.env`.
3. Run `make init` to generate base config files.
4. Run `make up` to start all services.

Useful commands:

```bash
make up
make down
make restart
make build
make rebuild
make fclean
```

What `make init` generates:

- `authelia/configuration.yml`
- `authelia/users.yml`
- `caddy/Caddyfile`
- `guacamole/001-initdb.sql`
- `guacamole/002-seed-connections.sql`
- `openclaw/openclaw.json`
- `searxng/settings.yml`
- `dashboard/api/privatekey` (copied from `scripts/keys/${API_SSH_KEY}`)

## Keys and Secrets

Store required private keys in `scripts/keys/`.

Before running `make init`, place key files in `scripts/keys/` with names matching `.env` values:

- `API_SSH_KEY` (used by `scripts/api.sh`, copied to `dashboard/api/privatekey`)
- `CON[n]_KEY` values (used by `scripts/guacamole.sh` to inject SSH private keys into Guacamole SQL seed)

- Private keys used for remote connections through `Guacamole`
- `API` key used to send remote commands to `PC` and `RPI`

## Auth and Access Notes

- API route auth is enforced in production mode through `Remote-User` headers injected by `Caddy` + `Authelia`.
- If `Remote-User` is missing, API requests are rejected.
- `Guacamole` users and connection permissions are generated from `.env` values (`ADMIN_USER`, `GUAC_ACCESS_USERS`, `CON[n]_...`).

### Node Structure

- `PADRE`: primary `Windows` machine for `AI`, remote desktop and power actions
- `Raspberry Pi`: support node for power control, `SSH`, telemetry and service bridge
- `VPS`: public entrypoint and orchestration node for `Docker`, auth, proxy and dashboard

Detailed per-machine capabilities are listed in the `Dashboard` section below.

---

## Service Details

### Dashboard

Centralized control panel built with `Node` and `Fastify`, exposed through the `VPS`.

- Monitors `Padre` (`Windows x86_64`), `Raspberry` (`Linux ARM64`) and `VPS` (`Linux x86_64`) in real time
- Organizes actions in `Power`, `Access`, `Services`, `AI`, `Telemetry`, `Commands`
- Works as the single operation point for remote access and AI services

Machine summary:

- `Padre`:
  - `Power`: Wake on LAN, remote shutdown and reboot
  - `Access`: `SSH`, `VNC`, `RDP` through `Guacamole`
  - `Services`: `Files` and `Torrent`
  - `AI`: `ComfyUI`, `Open WebUI`, `OpenClaw`
  - `Telemetry`: CPU, RAM, GPU, VRAM and disks C, D, E, G, V
  - `Commands`: remote command execution through `K-Desktop`
- `Raspberry`:
  - `Power`: remote shutdown and reboot
  - `Access`: `SSH` through `Guacamole`
  - `Services`: `Files` and `Torrent`
  - `Telemetry`: CPU + temperature, RAM, root disk and external disk
- `VPS`:
  - `Access`: `SSH` through `Guacamole`
  - `Services`: `Files` and `Portainer`
  - `Telemetry`: CPU, RAM and root disk

### Open WebUI

Web chat frontend running in `Docker` on the `VPS`.

- Connects to `Ollama` through `WireGuard`
- Integrates `SearXNG` for web-assisted responses
- Integrates `ComfyUI` for image generation workflows

### OpenClaw

Personal AI assistant running in `Docker` on the `VPS`.

- Uses `Telegram` as user interface
- Uses `Ollama` as model backend via native `/api/chat`
- Reaches `Ollama` over internal `WireGuard` network

### ComfyUI

Node-based image and video generation interface running on `Windows`.

- Accessed from the `VPS` over `WireGuard`
- Supports model and `LoRA` workflows
- Common model source: `CivitAI`

Notes:

- `LoRA` (`Low-Rank Adaptation`) applies lightweight style/character/concept adaptations without full model retraining
- Some `CivitAI` downloads require an account and, in some cases, an `API key`

### Ollama

Local `LLM` runtime and `API REST` model server used by `Open WebUI` and `OpenClaw`.

- API endpoint: `http://[IP]:11434`
- For remote access set `OLLAMA_HOST=0.0.0.0`
- For broad CORS usage set `OLLAMA_ORIGINS=*`

Common commands:

```bash
ollama pull <model>
ollama list
ollama run <model>
```

Windows:

1. Install from https://ollama.com/download
2. Exit `Ollama` from tray icon
3. Set system environment variables:
  - `OLLAMA_HOST=0.0.0.0`
  - `OLLAMA_ORIGINS=*`
4. Start `Ollama` again

Linux:

```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl edit ollama.service
```

Add under `[Service]`:

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
Environment="OLLAMA_ORIGINS=*"
```

Apply changes:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### SearXNG

Open-source metasearch engine deployed in `Docker`.

- Aggregates results from multiple search engines
- Avoids dependency on a single provider
- Reduces direct tracking and profiling

### FileBrowser

Web file manager for `Windows` and `Linux`.

Main arguments:

| Argument | Description |
|---|---|
| `-r <path>` | Root directory to expose |
| `-a <address>` | Bind/listen address (`0.0.0.0` for all interfaces) |
| `-p <port>` | Web port |
| `--noauth` | Disable auth |
| `--database <path>` | `.db` configuration database path |

Windows (portable binary):

```bash
filebrowser.exe -r "C:\filebrowser" -a 0.0.0.0 -p 8085 --noauth --database "filebrowser.db"
```

Windows service with `NSSM`:

```bash
nssm install filebrowser
nssm edit filebrowser
nssm stop filebrowser
nssm start filebrowser
nssm remove filebrowser
```

Get/set service fields:

```bash
nssm get filebrowser Application
nssm set filebrowser Application "C:\path\to\filebrowser.exe"

nssm get filebrowser AppDirectory
nssm set filebrowser AppDirectory "C:\path\to\FileBrowser"

nssm get filebrowser AppParameters
nssm set filebrowser AppParameters "-r D:\filebrowser -a 0.0.0.0 -p 8085 --noauth --database filebrowser.db"
```

Linux:

```bash
# x86_64
wget https://github.com/filebrowser/filebrowser/releases/latest/download/linux-amd64-filebrowser.tar.gz

# ARM64
wget https://github.com/filebrowser/filebrowser/releases/latest/download/linux-arm64-filebrowser.tar.gz

tar -xzf linux-*.tar.gz
sudo mv filebrowser /usr/local/bin/filebrowser
sudo chmod +x /usr/local/bin/filebrowser
```

Linux runtime example:

```bash
filebrowser -r /home/user -a 0.0.0.0 -p 8085 --noauth --database /opt/filebrowser/filebrowser.db
```

`systemd` service (`/etc/systemd/system/filebrowser.service`):

```ini
[Unit]
Description=FileBrowser
After=network.target

[Service]
ExecStart=/usr/local/bin/filebrowser -r /home/user -a 0.0.0.0 -p 8085 --noauth --database /opt/filebrowser/filebrowser.db
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable filebrowser
sudo systemctl start filebrowser
sudo systemctl status filebrowser
```

### Torrent

P2P transfer service for distributed file sharing.

Windows:

1. Install from https://www.qbittorrent.com/download
2. Finish setup
3. Enable Web UI in settings

Linux (`qbittorrent-nox`):

```bash
sudo apt install qbittorrent-nox
sudo systemctl enable --now qbittorrent-nox
sudo journalctl -u qbittorrent-nox | grep password
```

Web UI: `http://[IP]:8080`

### Portainer

Web administration layer for `Docker`.

- Manage containers, images, networks, volumes and stacks
- Restart services, inspect logs and monitor deployments
- Simplifies day-to-day operations in multi-service environments

### Guacamole

Web remote access gateway with no client install required.

- `SSH`: remote shell, usually port `22`
- `VNC`: remote desktop stream, usually port `5900`
- `RDP`: `Windows` remote desktop, port `3389`

Runs on `VPS` in `Docker`, using internal `WireGuard` addresses for target nodes.

### K-Desktop

[K-Desktop](https://github.com/Kobayashi82/K-Desktop) is a `Windows` productivity and automation suite (`Visual Basic .NET`).

- Remote command execution over `UDP`
- Global shortcuts, screenshots, audio/video recording and custom context menus
- Used mainly by dashboard `Commands` for `PADRE`

### Telemetry

Two `Python` clients expose live machine metrics as `JSON` for the dashboard.

`Windows`:

- `System`: local IP, CPU and RAM (total/used/percent)
- `GPU`: name, load, VRAM total/used/free, temperature, multi-GPU support
- `Disks`: total/used/free/percent for each mounted drive

`Linux` (`Raspberry Pi`):

- `System`: local IP, CPU, RAM and CPU temperature
- `GPU`: VideoCore IV name, total and assigned memory
- `Disks`: root `/`, firmware and external mount at `/mnt/externo`

### Caddy

Modern web server and reverse proxy used as the main public entry point.

- Publishes internal services securely
- Automatic `TLS`/`HTTPS` certificate management
- Routes host/subdomain traffic to `Docker` containers
- Integrates with `Authelia` for access control

### Authelia

Centralized authentication and authorization layer.

- Single login for all protected services
- Identity checks delegated by reverse proxy (`Caddy`)
- Simplifies user and policy management and avoids per-app auth setup

### WireGuard

Encrypted high-performance `VPN` backbone connecting `VPS`, `Windows`, and `Raspberry Pi`.

- Secure access to nodes behind `CG-NAT`
- Low-latency private network for service communication
- Per-client import via `.conf` file or QR code

Per-client files:

| File | Description |
|---|---|
| `wireguard/peer_[client]/peer_[client].conf` | Import-ready client configuration |
| `wireguard/peer_[client]/peer_[client].png` | Mobile import QR code |

Config example:

```ini
[Interface]
Address = 10.0.0.2/24
PrivateKey = [private key...]
ListenPort = 51820
MTU = 1420

[Peer]
PublicKey = [public key...]
PresharedKey = [preshared key...]
Endpoint = [SERVER_IP]:51820
AllowedIPs = 10.0.0.0/24
PersistentKeepalive = 25
```

Windows:

1. Install from https://www.wireguard.com/install
2. Import `.conf`
3. Activate tunnel

Linux:

```bash
sudo apt install wireguard
sudo cp peer.conf /etc/wireguard/wg0.conf
sudo chmod 600 /etc/wireguard/wg0.conf
sudo systemctl enable --now wg-quick@wg0
sudo wg show
```

### VPS Base Setup

Recommended baseline to prepare the `VPS` before deploying services.

Creation and access:

- Create a `VPS` with your preferred provider and get its IP
- Prefer `SSH` public-key access over password login
- If needed, set or change root password with `passwd root`

SSH key setup:

```bash
ssh-keygen -t ed25519 -C "identifier"
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

example (`~/.ssh/config`):

```ini
Host [Server Name]
  HostName [Server IP]
  User root
  IdentityFile ~/.ssh/identifier
```

SSH hardening (`/etc/ssh/sshd_config`):

```ini
PermitRootLogin prohibit-password
PubkeyAuthentication yes
PasswordAuthentication no
```

```bash
systemctl restart ssh
```

Create a `sudo` user:

```bash
adduser [user]
usermod -aG sudo [user]
```

Optional: hide login banner

```bash
touch ~/.hushlogin
```

Fail2ban:

```bash
sudo apt update
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status sshd
```

Docker:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker [user]
newgrp docker
docker run --rm hello-world && docker rmi hello-world
```

Build tools:

```bash
sudo apt update
sudo apt install build-essential -y
```

---
## License

This project is licensed under the WTFPL - [Do What the Fuck You Want to Public License](http://www.wtfpl.net/about/).

---

<div align="center">

**🤖 Developed by Kobayashi82 🤖**

*"Keep it local. Keep it free"*

<div align="center">
  <img src="/images/ProjectAI_web.png">
</div>
