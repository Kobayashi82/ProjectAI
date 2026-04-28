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

`Project AI` is a centralized web `dashboard` and service orchestration platform hosted on a `VPS` with `Docker`. It provides unified access to AI services (`Open WebUI`, `ComfyUI`, `ACE Step`, `OpenClaw`), remote operations, and real-time monitoring across distributed nodes.

## Table of Contents

1. [Overview](#overview)
2. [Core Services](#core-services)
3. [Infrastructure](#infrastructure)
4. [Quick Start](#quick-start)
5. [Services Detail](#services-detail)
6. [VPS Base Setup](#vps-base-setup)
7. [License](#license)

## Overview

### Key Features

- **Centralized AI Access**: `Open WebUI`, `ComfyUI`, `ACE Step`, and `OpenClaw` from one unified dashboard
- **Distributed Architecture**: Seamlessly connects `PC` (Windows), `RPI`, and `VPS`
- **Secure Remote Operations**: `SSH`, `VNC`, `RDP` access through `Guacamole`
- **Real-time Monitoring**: Live metrics from all nodes (CPU, RAM, GPU, Disks)
- **Integrated Remote Control**: Power management, service control, and system commands
- **Privacy-focused**: Local infrastructure with optional cloud integration via `WireGuard` VPN

### Node Structure

| Node    | OS             | Role                                     | Access                                  |
|---------|----------------|------------------------------------------|-----------------------------------------|
| **PC**  | Windows x86_64 | Primary AI compute and remote desktop    | SSH, VNC, RDP via Guacamole + WireGuard |
| **RPI** | Linux ARM64    | Support node for power, SSH, telemetry   | SSH via Guacamole + WireGuard           |
| **VPS** | Linux x86_64   | Public entry point, orchestration, proxy | SSH via Guacamole                       |

## Core Services

### AI & Machine Learning

| Service        | Purpose                           | Access               |
|----------------|-----------------------------------|----------------------|
| **Open WebUI** | Multi-model chat interface        | Docker on VPS        |
| **ComfyUI**    | Node-based image/video generation | Via WireGuard (PC)   |
| **ACE Step**   | AI step/flow automation platform  | Via WireGuard (PC)   |
| **OpenClaw**   | Telegram-based AI assistant       | Docker on VPS        |
| **Ollama**     | Local LLM runtime and API server  | Via WireGuard (PC)   |

### Infrastructure & Access

| Service       | Purpose                                             |
|---------------|-----------------------------------------------------|
| **Caddy**     | Web server and reverse proxy with automatic HTTPS   |
| **Authelia**  | Centralized single-user authentication              |
| **WireGuard** | Encrypted VPN backbone for secure node connectivity |
| **Guacamole** | Web-based remote access (SSH, VNC, RDP)             |

### Operations & Monitoring

| Service       | Purpose                                            |
|---------------|----------------------------------------------------|
| **Dashboard** | REST API for node operations and real-time metrics |
| **K-Desktop** | Windows automation suite for remote commands       |
| **Telemetry** | Live system metrics (Python clients on each node)  |
| **Portainer** | Docker management UI                               |

### Data & Utilities

| Service         | Purpose                               |
|-----------------|---------------------------------------|
| **FileBrowser** | Web file manager for all nodes        |
| **Torrent**     | P2P file transfer                     |
| **SearXNG**     | Meta-search engine with privacy focus |

## Infrastructure

### Architecture

The system is built on:

- **Dashboard** on VPS for central control, observability, and remote operations
- **Caddy** as the public-facing web server and reverse proxy
- **Authelia** for authentication and session management  
- **WireGuard** VPN to securely bridge `PC` and `Raspberry Pi` behind `CG-NAT`
- **Guacamole** for remote session management (`SSH`, `VNC`, `RDP`)
- **Docker Compose** for service orchestration on `VPS`

### Network Topology

```
Internet / Domains
    ↓
Caddy (HTTPS/Reverse Proxy)
    ↓
    ├─→ Authelia (Auth Check)
    ├─→ Caddy (Web Server)
    ├─→ OpenWebUI (Chat/WebUI)
    ├─→ OpenClaw (Telegram Bot)
    ├─→ Portainer (Docker UI)
    ├─→ Guacamole (Remote Access)
    └─→ FileBrowser (VPS files)
    
    ↓
WireGuard VPN
    ├─→ PC (Windows)
    │   ├─ ComfyUI (port 8188)
    │   ├─ ACE Step (port 7860)
    │   ├─ Ollama (port 11434)
    │   ├─ FileBrowser (port 8085)
    │   └─ Torrent (port 8899)
    └─→ Raspberry Pi
        ├─ FileBrowser (port 8085)
        └─ Torrent (port 8899)
```

## Quick Start

### Prerequisites

- `Docker` + `docker compose` on `VPS`
- `Make` and `bash`
- `openssl` for key generation
- Domain name pointing to `VPS`
- Private SSH keys for remote node access

### Installation Steps

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
   #   - openclaw/openclaw.json
   #   - searxng/settings.yml
   #   - dashboard/api/privatekey
   ```

4. **Start services**
   ```bash
   make up
   ```

### Common Commands

```bash
make up           # Start all services
make down         # Stop all services
make restart      # Restart all services
make build        # Rebuild images
make rebuild      # Force rebuild all images
make fclean       # Full cleanup (removes containers, volumes, images)
```

## Authentication & Security

- **API Route Protection**: Enforced via `Remote-User` headers from `Caddy` + `Authelia`
- **Guacamole Users**: Auto-generated from `.env` values (`ADMIN_USER`, `GUAC_ACCESS_USERS`, `CON[n]_...`)
- **SSH Keys**: Required for remote operations and `Guacamole` connections
- **Single User Auth**: `Authelia` provides centralized login for all protected services

## Services Detail

### Dashboard

Centralized control panel built with `Node.js` and `Fastify`, providing observability and remote operations.

**Features:**
- Real-time monitoring of all nodes (PC, Raspberry Pi, VPS)
- Organized control panels: Power, Access, Services, AI, Telemetry, Commands
- Single operation point for remote access and AI service management

**PC (Windows x86_64):**
- **Power**: Wake on LAN, remote shutdown/reboot
- **Access**: SSH, VNC, RDP via Guacamole
- **Services**: FileBrowser, Torrent
- **AI**: ComfyUI, Open WebUI, ACE Step, Ollama
- **Telemetry**: CPU, RAM, GPU, VRAM, Disk status (C, D, E, G, V)
- **Commands**: Remote execution via K-Desktop

**Raspberry Pi (Linux ARM64):**
- **Power**: Remote shutdown/reboot
- **Access**: SSH via Guacamole
- **Services**: FileBrowser, Torrent
- **Telemetry**: CPU + temperature, RAM, root disk, external disk

**VPS (Linux x86_64):**
- **Access**: SSH via Guacamole
- **Services**: FileBrowser, Portainer
- **Telemetry**: CPU, RAM, root disk

### AI & Machine Learning Services

#### Open WebUI

Web chat frontend running on VPS with multi-model support.

- **Primary Backend**: Ollama (via WireGuard from PC)
- **Search Integration**: SearXNG for web-assisted responses
- **Image Generation**: ComfyUI workflow integration

#### ComfyUI

Node-based image and video generation interface running on PC (Windows).

- **Access**: Via WireGuard from VPS (port 8188)
- **Features**: Model workflows, LoRA (Low-Rank Adaptation) support
- **Models**: Primarily downloaded from CivitAI
- **Notes**: LoRA allows lightweight style/character/concept adaptations without full retraining

#### ACE Step

AI workflow and automation platform running on PC (Windows).

- **Access**: Via WireGuard from VPS (port 7860)
- **Purpose**: Step-based AI task automation and orchestration
- **Integration**: Accessible through dashboard and direct web interface

#### OpenClaw

Personal AI assistant with Telegram interface running on VPS.

- **Telegram Interface**: Direct chat with AI assistant
- **Backend**: Ollama via internal WireGuard network
- **Access**: Telegram bot integration
- **Token Required**: Set `OPENCLAW_TOKEN` in `.env`

#### Ollama

Local LLM (Large Language Model) runtime and REST API server.

- **Primary API**: `http://[IP]:11434`
- **Remote Access**: Requires `OLLAMA_HOST=0.0.0.0`
- **CORS**: Set `OLLAMA_ORIGINS=*` for broad usage
- **Runs on**: PC (Windows) over WireGuard

**Common Commands:**
```bash
ollama pull <model>      # Download model
ollama list              # List installed models
ollama run <model>       # Run model locally
```

**Windows Setup:**
1. Install from https://ollama.com/download
2. Exit from tray icon
3. Set environment variables:
   - `OLLAMA_HOST=0.0.0.0`
   - `OLLAMA_ORIGINS=*`
4. Restart Ollama

**Linux Setup:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl edit ollama.service
# Add in [Service]:
Environment="OLLAMA_HOST=0.0.0.0"
Environment="OLLAMA_ORIGINS=*"
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### Infrastructure Services

#### Caddy

Modern web server and reverse proxy serving as the main public entry point.

- **Automatic HTTPS**: TLS/SSL certificates managed automatically
- **Reverse Proxy**: Routes subdomains to Docker containers
- **Authentication**: Integrates with Authelia for access control
- **Features**: HTTP/2, gzip compression, security headers

#### Authelia

Centralized authentication and authorization layer.

- **Single Login**: One password for all protected services
- **Method**: Forward auth via Caddy headers
- **User Management**: Single user (configurable)
- **Session Control**: Automatic timeout and refresh tokens

#### WireGuard

Encrypted, high-performance VPN backbone connecting VPS, PC, and Raspberry Pi.

- **Purpose**: Securely bridge nodes behind `CG-NAT`
- **Low Latency**: Private network for service-to-service communication
- **Per-client Files**: `wireguard/peer_[client]/`

**Configuration Example:**
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

**Windows:**
1. Install from https://www.wireguard.com/install
2. Import `.conf` file
3. Activate tunnel

**Linux:**
```bash
sudo apt install wireguard
sudo cp peer.conf /etc/wireguard/wg0.conf
sudo chmod 600 /etc/wireguard/wg0.conf
sudo systemctl enable --now wg-quick@wg0
sudo wg show
```

### Remote Access Services

#### Guacamole

Web-based remote access gateway with no client required.

- **Supported Protocols**: SSH, VNC, RDP
- **Deployment**: Docker on VPS
- **Network**: Uses WireGuard to reach internal nodes
- **Users**: Auto-configured from `.env` values

**Connection Types:**
- **SSH**: Remote shell (port 22)
- **VNC**: Remote desktop stream (port 5900)
- **RDP**: Windows desktop (port 3389)

#### K-Desktop

Windows automation suite for remote operations.

- **GitHub**: https://github.com/Kobayashi82/K-Desktop
- **Language**: Visual Basic .NET
- **Features**: Remote commands (UDP), global shortcuts, screenshots, recordings
- **Used for**: Dashboard remote command execution on PC

### Data & File Services

#### FileBrowser

Web-based file manager for all nodes (VPS, PC, Raspberry Pi).

- **Access**: Three separate instances for each node
- **Features**: Web UI, no auth, configurable root directory
- **Instances**: 
  - VPS FileBrowser (port 8085)
  - PC FileBrowser (port 8085 via WireGuard)
  - Raspberry Pi FileBrowser (port 8085 via WireGuard)

**Common Arguments:**
| Argument            | Description                    |
|---------------------|--------------------------------|
| `-r <path>`         | Root directory to expose       |
| `-a <address>`      | Bind address (0.0.0.0 for all) |
| `-p <port>`         | Web port                       |
| `--noauth`          | Disable authentication         |
| `--database <path>` | Database config path           |

**Windows (portable):**
```bash
filebrowser.exe -r "C:\filebrowser" -a 0.0.0.0 -p 8085 --noauth --database "filebrowser.db"
```

**Windows Service (NSSM):**
```bash
nssm install filebrowser
nssm set filebrowser Application "C:\path\to\filebrowser.exe"
nssm set filebrowser AppDirectory "C:\path\to\FileBrowser"
nssm set filebrowser AppParameters "-r D:\filebrowser -a 0.0.0.0 -p 8085 --noauth --database filebrowser.db"
nssm start filebrowser
```

**Linux:**
```bash
# Download
wget https://github.com/filebrowser/filebrowser/releases/latest/download/linux-amd64-filebrowser.tar.gz
tar -xzf linux-amd64-filebrowser.tar.gz
sudo mv filebrowser /usr/local/bin/

# Run
filebrowser -r /home/user -a 0.0.0.0 -p 8085 --noauth --database /opt/filebrowser/filebrowser.db
```

**Systemd Service:**
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

#### Torrent

P2P file transfer service for distributed sharing.

- **Purpose**: Decentralized file sharing
- **Web UI**: Access at `http://[IP]:8080`
- **Instances**: PC and Raspberry Pi

**Windows:**
1. Install from https://www.qbittorrent.com/download
2. Complete setup
3. Enable Web UI in settings

**Linux:**
```bash
sudo apt install qbittorrent-nox
sudo systemctl enable --now qbittorrent-nox
# Get default password
sudo journalctl -u qbittorrent-nox | grep password
```

### Utility Services

#### SearXNG

Open-source meta-search engine for web-assisted AI responses.

- **Purpose**: Aggregate results from multiple search engines
- **Privacy**: Reduces direct tracking and profiling
- **Integration**: Used by Open WebUI for enhanced responses
- **Deployment**: Docker on VPS

#### Portainer

Docker management UI for container and service administration.

- **Features**: Container management, image management, volume control, log viewing
- **Access**: Web UI dashboard
- **Capabilities**: Restart services, inspect logs, monitor deployments
- **Simplifies**: Day-to-day operations in multi-service environment

### Monitoring & Telemetry

#### Dashboard API

REST API service providing system metrics and node operations.

- **Framework**: Node.js + Fastify
- **Port**: 4000 (internal)
- **Features**: Real-time metrics collection, remote command execution
- **Telemetry Sources**: Python clients on each node

#### Telemetry Clients

Python-based metric collection services running on each node.

**Windows (PC):**
- System metrics: IP, CPU, RAM (total/used/percent)
- GPU metrics: Name, load, VRAM (total/used/free), temperature, multi-GPU support
- Disk metrics: Size/used/free/percent for each mounted drive

**Linux (Raspberry Pi):**
- System metrics: IP, CPU, RAM, CPU temperature
- GPU metrics: VideoCore IV name and memory allocation
- Disk metrics: Root (/), firmware, external mount (/mnt/externo)

## VPS Base Setup

Recommended baseline to prepare the VPS before deploying Project AI services.

### VPS Creation & Access

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

### User & Security Setup

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

### Docker Installation

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
