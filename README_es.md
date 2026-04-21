<div align="center">

![WIP](https://img.shields.io/badge/work%20in%20progress-yellow?style=for-the-badge)
![Infraestructura](https://img.shields.io/badge/Infraestructura-VPS%20Docker-2f855a?style=for-the-badge)
![Red](https://img.shields.io/badge/Red-WireGuard-1f6feb?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Dashboard-Monitorizacion-8a5cf6?style=for-the-badge)

*Dashboard unificado centrado en Open WebUI, ComfyUI y OpenClaw para un entorno domestico y VPS*

</div>

<div align="center">
  <img src="/images/W_ProjectAI.jpg">
</div>

# ProjectAI

[README in English](README.md)

ProjectAI es un dashboard web centralizado alojado en un VPS con Docker, enfocado en Open WebUI, ComfyUI y OpenClaw con monitorizacion y control remoto integrados entre nodos.

## Enfoque Principal

- Acceso centralizado a Open WebUI
- Acceso centralizado a ComfyUI
- Acceso centralizado a OpenClaw
- Panel unificado de control y lanzamiento rapido de servicios

## Vista General de Infraestructura

ProjectAI conecta y gestiona:

- Nodo PADRE (PC Windows detras de CG-NAT, conectado mediante WireGuard)
- Nodo Raspberry Pi (detras de CG-NAT, conectado mediante WireGuard y en la misma red local que el nodo PADRE)
- Nodo VPS (maquina host)
- Contenedores Docker ejecutandose dentro del VPS

## Arquitectura

La arquitectura se basa en:

- Servicio de dashboard en el VPS para observabilidad y operaciones remotas
- Caddy como servidor web y reverse proxy
- Authelia como autenticacion unica de un solo usuario (solo contrasena)
- Tunel WireGuard para alcanzar de forma segura Windows y Raspberry Pi detras de CG-NAT
- Servicios dockerizados para despliegue y mantenimiento modulares
- Agentes ligeros e integraciones por nodo para metricas y acciones

### Estructura de Nodos

- PADRE (Windows):
  - Acciones de energia: encender (a traves de Raspberry Pi), apagar, reiniciar
  - Recursos: CPU, GPU, RAM, VRAM, temperatura de CPU, temperatura de GPU, uso de discos
  - Servicios de acceso: File Browser, SSH, VNC, RDP
  - Servicios de aplicaciones: Open WebUI, ComfyUI, OpenClaw
- Raspberry Pi:
  - Acciones de energia: apagar, reiniciar
  - Recursos: mismo modelo de dashboard que PADRE donde aplique
  - Servicios de acceso: SSH, File Browser
- VPS:
  - Recursos: mismo modelo de dashboard que PADRE donde aplique
  - Servicios de acceso: SSH, File Browser
- Contenedores Docker en el VPS:
  - Monitorizacion de recursos por contenedor

## Modulos

### Modulos Principales

- Dashboard unificado para visibilidad de nodos y servicios
- Modelo de conectividad segura con WireGuard
- Capa web basada en Caddy
- Single sign-on con Authelia (un usuario, solo contrasena)
- Acciones remotas de energia y ciclo de vida para hosts gestionados
- Panel de lanzamiento y acceso a multiples servicios

### Modulos Secundarios

- Metricas historicas y vistas basicas de tendencia
- Health checks y alertas de estado de servicios
- Autenticacion y control de acceso por roles
- Perfiles de entorno para homelab y modos tipo produccion

---

## Licencia

Este proyecto esta licenciado bajo la WTFPL - [Do What the Fuck You Want to Public License](http://www.wtfpl.net/about/).

---

<div align="center">

**🤖 Developed by Kobayashi82 🤖**

*"Keep it local. Keep it free"*

<div align="center">
  <img src="/images/ProjectAI_web.jpg">
</div>
