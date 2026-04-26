<div align="center">

![Infrastructure](https://img.shields.io/badge/Infrastructure-VPS%20Docker-2f855a?style=for-the-badge)
![Network](https://img.shields.io/badge/Network-WireGuard-1f6feb?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Dashboard-Monitoring-8a5cf6?style=for-the-badge)

*Unified dashboard focused on Open WebUI, ComfyUI and OpenClaw in a home and VPS environment*

</div>

<div align="center">
  <img src="/images/ProjectAI.jpg">
</div>

# ProjectAI

[README en Espanol](README_es.md)

`Project AI` is a centralized web `dashboard` hosted on a `VPS` with `Docker`, focused on `Open WebUI`, `ComfyUI`, and `OpenClaw` with integrated monitoring and remote control across nodes.

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


### Node Structure

- `PADRE`:
  - **Power actions**: turn on (through `Raspberry Pi`), shutdown, reboot
  - **Resources**: CPU, GPU, RAM, VRAM, GPU temperature, disk usage
  - **Access services**: `File Browser`, `SSH`, `VNC`, `RDP`
  - **Application services**: `Open WebUI`, `ComfyUI`, `OpenClaw`
- `Raspberry Pi`:
  - **Power actions**: shutdown, reboot
  - **Resources**: same dashboard model as parent where available
  - **Access services**: `SSH`, `File Browser`
- `VPS`:
  - **Resources**: same dashboard model as parent where available
  - **Access services**: `SSH`, `File Browser`

---

## More information

[Authelia](doc/Authelia.md)  
[Caddy](doc/Caddy.md)  
[ComfyUI](doc/ComfyUI.md)  
[Dashboard](doc/Dashboard.md)  
[FileBrowser](doc/FileBrowser.md)  
[Guacamole](doc/Guacamole.md)  
[K-Desktop](doc/K-Desktop.md)  
[Ollama](doc/Ollama.md)  
[OpenClaw](doc/OpenClaw.md)  
[Open WebUI](doc/OpenWebUI.md)  
[Portainer](doc/Portainer.md)  
[SearXNG](doc/SearXNG.md)  
[Telemetría](doc/Telemetría.md)  
[Torrent](doc/Torrent.md)  
[VPS](doc/VPS.md)  
[WireGuard](doc/WireGuard.md)  

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
