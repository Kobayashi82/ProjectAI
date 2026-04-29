<div align="center">

![Infraestructura](https://img.shields.io/badge/Infraestructura-VPS%20Docker-2f855a?style=for-the-badge)
![Red](https://img.shields.io/badge/Red-WireGuard-1f6feb?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Dashboard-Monitorizacion-8a5cf6?style=for-the-badge)

*Dashboard unificado para servicios de IA, operaciones remotas y monitorizacion en entornos domesticos y VPS*

</div>

<div align="center">
  <img src="/images/ProjectAI_w.png">
</div>

# Project AI

[README in English](README.md)

`Project AI` es una plataforma centralizada de `dashboard` y servicios alojada en un `VPS` con `Docker`. Proporciona acceso unificado a servicios de IA, streaming multimedia, operaciones remotas y monitorizacion en tiempo real de nodos distribuidos.

## Tabla de Contenidos

1. [Vision General](#vision-general)
2. [Infraestructura](#infraestructura)
3. [Servicios](#servicios)
4. [Instalacion](#instalacion)
5. [VPS](#vps)
6. [Licencia](#licencia)

## Vision General

### Caracteristicas Principales

- **Control Remoto**: Gestion de energia, control de servicios y comandos del sistema
- **Enfocado en Privacidad**: Infraestructura local integrada con `WireGuard`
- **Operaciones Remotas Seguras**: Acceso `SSH`, `VNC`, `RDP` a traves de `Guacamole`
- **IA Centralizada**: `ACE Step`, `ComfyUI` y `Open WebUI` desde un unico dashboard
- **Centro Multimedia**: `Jellyfin` para streaming local
- **Monitorizacion en Tiempo Real**: Metricas en vivo de todos los nodos (CPU, RAM, GPU, discos)

### Seguridad

- **Autenticacion de Usuario Unico**: `Authelia` proporciona login centralizado para servicios protegidos
- **Proteccion de Rutas API**: Aplicada mediante encabezados `Remote-User` de `Caddy` + `Authelia`
- **Claves SSH**: Requeridas para operaciones remotas y conexiones `Guacamole`

## Infraestructura

El sistema se construye sobre:

- **Dashboard** para control central y operaciones remotas
- **Caddy** como servidor web y reverse proxy de entrada publica
- **Authelia** para autenticacion y gestion de sesiones
- **WireGuard** para conectar de forma segura `PC` y `RPI` tras `CG-NAT`
- **Guacamole** para gestion de sesiones remotas (`SSH`, `VNC`, `RDP`)
- **Docker Compose** para orquestacion de servicios

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

Servidor web moderno y reverse proxy.

- **HTTPS Automatico**: Certificados TLS/SSL gestionados automaticamente
- **Reverse Proxy**: Enruta subdominios a contenedores Docker
- **Autenticacion**: Se integra con Authelia para control de acceso

### Authelia

Autenticacion centralizada.

- **Login Unico**: Una contraseña para todos los servicios protegidos
- **Metodo**: Forward auth via encabezados de Caddy
- **Control de Sesiones**: Timeout automatico y tokens de refresco

### Portainer

Gestion de Docker para contenedores.

- **Caracteristicas**: Gestion de contenedores, imagenes, volumenes, visualizacion de logs
- **Capacidades**: Reiniciar servicios, inspeccionar logs, monitorizar despliegues

### WireGuard

`VPN` cifrada y de alto rendimiento que conecta `VPS`, `PC` y `RPI`.

- **Caracteristica**: Conecta nodos de forma segura tras `CG-NAT`
- **Baja Latencia**: Red privada para comunicacion servicio-a-servicio

### Guacamole

Gateway de acceso remoto.

- **Protocolos Soportados**: `SSH`, `VNC`, `RDP`

## Servicios

### FileBrowser

Gestor web de archivos.

- **Acceso**: Via `WireGuard` desde `VPS`
- **Caracteristica**: Navegar, subir y gestionar archivos remotamente

### Jellyfin

Servidor multimedia autoalojado.

- **Acceso**: Via `WireGuard` desde `VPS`
- **Caracteristica**: Streaming de peliculas, series y musica

### Torrent

Servicio P2P de transferencia de archivos.

- **Acceso**: Via `WireGuard` desde `VPS`
- **Caracteristica**: Sembrar y descargar archivos

### ACE Step

Plataforma de generacion musical con IA.

- **Acceso**: Via `WireGuard` desde `VPS`
- **Caracteristica**: Generar musica desde prompts y presets

### ComfyUI

Generacion de imagen y video.

- **Acceso**: Via `WireGuard` desde `VPS`
- **Caracteristica**: Flujos visuales y nodos

### Open WebUI

Interfaz web de chat con soporte multi-modelo.

- **Caracteristica**: Chat con modelos `LLM`
- **Backend Principal**: `Ollama` (via `WireGuard` desde `PC`)
- **Integracion de Busqueda**: `SearXNG` para respuestas asistidas
- **Generacion de Imagenes**: `ComfyUI` (via `WireGuard` desde `PC`)

### K-Desktop

Suite de automatizacion Windows.

- **Acceso**: Via `WireGuard` desde `VPS`
- **Caracteristicas**: Comandos remotos (`UDP`), atajos globales, capturas, grabaciones
- **GitHub**: https://github.com/Kobayashi82/K-Desktop

### Telemetria

Servicios de metricas ejecutados en cada nodo.

- **Sistema**: CPU, RAM, temperatura
- **GPU**: Carga, VRAM, temperatura
- **Discos**: Usado y total por unidad montada

---

## Instalacion

1. **Copiar y configurar `.env`**
```bash
cp .env.example .env
# Editar .env con dominios, usuarios, IPs y puertos
```

2. **Configurar claves privadas**
```bash
# Colocar claves SSH privadas en scripts/keys/
# Renombrar/mover para que coincidan con valores de .env:
#   - API_SSH_KEY (para comandos remotos del API)
#   - CON[n]_KEY (para conexiones SSH de Guacamole)
```

3. **Inicializar configuracion**
```bash
make init
# Genera:
#   - authelia/configuration.yml
#   - authelia/users.yml
#   - caddy/Caddyfile
#   - guacamole/001-initdb.sql
#   - guacamole/002-seed-connections.sql
#   - jellyfin/ (config del contenedor)
#   - searxng/settings.yml
#   - dashboard/api/privatekey
```

4. **Iniciar servicios**
```bash
make up           # Iniciar todos los servicios
make down         # Detener todos los servicios
make restart      # Reiniciar todos los servicios
make build        # Reconstruir imagenes
make rebuild      # Forzar reconstruccion de todas las imagenes
make fclean       # Limpieza completa (elimina contenedores, volumenes, imagenes)
```

---

## VPS

Linea base recomendada para preparar el `VPS` antes de desplegar servicios de `Project AI`.

### Creacion y Acceso

1. **Crear VPS** con tu proveedor preferido y obtener IP
2. **Usar claves SSH** en lugar de autenticacion por contraseña
3. **Cambiar contraseña root** si es necesario: `passwd root`

### Configuracion SSH

**Generar clave SSH:**
```bash
ssh-keygen -t ed25519 -C "identificador"
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**Archivo de configuracion SSH** (`~/.ssh/config`):
```ini
Host [NombreServidor]
  HostName [IPServidor]
  User root
  IdentityFile ~/.ssh/identificador
```

**Hardening SSH** (`/etc/ssh/sshd_config`):
```ini
PermitRootLogin prohibit-password
PubkeyAuthentication yes
PasswordAuthentication no
```

Aplicar cambios:
```bash
systemctl restart ssh
```

### Usuario y Seguridad

**Crear usuario con sudo:**
```bash
adduser [usuario]
usermod -aG sudo [usuario]
```

**Ocultar banner de login (opcional):**
```bash
touch ~/.hushlogin
```

**Configurar Fail2ban:**
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
sudo usermod -aG docker [usuario]
newgrp docker
docker run --rm hello-world && docker rmi hello-world
```

### Herramientas de Compilacion

```bash
sudo apt update
sudo apt install build-essential -y
```

---

## Licencia

Este proyecto esta licenciado bajo la WTFPL - [Do What the Fuck You Want to Public License](http://www.wtfpl.net/about/).

---

<div align="center">

**🤖 Desarrollado por Kobayashi82 🤖**

*"Keep it local. Keep it free"*
