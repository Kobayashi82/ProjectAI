<div align="center">

![WIP](https://img.shields.io/badge/work%20in%20progress-yellow?style=for-the-badge)
![Infrastructure](https://img.shields.io/badge/Infrastructure-VPS%20Docker-2f855a?style=for-the-badge)
![Network](https://img.shields.io/badge/Network-WireGuard-1f6feb?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Dashboard-Monitoring-8a5cf6?style=for-the-badge)

*Unified dashboard focused on Open WebUI, ComfyUI and OpenClaw in a home and VPS environment*

</div>

<div align="center">
  <img src="/images/W_ProjectAI.jpg">
</div>

# ProjectAI

[README en Espanol](README_es.md)

ProjectAI is a centralized web dashboard hosted on a VPS with Docker, focused on Open WebUI, ComfyUI, and OpenClaw with integrated monitoring and remote control across nodes.

## Main Focus

- Open WebUI centralized access
- ComfyUI centralized access
- OpenClaw centralized access
- Unified service control and quick launch panel

## Infrastructure Overview

ProjectAI connects and manages:

- PADRE node (Windows PC behind CG-NAT, connected through WireGuard)
- Raspberry Pi node (behind CG-NAT, connected through WireGuard, same local network as PADRE node)
- VPS node (host machine)
- Docker containers running inside the VPS

## Architecture

The architecture is based on:

- Dashboard service on VPS for observability and remote operations
- Caddy as the web server and reverse proxy
- Authelia as single-user authentication (password-only login)
- WireGuard tunnel to securely reach Windows and Raspberry Pi behind CG-NAT
- Dockerized services for modular deployment and maintenance
- Lightweight agents and integrations per node for metrics and actions

### Node Structure

- Parent (Windows):
  - Power actions: turn on (through Raspberry Pi), shutdown, reboot
  - Resources: CPU, GPU, RAM, VRAM, CPU temperature, GPU temperature, disk usage
  - Access services: File Browser, SSH, VNC, RDP
  - Application services: Open WebUI, ComfyUI, OpenClaw
- Raspberry Pi:
  - Power actions: shutdown, reboot
  - Resources: same dashboard model as parent where available
  - Access services: SSH, File Browser
- VPS:
  - Resources: same dashboard model as parent where available
  - Access services: SSH, File Browser
- Docker containers on VPS:
  - Per-container resource monitoring

## Modules

### Core Modules

- Unified dashboard for node and service visibility
- Secure connectivity model with WireGuard
- Caddy-based web access layer
- Authelia single sign-on (one user, password-only)
- Remote power and lifecycle actions for managed hosts
- Multi-service launch and access panel

### Secondary Modules

- Historical metrics and basic trend views
- Health checks and service status alerts
- Authentication and role-based access
- Environment profiles for home lab and production-like modes

---

## License

This project is licensed under the WTFPL - [Do What the Fuck You Want to Public License](http://www.wtfpl.net/about/).

---

<div align="center">

**🤖 Developed by Kobayashi82 🤖**

*"Keep it local. Keep it free"*

<div align="center">
  <img src="/images/ProjectAI_web.jpg">
</div>
