<div align="center">

![Infraestructura](https://img.shields.io/badge/Infraestructura-VPS%20Docker-2f855a?style=for-the-badge)
![Red](https://img.shields.io/badge/Red-WireGuard-1f6feb?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Dashboard-Monitorizacion-8a5cf6?style=for-the-badge)

*Dashboard unificado para servicios de IA, operaciones remotas y monitorización en entornos domésticos y VPS*

</div>

<div align="center">
  <img src="/images/ProjectAI.jpg">
</div>

# Project AI

[README in English](README.md)

`Project AI` es una plataforma centralizada de `dashboard` y orquestación de servicios alojada en un `VPS` con `Docker`. Proporciona acceso unificado a servicios de IA (`Open WebUI`, `ComfyUI`, `ACE Step`, `OpenClaw`), operaciones remotas y monitorización en tiempo real de nodos distribuidos.

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Servicios Principales](#servicios-principales)
3. [Infraestructura](#infraestructura)
4. [Inicio Rápido](#inicio-rápido)
5. [Detalles de Servicios](#detalles-de-servicios)
6. [Configuración Base del VPS](#configuración-base-del-vps)
7. [Licencia](#licencia)

## Visión General

### Características Principales

- **Acceso Centralizado a IA**: `Open WebUI`, `ComfyUI`, `ACE Step` y `OpenClaw` desde un único dashboard
- **Arquitectura Distribuida**: Conecta `PC` (Windows), `RPI` y `VPS` sin problemas
- **Operaciones Remotas Seguras**: Acceso `SSH`, `VNC`, `RDP` a través de `Guacamole`
- **Monitorización en Tiempo Real**: Métricas en vivo de todos los nodos (CPU, RAM, GPU, Discos)
- **Control Remoto Integrado**: Gestión de energía, control de servicios y comandos del sistema
- **Enfocado en Privacidad**: Infraestructura local con integración VPS opcional mediante `WireGuard`

### Estructura de Nodos

| Nodo    | SO             | Rol                                           | Acceso                                  |
|---------|----------------|-----------------------------------------------|-----------------------------------------|
| **PC**  | Windows x86_64 | Compute principal de IA y escritorio remoto   | SSH, VNC, RDP via Guacamole + WireGuard |
| **RPI** | Linux ARM64    | Nodo de soporte para energía, SSH, telemetría | SSH via Guacamole + WireGuard           |
| **VPS** | Linux x86_64   | Punto de entrada público, orquestación, proxy | SSH via Guacamole                       |

## Servicios Principales

### IA & Machine Learning

| Servicio       | Propósito                                  | Acceso             |
|----------------|--------------------------------------------|--------------------|
| **Open WebUI** | Interfaz de chat multi-modelo              | Docker en VPS      |
| **ComfyUI**    | Generación de imagen/video basada en nodos | Via WireGuard (PC) |
| **ACE Step**   | Plataforma de automatización de flujos IA  | Via WireGuard (PC) |
| **OpenClaw**   | Asistente de IA con interfaz Telegram      | Docker en VPS      |
| **Ollama**     | Runtime de LLM local y servidor API        | Via WireGuard (PC) |

### Infraestructura & Acceso

| Servicio      | Propósito                                         |
|---------------|---------------------------------------------------|
| **Caddy**     | Servidor web y reverse proxy con HTTPS automático |
| **Authelia**  | Autenticación centralizada de usuario único       |
| **WireGuard** | Backbone VPN cifrada para conectividad segura     |
| **Guacamole** | Acceso remoto basado en web (SSH, VNC, RDP)       |

### Operaciones & Monitorización

| Servicio       | Propósito                                                    |
|----------------|--------------------------------------------------------------|
| **Dashboard**  | API REST para operaciones de nodos y métricas en tiempo real |
| **K-Desktop**  | Suite de automatización Windows para comandos remotos        |
| **Telemetría** | Métricas del sistema en vivo (clientes Python en cada nodo)  |
| **Portainer**  | UI de gestión de Docker                                      |

### Datos & Utilidades

| Servicio        | Propósito                                   |
|-----------------|---------------------------------------------|
| **FileBrowser** | Gestor web de archivos para todos los nodos |
| **Torrent**     | Transferencia P2P de archivos               |
| **SearXNG**     | Metabuscador enfocado en privacidad         |

## Infraestructura

### Arquitectura

El sistema se construye sobre:

- **Dashboard** en VPS para control central, observabilidad y operaciones remotas
- **Caddy** como servidor web y reverse proxy de entrada pública
- **Authelia** para autenticación y gestión de sesiones  
- **WireGuard** VPN para conectar de forma segura `PC` y `Raspberry Pi` tras `CG-NAT`
- **Guacamole** para gestión de sesiones remotas (`SSH`, `VNC`, `RDP`)
- **Docker Compose** para orquestación de servicios en `VPS`

### Topología de Red

```
Internet / Dominios
    ↓
Caddy (HTTPS/Reverse Proxy)
    ↓
    ├─→ Authelia (Validación Auth)
    ├─→ Caddy (Servidor Web)
    ├─→ OpenWebUI (Chat/WebUI)
    ├─→ OpenClaw (Bot Telegram)
    ├─→ Portainer (UI Docker)
    ├─→ Guacamole (Acceso Remoto)
    └─→ FileBrowser (archivos VPS)
    
    ↓
WireGuard VPN
    ├─→ PC (Windows)
    │   ├─ ComfyUI (puerto 8188)
    │   ├─ ACE Step (puerto 7860)
    │   ├─ Ollama (puerto 11434)
    │   ├─ FileBrowser (puerto 8085)
    │   └─ Torrent (puerto 8899)
    └─→ Raspberry Pi
        ├─ FileBrowser (puerto 8085)
        └─ Torrent (puerto 8899)
```

## Inicio Rápido

### Requisitos Previos

- `Docker` + `docker compose` en VPS
- `Make` y `bash`
- `openssl` para generación de claves
- Dominio apuntando al VPS
- Claves SSH privadas para acceso a nodos remotos

### Pasos de Instalación

1. **Copiar y configurar `.env`**
   ```bash
   cp .env.example .env
   # Editar .env con dominios, usuarios, IPs y puertos
   ```

2. **Configurar claves privadas**
   ```bash
   # Colocar claves SSH privadas en scripts/keys/
   scripts/keys/put_private_keys_here
   # Renombrar/mover para que coincidan con valores de .env:
   #   - API_SSH_KEY (para comandos remotos del API)
   #   - CON[n]_KEY (para conexiones SSH de Guacamole)
   ```

3. **Inicializar configuración**
   ```bash
   make init
   # Genera:
   #   - authelia/configuration.yml
   #   - authelia/users.yml
   #   - caddy/Caddyfile
   #   - guacamole/001-initdb.sql
   #   - guacamole/002-seed-connections.sql
   #   - openclaw/openclaw.json
   #   - searxng/settings.yml
   #   - dashboard/api/privatekey
   ```

4. **Iniciar servicios**
   ```bash
   make up
   ```

### Comandos Comunes

```bash
make up           # Iniciar todos los servicios
make down         # Detener todos los servicios
make restart      # Reiniciar todos los servicios
make build        # Reconstruir imágenes
make rebuild      # Forzar reconstrucción de todas las imágenes
make fclean       # Limpieza completa (elimina contenedores, volúmenes, imágenes)
```

## Autenticación & Seguridad

- **Protección de Rutas API**: Aplicada mediante encabezados `Remote-User` de Caddy + Authelia (solo producción)
- **Usuarios de Guacamole**: Auto-generados desde valores de `.env` (`ADMIN_USER`, `GUAC_ACCESS_USERS`, `CON[n]_...`)
- **Claves SSH**: Requeridas para operaciones remotas y conexiones Guacamole
- **Autenticación Única**: Authelia proporciona login centralizado para todos los servicios protegidos

## Detalles de Servicios

### Dashboard

Panel de control centralizado desarrollado con `Node.js` y `Fastify`, proporcionando observabilidad y operaciones remotas.

**Características:**
- Monitorización en tiempo real de todos los nodos (PC, Raspberry Pi, VPS)
- Paneles de control organizados: Energía, Acceso, Servicios, IA, Telemetría, Comandos
- Punto único de operación para acceso remoto y gestión de servicios IA

**PC (Windows x86_64):**
- **Energía**: Wake on LAN, apagado/reinicio remoto
- **Acceso**: SSH, VNC, RDP via Guacamole
- **Servicios**: FileBrowser, Torrent
- **IA**: ComfyUI, Open WebUI, ACE Step, Ollama
- **Telemetría**: CPU, RAM, GPU, VRAM, estado de discos (C, D, E, G, V)
- **Comandos**: Ejecución remota via K-Desktop

**Raspberry Pi (Linux ARM64):**
- **Energía**: Apagado/reinicio remoto
- **Acceso**: SSH via Guacamole
- **Servicios**: FileBrowser, Torrent
- **Telemetría**: CPU + temperatura, RAM, disco raíz, disco externo

**VPS (Linux x86_64):**
- **Acceso**: SSH via Guacamole
- **Servicios**: FileBrowser, Portainer
- **Telemetría**: CPU, RAM, disco raíz

### Servicios de IA & Machine Learning

#### Open WebUI

Interfaz web de chat en VPS con soporte multi-modelo.

- **Backend Principal**: Ollama (via WireGuard desde PC)
- **Integración de Búsqueda**: SearXNG para respuestas asistidas
- **Generación de Imágenes**: Integración de flujos ComfyUI

#### ComfyUI

Interfaz de generación de imagen y video basada en nodos, ejecutada en PC (Windows).

- **Acceso**: Via WireGuard desde VPS (puerto 8188)
- **Características**: Flujos de modelos, soporte LoRA (Low-Rank Adaptation)
- **Modelos**: Descargados principalmente desde CivitAI
- **Notas**: LoRA permite adaptaciones ligeras de estilo/carácter/concepto sin reentrenamiento

#### ACE Step

Plataforma de automatización y orquestación de flujos IA, ejecutada en PC (Windows).

- **Acceso**: Via WireGuard desde VPS (puerto 7860)
- **Propósito**: Automatización y orquestación de tareas IA por pasos
- **Integración**: Accesible desde el dashboard e interfaz web directa

#### OpenClaw

Asistente personal de IA con interfaz Telegram, ejecutado en VPS.

- **Interfaz Telegram**: Chat directo con el asistente IA
- **Backend**: Ollama via red interna WireGuard
- **Acceso**: Integración de bot Telegram
- **Token Requerido**: Configurar `OPENCLAW_TOKEN` en `.env`

#### Ollama

Runtime local de LLM (Large Language Model) y servidor API REST.

- **API Principal**: `http://[IP]:11434`
- **Acceso Remoto**: Requiere `OLLAMA_HOST=0.0.0.0`
- **CORS**: Configurar `OLLAMA_ORIGINS=*` para uso amplio
- **Se ejecuta en**: PC (Windows) via WireGuard

**Comandos Comunes:**
```bash
ollama pull <modelo>     # Descargar modelo
ollama list              # Listar modelos instalados
ollama run <modelo>      # Ejecutar modelo localmente
```

**Configuración Windows:**
1. Instalar desde https://ollama.com/download
2. Salir desde el icono de bandeja
3. Configurar variables de entorno:
   - `OLLAMA_HOST=0.0.0.0`
   - `OLLAMA_ORIGINS=*`
4. Reiniciar Ollama

**Configuración Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl edit ollama.service
# Agregar en [Service]:
Environment="OLLAMA_HOST=0.0.0.0"
Environment="OLLAMA_ORIGINS=*"
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### Servicios de Infraestructura

#### Caddy

Servidor web moderno y reverse proxy como punto de entrada público.

- **HTTPS Automático**: Certificados TLS/SSL gestionados automáticamente
- **Reverse Proxy**: Enruta subdominios a contenedores Docker
- **Autenticación**: Se integra con Authelia para control de acceso
- **Características**: HTTP/2, compresión gzip, encabezados de seguridad

#### Authelia

Capa centralizada de autenticación y autorización.

- **Login Único**: Una contraseña para todos los servicios protegidos
- **Método**: Forward auth via encabezados de Caddy
- **Gestión de Usuarios**: Usuario único (configurable)
- **Control de Sesiones**: Timeout automático y tokens de refresco

#### WireGuard

Backbone VPN cifrada de alto rendimiento conectando VPS, PC y Raspberry Pi.

- **Propósito**: Conectar de forma segura nodos tras `CG-NAT`
- **Baja Latencia**: Red privada para comunicación servicio-a-servicio
- **Archivos por Cliente**: `wireguard/peer_[cliente]/`

**Ejemplo de Configuración:**
```ini
[Interface]
Address = 10.0.0.2/24
PrivateKey = [clave privada...]
ListenPort = 51820
MTU = 1420

[Peer]
PublicKey = [clave pública...]
PresharedKey = [clave precompartida...]
Endpoint = [IP_SERVIDOR]:51820
AllowedIPs = 10.0.0.0/24
PersistentKeepalive = 25
```

**Windows:**
1. Instalar desde https://www.wireguard.com/install
2. Importar archivo `.conf`
3. Activar túnel

**Linux:**
```bash
sudo apt install wireguard
sudo cp peer.conf /etc/wireguard/wg0.conf
sudo chmod 600 /etc/wireguard/wg0.conf
sudo systemctl enable --now wg-quick@wg0
sudo wg show
```

### Servicios de Acceso Remoto

#### Guacamole

Gateway de acceso remoto basado en web sin requerir cliente.

- **Protocolos Soportados**: SSH, VNC, RDP
- **Despliegue**: Docker en VPS
- **Red**: Usa WireGuard para alcanzar nodos internos
- **Usuarios**: Auto-configurados desde valores de `.env`

**Tipos de Conexión:**
- **SSH**: Shell remoto (puerto 22)
- **VNC**: Stream de escritorio remoto (puerto 5900)
- **RDP**: Escritorio Windows (puerto 3389)

#### K-Desktop

Suite de automatización Windows para operaciones remotas.

- **GitHub**: https://github.com/Kobayashi82/K-Desktop
- **Lenguaje**: Visual Basic .NET
- **Características**: Comandos remotos (UDP), atajos globales, capturas, grabaciones
- **Usado para**: Ejecución de comandos remotos desde el dashboard en PC

### Servicios de Datos & Archivos

#### FileBrowser

Gestor web de archivos para todos los nodos (VPS, PC, Raspberry Pi).

- **Acceso**: Tres instancias separadas para cada nodo
- **Características**: UI web, sin auth, directorio raíz configurable
- **Instancias**: 
  - FileBrowser VPS (puerto 8085)
  - FileBrowser PC (puerto 8085 via WireGuard)
  - FileBrowser Raspberry Pi (puerto 8085 via WireGuard)

**Argumentos Comunes:**
| Argumento | Descripción |
|-----------|-------------|
| `-r <path>` | Directorio raíz que se expone |
| `-a <address>` | Dirección de escucha (0.0.0.0 para todas) |
| `-p <port>` | Puerto web |
| `--noauth` | Desactiva autenticación |
| `--database <path>` | Ruta de base de datos config |

**Windows (portable):**
```bash
filebrowser.exe -r "C:\filebrowser" -a 0.0.0.0 -p 8085 --noauth --database "filebrowser.db"
```

**Servicio Windows (NSSM):**
```bash
nssm install filebrowser
nssm set filebrowser Application "C:\ruta\a\filebrowser.exe"
nssm set filebrowser AppDirectory "C:\ruta\a\FileBrowser"
nssm set filebrowser AppParameters "-r D:\filebrowser -a 0.0.0.0 -p 8085 --noauth --database filebrowser.db"
nssm start filebrowser
```

**Linux:**
```bash
# Descargar
wget https://github.com/filebrowser/filebrowser/releases/latest/download/linux-amd64-filebrowser.tar.gz
tar -xzf linux-amd64-filebrowser.tar.gz
sudo mv filebrowser /usr/local/bin/

# Ejecutar
filebrowser -r /home/user -a 0.0.0.0 -p 8085 --noauth --database /opt/filebrowser/filebrowser.db
```

**Servicio Systemd:**
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

Servicio P2P para transferencia distribuida de archivos.

- **Propósito**: Compartición descentralizada de archivos
- **UI Web**: Acceso en `http://[IP]:8080`
- **Instancias**: PC y Raspberry Pi

**Windows:**
1. Instalar desde https://www.qbittorrent.com/download
2. Completar instalación
3. Activar servidor web en configuración

**Linux:**
```bash
sudo apt install qbittorrent-nox
sudo systemctl enable --now qbittorrent-nox
# Obtener contraseña por defecto
sudo journalctl -u qbittorrent-nox | grep password
```

### Servicios de Utilidad

#### SearXNG

Metabuscador open-source para respuestas de IA asistidas.

- **Propósito**: Agregar resultados de múltiples motores de búsqueda
- **Privacidad**: Reduce rastreo directo y perfilado
- **Integración**: Usado por Open WebUI para respuestas mejoradas
- **Despliegue**: Docker en VPS

#### Portainer

UI de gestión de Docker para administración de contenedores y servicios.

- **Características**: Gestión de contenedores, imágenes, volúmenes, visualización de logs
- **Acceso**: Dashboard de UI web
- **Capacidades**: Reiniciar servicios, inspeccionar logs, monitorizar despliegues
- **Simplifica**: Operación día a día en entorno multi-servicio

### Monitorización & Telemetría

#### API Dashboard

Servicio API REST proporcionando métricas del sistema y operaciones de nodos.

- **Framework**: Node.js + Fastify
- **Puerto**: 4000 (interno)
- **Características**: Recopilación de métricas en tiempo real, ejecución de comandos remotos
- **Fuentes de Telemetría**: Clientes Python en cada nodo

#### Clientes de Telemetría

Servicios de recopilación de métricas basados en Python ejecutándose en cada nodo.

**Windows (PC):**
- Métricas del sistema: IP, CPU, RAM (total/usado/porcentaje)
- Métricas GPU: Nombre, carga, VRAM (total/usada/libre), temperatura, soporte multi-GPU
- Métricas de discos: Tamaño/usado/libre/porcentaje por unidad montada

**Linux (Raspberry Pi):**
- Métricas del sistema: IP, CPU, RAM, temperatura CPU
- Métricas GPU: Nombre VideoCore IV y asignación de memoria
- Métricas de discos: Raíz (/), firmware, montaje externo (/mnt/externo)

## Configuración Base del VPS

Línea base recomendada para preparar el VPS antes de desplegar servicios de Project AI.

### Creación & Acceso al VPS

1. **Crear VPS** con proveedor elegido y obtener IP
2. **Usar claves SSH** en lugar de autenticación por contraseña
3. **Cambiar contraseña root** si es necesario: `passwd root`

### Configuración SSH

**Generar clave SSH:**
```bash
ssh-keygen -t ed25519 -C "identificador"
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**Archivo de configuración SSH** (`~/.ssh/config`):
```ini
Host [NombreServidor]
  HostName [IPServidor]
  User root
  IdentityFile ~/.ssh/identificador
```

**Hardening de SSH** (`/etc/ssh/sshd_config`):
```ini
PermitRootLogin prohibit-password
PubkeyAuthentication yes
PasswordAuthentication no
```

Aplicar cambios:
```bash
systemctl restart ssh
```

### Configuración de Usuario & Seguridad

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

### Instalación de Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker [usuario]
newgrp docker
docker run --rm hello-world && docker rmi hello-world
```

### Herramientas de Compilación

```bash
sudo apt update
sudo apt install build-essential -y
```

---

## Licencia

Este proyecto está licenciado bajo la WTFPL - [Do What the Fuck You Want to Public License](http://www.wtfpl.net/about/).

---

<div align="center">

**🤖 Desarrollado por Kobayashi82 🤖**

*"Keep it local. Keep it free"*

<div align="center">
  <img src="/images/ProjectAI_web.png">
</div>
