<div align="center">

![Infraestructura](https://img.shields.io/badge/Infraestructura-VPS%20Docker-2f855a?style=for-the-badge)
![Red](https://img.shields.io/badge/Red-WireGuard-1f6feb?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Dashboard-Monitorizacion-8a5cf6?style=for-the-badge)

*Dashboard unificado para operaciones remotas, multimedia, gaming, servicios de IA y monitorizacion*

</div>

<div align="center">
  <img src="/images/ProjectAI_w.png">
</div>

# Project AI

`Project AI` es una plataforma centralizada de servicios alojada en un `VPS` con `Docker`. Proporciona acceso unificado a servicios de IA, streaming multimedia, operaciones remotas y monitorizacion en tiempo real.

> [!WARNING]
> Esto es un proyecto personal y puede contener errores o funciones incompletas. Úsalo bajo tu propia responsabilidad.

## Tabla de Contenidos

1. [Vision General](#vision-general)
2. [Instalación](#instalación)
3. [Nodos y Servicios](#nodos-y-servicios)
4. [Licencia](#licencia)

## Vision General

### Caracteristicas Principales

- **Control Remoto**: Gestion de energia, control de servicios y comandos del sistema
- **Enfocado en Privacidad**: Infraestructura local integrada con `WireGuard`
- **Operaciones Remotas Seguras**: Acceso `SSH`, `VNC`, `RDP` a traves de `Guacamole`
- **IA Centralizada**: `ACE Step`, `ComfyUI` y `Open WebUI` desde un unico dashboard
- **Centro Multimedia**: `Jellyfin` y `Navidrome` para streaming
- **Juego remoto**: `Sunshine`, `Moonlight` y `RomM` para consolas retro
- **Monitorizacion en Tiempo Real**: Metricas en vivo (CPU, RAM, GPU, discos) y `Uptime Kuma` para alertas

### Seguridad

- **Autenticacion de Usuario Unico**: `Authelia` proporciona login centralizado para servicios protegidos
- **Proteccion de Rutas API**: Aplicada mediante encabezados `Remote-User` de `Caddy` + `Authelia`
- **Claves SSH**: Requeridas para operaciones remotas y conexiones `Guacamole`

### Infraestructura

El sistema se construye sobre:

- **Dashboard** para control central y operaciones remotas
- **Caddy** como servidor web y reverse proxy de entrada publica
- **Authelia** para autenticacion y gestion de sesiones
- **WireGuard** para conectar de forma segura `PC` y `RPI` tras `CG-NAT`
- **Guacamole** para gestion de sesiones remotas (`SSH`, `VNC`, `RDP`)
- **Docker Compose** para orquestacion de servicios

```
VPS → Caddy ─────────→ WireGuard
      ↓                ↓
      ├→ Authelia      ├→ PC
      ├→ Portainer     │  ├→ File Browser
      ├→ Uptime Kuma   │  ├→ VSCode
      ├→ Guacamole     │  ├→ Navidrome
      ├→ File Browser  │  ├→ Jellyfin
      ├→ Navidrome     │  ├→ Torrent
      ├→ RomM          │  ├→ Sunshine
      ├→ Open WebUI    │  ├→ Moonlight
      └→ SearXNG       │  ├→ ACE Step
                       │  ├→ ComfyUI
                       │  ├→ Ollama
                       │  └→ Speaches
                       └→ RPI
                          ├→ File Browser
                          └→ Torrent
```

---

## Instalación

1. **Establecer valores**
```bash
# Modificar variables en authelia.sh
# Modificar variables en guacamole.sh
# Modificar domain en docker-compose.yml
# Modificar domain en caddy/Caddyfile
# Modificar domain en dashboard/front/vite.config.ts
```

2. **Configurar claves privadas**
```bash
# Colocar claves SSH privadas en scripts/keys/
# Deben coincidir con valores de `Guacamole.sh`:
#   - API_SSH_KEY (para comandos remotos del API)
#   - CON[n]_KEY (para conexiones SSH de Guacamole)
```

3. **Inicializar configuracion**
```bash
make init

# Genera:
#   - authelia/configuration.yml
#   - authelia/users.yml
#   - guacamole/001-initdb.sql
#   - guacamole/002-seed-connections.sql
#   - searxng/settings.yml
#   - dashboard/api/privatekey
```

4. **Iniciar servicios**
```bash
make up
```

5. **Configurar `iptables`
Añadir al archivo `wireguard/wg_confs/wg0.conf` en la sección `[Interface]`

```bash
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth+ -j MASQUERADE; iptables -t nat -A PREROUTING -i eth+ -p udp --dport 51820 -j RETURN; iptables -t nat -A PREROUTING -i eth+ -p tcp --dport 4000 -j REDIRECT --to-ports 4000; iptables -t nat -A PREROUTING -i eth+ -p tcp --dport 4822 -j REDIRECT --to-ports 4822; iptables -t nat -A PREROUTING -i eth+ -p tcp --dport 8081 -j REDIRECT --to-ports 8081; iptables -t nat -A PREROUTING -i eth+ -p tcp --dport 8899 -j DNAT --to-destination 10.0.0.3; iptables -t nat -A PREROUTING -i eth+ -p tcp --dport 8086 -j DNAT --to-destination 10.0.0.3; iptables -t nat -A PREROUTING -i eth+ -p tcp --dport 2023 -j DNAT --to-destination 10.0.0.3:22; iptables -t nat -A PREROUTING -i eth+ -p tcp -j DNAT --to-destination 10.0.0.2; iptables -t nat -A PREROUTING -i eth+ -p udp -j DNAT --to-destination 10.0.0.2; iptables -t nat -A POSTROUTING -d 10.0.0.2 -j MASQUERADE; iptables -t nat -A POSTROUTING -d 10.0.0.3 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth+ -j MASQUERADE; iptables -t nat -D PREROUTING -i eth+ -p udp --dport 51820 -j RETURN; iptables -t nat -D PREROUTING -i eth+ -p tcp --dport 4000 -j REDIRECT --to-ports 4000; iptables -t nat -D PREROUTING -i eth+ -p tcp --dport 4822 -j REDIRECT --to-ports 4822; iptables -t nat -D PREROUTING -i eth+ -p tcp --dport 8081 -j REDIRECT --to-ports 8081; iptables -t nat -D PREROUTING -i eth+ -p tcp --dport 8899 -j DNAT --to-destination 10.0.0.3; iptables -t nat -D PREROUTING -i eth+ -p tcp --dport 8086 -j DNAT --to-destination 10.0.0.3; iptables -t nat -D PREROUTING -i eth+ -p tcp --dport 2023 -j DNAT --to-destination 10.0.0.3:22; iptables -t nat -D PREROUTING -i eth+ -p tcp -j DNAT --to-destination 10.0.0.2; iptables -t nat -D PREROUTING -i eth+ -p udp -j DNAT --to-destination 10.0.0.2; iptables -t nat -D POSTROUTING -d 10.0.0.2 -j MASQUERADE; iptables -t nat -D POSTROUTING -d 10.0.0.3 -j MASQUERADE
MTU = 1280
```

4. **Reiniciar servicios**
```bash
make restart
```

---

## Nodos y Servicios

| NODO  | DESCRIPCIÓN                                                                       |
|-------|-----------------------------------------------------------------------------------|
| `VPS` | *Hetzner CPX32 — 4 vCPU AMD compartidas, 8GB RAM, Ubuntu*                         |
| `RPI` | *Raspberry Pi 3B+ — ARM Cortex-A53 1.4GHz, 1GB RAM, Raspberry Pi OS*              |
| `PC`  | *Ryzen 7 7800X3D 8-cores, RTX 4070 Super 12GB VRAM, 64GB DDR5 6000MHz, Windows 11* |

| SERVICIO            | NODO | URL                         | PUERTO | DESCRIPCIÓN                                    |
|---------------------|----- |-----------------------------|--------|------------------------------------------------|
| `Caddy`             | VPS  | mydomain.net                | 80/443 | Servidor web y proxy inverso                   |
| `Authelia`          | VPS  | auth.mydomain.net           | 9091   | Autenticación centralizada                     |
| `WireGuard`         | VPS  | mydomain.net (UDP)          | 51820  | Túnel `VPN` cifrado                            |
| `Portainer`         | VPS  | portainer.mydomain.net      | 9000   | Gestión de contenedores `Docker`               |
| `Uptime Kuma`       | VPS  | kuma.mydomain.net           | 3001   | Monitorización con alertas por `Telegram`      |
| `Guacamole`         | VPS  | guacamole.mydomain.net      | 8080   | Gateway de acceso remoto (`RDP`, `SSH`, `VNC`) |
| `File Browser`      | VPS  | files.vps.mydomain.net      | 8085   | Gestor de archivos                             |
| `Navidrome`         | VPS  | navidrome.mydomain.net      | 4533   | Servidor de música                             |
| `RomM`              | VPS  | romm.mydomain.net           | 8080   | Emulador de consolas retro                     |
| `SearXNG`           | VPS  | searxng.mydomain.net        | 8888   | Meta-Buscador privado                          |
| `API`               | VPS  | mydomain.net/api (internal) | 4000   | Backend de la aplicación                       |
| `Front`             | VPS  | mydomain.net                | 80     | Frontend de la aplicación                      |
| `SSH`               | VPS  | mydomain.net                | 22     | Acceso remoto a la terminal                    |
| `SSH (PC)`          | VPS  | mydomain.net                | 2022   | Túnel SSH hacia `PC`                           |
| `SSH (RPI)`         | VPS  | mydomain.net                | 2022   | Túnel SSH hacia `RPI`                          |

| SERVICIO            | NODO | URL                         | PUERTO | DESCRIPCIÓN                                    |
|---------------------|----- |-----------------------------|--------|------------------------------------------------|
| `Shutdown`          | RPi  | API (internal)              | 22     | Apagado remoto                                 |
| `Reboot`            | RPi  | API (internal)              | 22     | Reinicio remoto                                |
| `SSH`               | RPi  | guacamole (internal)        | 22     | Acceso remoto a la terminal                    |
| `File Browser`      | RPi  | files.rpi.mydomain.net      | 8085   | Gestor de archivos                             |
| `Torrent`           | RPi  | torrent.rpi.mydomain.net    | 8899   | Cliente torrent                                |
| `Telemetría`        | PC   | WireGuard (internal)        | 8000   | Métricas en tiempo real (CPU, RAM, GPU, disco) |

| SERVICIO            | NODO | URL                         | PUERTO | DESCRIPCIÓN                                    |
|---------------------|----- |-----------------------------|--------|------------------------------------------------|
| `Wake`              | RPi  | API (internal)              | 22     | Encendido remoto                               |
| `Shutdown`          | PC   | API (internal)              | 22     | Apagado remoto                                 |
| `Reboot`            | PC   | API (internal)              | 22     | Reinicio remoto                                |
| `SSH`               | PC   | guacamole (internal)        | 22     | Acceso remoto a la terminal                    |
| `VNC`               | PC   | guacamole (internal)        | 5900   | Acceso remoto al escritorio                    |
| `RDP`               | PC   | guacamole (internal)        | 3389   | Acceso remoto al escritorio con `RDP`          |
| `File Browser`      | PC   | files.pc.mydomain.net       | 8085   | Gestor de archivos                             |
| `VSCode`            | PC   | vscode.mydomain.net         | 7777   | Editor de código                               |
| `Navidrome`         | PC   | navidrome.pc.mydomain.net   | 7775   | Servidor de música                             |
| `Jellyfin`          | PC   | jellyfin.mydomain.net       | 8096   | Servidor multimedia                            |
| `Torrent`           | PC   | torrent.mydomain.net        | 8899   | Cliente torrent                                |
| • `Sunshine`        | PC   | sunshine.mydomain.net       | 47990  | Servidor de streaming                          |
| • `Moonlight`       | PC   | moonlight.mydomain.net      | 7891   | Cliente de streaming                           |
| `ACE Step`          | PC   | acestep.mydomain.net        | 7860   | Generación de música                           |
| `ComfyUI`           | PC   | comfyui.mydomain.net        | 8188   | Generación de imágen y vídeo                   |
| • `Open WebUI`      | VPS  | openwebui.mydomain.net      | 8081   | Interfaz para modelos `LLM`                    |
| `Ollama`            | PC   | WireGuard (internal)        | 11434  | Servidor de modelos `LLM`                      |
| `Speaches`          | PC   | WireGuard (internal)        | 8010   | Síntesis y transcripción de voz `TTS`/`STT`    |
| `K-Desktop`         | PC   | WireGuard (internal)        | 2501   | Ejecución de comandos remotos                  |
| `Telemetría`        | PC   | WireGuard (internal)        | 8000   | Métricas en tiempo real (CPU, RAM, GPU, disco) |

### • Sunshine

| SERVICIO            | PROTOCOL | PUERTO      |
|---------------------|----------|-------------|
| `Portal`            | HTTPS    | 47990       |
| `Emparejamiento`    | HTTPS    | 47984       |
| `Emparejamiento`    | HTTP     | 47989       |
| `Control de Stream` | TCP      | 48010       |
| `Vídeo y Audio`     | UDP      | 47998-48000 |
| `Audio`             | UDP      | 48002       |
| `Micrófono`         | UDP      | 48004       |

### • Moonlight

| SERVICIO            | PROTOCOL | PUERTO      |
|---------------------|----------|-------------|
| `Portal`            | HTTP     | 7891        |
| `Comunicación`      | UDP      | 40000-40100 |

```bash
# Iniciar moonlight-web en PC
docker run -d --name moonlight-web --restart always -p 7891:8080 -p 40000-40100:40000-40100/udp -e WEBRTC_NAT_1TO1_HOST=DOMAIN_IP -v moonlight-data:/server mrcreativ3001/moonlight-web-stream:latest
```

### • Open WebUI

| SERVICIO            | PUERTO                                           |
|--------------------|--------------------------------------------------|
| `Search`            | http://searxng:8888/search?q=<query>&format=json |
| `STT`               | http://10.0.0.2:8010/v1                          |
| `STT Model`         | Systran/faster-whisper-large-v3                  |
| `TTS`               | http://10.0.0.2:8010/v1                          |
| `TTS Model`         | speaches-ai/piper-es_ES-davefx-medium            |
| `TTS Voice`         | davefx                                           |
| `ComfyUI`           | http://10.0.0.2:8188                             |
| `ComfyUI Model`     | Flux 2 Klein 9B fp8.safetensors                  |
| `ComfyUI Image`     | 512x512                                          |
| `ComfyUI Steps`     | 4                                                |
| `ComfyUI prompt`    | 439                                              |
| `ComfyUI ckpt_name` | 433                                              |
| `ComfyUI width`     | 438                                              |
| `ComfyUI height`    | 438                                              |
| `ComfyUI steps`     | 430                                              |
| `ComfyUI seed`      | 430                                              |

## Licencia

Este proyecto esta licenciado bajo la WTFPL - [Do What the Fuck You Want to Public License](http://www.wtfpl.net/about/).

---

<div align="center">

**🤖 Desarrollado por Kobayashi82 🤖**

*"Keep it local. Keep it free"*
