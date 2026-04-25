<div align="center">

![Infraestructura](https://img.shields.io/badge/Infraestructura-VPS%20Docker-2f855a?style=for-the-badge)
![Red](https://img.shields.io/badge/Red-WireGuard-1f6feb?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Dashboard-Monitorizacion-8a5cf6?style=for-the-badge)

*Dashboard unificado centrado en Open WebUI, ComfyUI y OpenClaw para un entorno domestico y VPS*

</div>

<div align="center">
  <img src="/images/ProjectAI.jpg">
</div>

# Project AI

[README in English](README.md)

`Project AI` es un `dashboard` web centralizado alojado en un `VPS` con `Docker`, enfocado en `Open WebUI`, `ComfyUI` y `OpenClaw` con monitorizacion y control remoto integrados.

## Enfoque Principal

- Acceso centralizado a `Open WebUI`
- Acceso centralizado a `ComfyUI`
- Acceso centralizado a `OpenClaw`
- Panel unificado de control y lanzamiento rapido de servicios

## Vista General de Infraestructura

`ProjectAI` conecta y gestiona:

- `PADRE` PC Windows detras de `CG-NAT`, conectado mediante `WireGuard`
- `Raspberry Pi` detras de `CG-NAT`, conectado mediante `WireGuard` y en la misma red local que el nodo `PADRE`
- `VPS` maquina host

## Arquitectura

La arquitectura se basa en:

- `Dashboard` en el `VPS` para observabilidad y operaciones remotas
- `Caddy` como servidor web y reverse proxy
- `Authelia` como autenticacion unica de un solo usuario (solo contraseña)
- `WireGuard` para alcanzar de forma segura Windows y `Raspberry Pi` detras de `CG-NAT`
- `Guacamole` para la conexión con servidores de control remoto

### Estructura de Nodos

- `PADRE`:
  - **Acciones de energia**: encender (a traves de `Raspberry Pi`), apagar, reiniciar
  - **Recursos**: CPU, GPU, RAM, VRAM, temperatura de GPU, uso de discos
  - **Servicios de acceso**: `File Browser`, `SSH`, `VNC`, `RDP`
  - **Servicios de aplicaciones**: `Open WebUI`, `ComfyUI`, `OpenClaw`
- `Raspberry Pi`:
  - **Acciones de energia**: apagar, reiniciar
  - **Recursos**: mismo modelo de dashboard que `PADRE` donde aplique
  - **Servicios de acceso**: `SSH`, `File Browser`
- `VPS`:
  - **Recursos**: mismo modelo de dashboard que `PADRE` donde aplique
  - **Servicios de acceso**: `SSH`, `File Browser`

---

## Más información

[Authelia](doc/Authelia.md)  
[Caddy](doc/Caddy.md)  
[ComfyUI](doc/ComfyUI.md)  
[Dashboard](doc/Dashboard.md)  
[FileBrowser](doc/FileBrowser.md)  
[Guacamole](doc/Guacamole.md)  
[K-Desktop](doc/K.md)  
[Ollama](doc/Ollama.md)  
[OpenClaw](doc/OpenClaw.md)  
[Open WebUI](doc/Open.md)  
[Portainer](doc/Portainer.md)  
[SearXNG](doc/SearXNG.md)  
[Telemetría](doc/Telemetría.md)  
[Torrent](doc/Torrent.md)  
[VPS](doc/VPS.md)  
[WireGuard](doc/WireGuard.md)  

---

## Licencia

Este proyecto esta licenciado bajo la WTFPL - [Do What the Fuck You Want to Public License](http://www.wtfpl.net/about/).

---

<div align="center">

**🤖 Developed by Kobayashi82 🤖**

*"Keep it local. Keep it free"*

<div align="center">
  <img src="/images/ProjectAI_web.png">
</div>
