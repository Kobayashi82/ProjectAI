<div align="center">

![Infrastructure](https://img.shields.io/badge/Infrastructure-VPS%20Docker-2f855a?style=for-the-badge)
![Network](https://img.shields.io/badge/Network-WireGuard-1f6feb?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Dashboard-Monitoring-8a5cf6?style=for-the-badge)

*Unified dashboard for AI services, remote operations, and monitoring across home and VPS environments*

</div>

<div align="center">
  <img src="/images/ProjectAI.jpg">
</div>

# Project AI

[README en Español](README_es.md)

`Project AI` is a centralized web `dashboard` and service platform hosted on a `VPS` with `Docker`. It provides unified access to AI services, media streaming, remote operations, and real-time monitoring across distributed nodes.

## Table of Contents

1. [Overview](#overview)
2. [Infrastructure](#infrastructure)
3. [Services](#services)
4. [Installation](#installation)
5. [VPS](#vps)
6. [License](#license)

## Overview

### Key Features

- **Remote Control**: Power management, service control, and system commands
- **Privacy Focused**: Local infrastructure integratated with `WireGuard`
- **Secure Remote Operations**: `SSH`, `VNC`, `RDP` access through `Guacamole`
- **Centralized AI**: `ACE Step`, `ComfyUI` and `Open WebUI` from one unified dashboard
- **Media Hub**: `Jellyfin` for local media streaming
- **Real-time Monitoring**: Live metrics from all nodes (CPU, RAM, GPU, Disks)

### Security

- **Single User Auth**: `Authelia` provides centralized login for all protected services
- **API Route Protection**: Enforced via `Remote-User` headers from `Caddy` + `Authelia`
- **SSH Keys**: Required for remote operations and `Guacamole` connections

## Infrastructure

The system is built on:

- **Dashboard** for central control and remote operations
- **Caddy** as the public-facing web server and reverse proxy
- **Authelia** for authentication and session management  
- **WireGuard** to securely bridge `PC` and `RPI` behind `CG-NAT`
- **Guacamole** for remote session management (`SSH`, `VNC`, `RDP`)
- **Docker Compose** for service orchestration

```
Internet
    ↓
Caddy (VPS)
    ↓
    ├─→ Authelia
    ├─→ Portainer
    ├─→ Guacamole
    ├─→ FileBrowser
    ├─→ Open WebUI
	├─→ SearXNG
    ↓
    WireGuard
        ├─→ PC (Windows)
        │   ├─ FileBrowser
        │   ├─ Jellyfin
        │   ├─ Torrent
        │   ├─ ACE Step
        │   ├─ ComfyUI
        │   └─ Ollama
        └─→ Raspberry Pi
            ├─ FileBrowser
            └─ Torrent
```

---

### Caddy

Modern web server and reverse proxy.

- **Automatic HTTPS**: TLS/SSL certificates managed automatically
- **Reverse Proxy**: Routes subdomains to Docker containers
- **Authentication**: Integrates with Authelia for access control

### Authelia

Centralized authentication.

- **Single Login**: One password for all protected services
- **Method**: Forward auth via Caddy headers
- **Session Control**: Automatic timeout and refresh tokens

### Portainer

Docker management for container.

- **Features**: Container management, image management, volume control, log viewing
- **Capabilities**: Restart services, inspect logs, monitor deployments

### WireGuard

Encrypted and high-performance `VPN` connecting `VPS`, `PC`, and `RPI`.

- **Feature**: Securely bridge nodes behind `CG-NAT`
- **Low Latency**: Private network for service-to-service communication

### Guacamole

Remote access gateway.

- **Supported Protocols**: `SSH`, `VNC`, `RDP`

## Services

### FileBrowser

Web file manager.

- **Access**: Via `WireGuard` from `VPS`
- **Feature**: Browse, upload, and manage files remotely

### Jellyfin

Self-hosted media server.

- **Access**: Via `WireGuard` from `VPS`
- **Feature**: Streaming of movies, shows, and music libraries

### Torrent

P2P file transfer service.

- **Access**: Via `WireGuard` from `VPS`
- **Feature**: Seed and download files

### ACE Step

AI music generation platform.

- **Access**: Via `WireGuard` from `VPS`
- **Feature**: Generate music from prompts and presets

### ComfyUI

Image and video generation.

- **Access**: Via `WireGuard` from `VPS`
- **Feature**: Visual workflows and nodes

### Open WebUI

Web chat frontend with multi-model support.

- **Feature**: `LLM` models chat
- **Primary Backend**: `Ollama` (via `WireGuard` from `PC`)
- **Search Integration**: `SearXNG` for web-assisted responses
- **Image Generation**: `ComfyUI` (via `WireGuard` from `PC`)

### K-Desktop

Windows automation suite.

- **Access**: Via `WireGuard` from `VPS`
- **Features**: Remote commands (`UDP`), global shortcuts, screenshots, recordings
- **GitHub**: https://github.com/Kobayashi82/K-Desktop

### Telemetry

Metric services running on each node.

- **System**: CPU, RAM, temperature
- **GPU**: Load, VRAM, temperature
- **Disks**: Used and total per mounted drive

---

## Installation

1. **Copy and configure `.env`**
```bash
cp .env.example .env
# Edit .env with your domains, users, IPs, and ports
```

2. **Setup private keys**
```bash
# Place private SSH keys in scripts/keys/
# Rename/move them to match .env values:
#   - API_SSH_KEY (for API remote commands)
#   - CON[n]_KEY (for Guacamole SSH connections)
```

3. **Initialize configuration**
```bash
make init
# Generates:
#   - authelia/configuration.yml
#   - authelia/users.yml
#   - caddy/Caddyfile
#   - guacamole/001-initdb.sql
#   - guacamole/002-seed-connections.sql
#   - jellyfin/ (container config)
#   - searxng/settings.yml
#   - dashboard/api/privatekey
```

4. **Start services**
```bash
make up           # Start all services
make down         # Stop all services
make restart      # Restart all services
make build        # Rebuild images
make rebuild      # Force rebuild all images
make fclean       # Full cleanup (removes containers, volumes, images)
```

---

## VPS

Recommended baseline to prepare the `VPS` before deploying `Project AI` services.

### Creation & Access

1. **Create VPS** with your preferred provider and obtain IP
2. **Use SSH keys** instead of password authentication
3. **Change root password** if needed: `passwd root`

### SSH Configuration

**Generate SSH key:**
```bash
ssh-keygen -t ed25519 -C "identifier"
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**SSH config file** (`~/.ssh/config`):
```ini
Host [ServerName]
  HostName [ServerIP]
  User root
  IdentityFile ~/.ssh/identifier
```

**Harden SSH** (`/etc/ssh/sshd_config`):
```ini
PermitRootLogin prohibit-password
PubkeyAuthentication yes
PasswordAuthentication no
```

Apply changes:
```bash
systemctl restart ssh
```

### User & Security

**Create sudo user:**
```bash
adduser [username]
usermod -aG sudo [username]
```

**Hide login banner (optional):**
```bash
touch ~/.hushlogin
```

**Setup Fail2ban:**
```bash
sudo apt update
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status sshd
```

### Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker [username]
newgrp docker
docker run --rm hello-world && docker rmi hello-world
```

### Build Tools

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

