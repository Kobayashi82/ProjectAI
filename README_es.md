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

`Project AI` es un `dashboard` web centralizado alojado en un `VPS` con `Docker`, enfocado en `Open WebUI`, `ComfyUI` y `OpenClaw`, con monitorizacion, acceso remoto y operacion integrada entre nodos.

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

## Inicio Rapido (`VPS`)

Requisitos:

- `Docker` + `docker compose`
- `Make`
- `bash`
- `openssl`

Puesta en marcha:

1. Copia `.env.example` a `.env` y ajusta dominios, usuarios, IPs y puertos.
2. Pon las claves privadas en `scripts/keys/put_private_keys_here` y despues muevelas/renombralas a `scripts/keys/` con los mismos nombres que uses en `.env`.
3. Ejecuta `make init` para generar configuraciones base.
4. Ejecuta `make up` para levantar todos los servicios.

Comandos utiles:

```bash
make up
make down
make restart
make build
make rebuild
make fclean
```

Que genera `make init`:

- `authelia/configuration.yml`
- `authelia/users.yml`
- `caddy/Caddyfile`
- `guacamole/001-initdb.sql`
- `guacamole/002-seed-connections.sql`
- `openclaw/openclaw.json`
- `searxng/settings.yml`
- `dashboard/api/privatekey` (copiada desde `scripts/keys/${API_SSH_KEY}`)

## Claves y Secretos

Guarda las claves privadas necesarias en `scripts/keys/`.

Antes de ejecutar `make init`, coloca las claves en `scripts/keys/` con nombres iguales a los de `.env`:

- `API_SSH_KEY` (usada por `scripts/api.sh`, copiada a `dashboard/api/privatekey`)
- valores `CON[n]_KEY` (usados por `scripts/guacamole.sh` para inyectar claves SSH en el SQL inicial de Guacamole)

- Claves privadas usadas para las conexiones remotas de `Guacamole`
- Clave de `API` usada para enviar comandos remotos a `PC` y `RPI`

## Notas de Autenticacion y Acceso

- La autenticacion del API se aplica en modo produccion con cabecera `Remote-User` inyectada por `Caddy` + `Authelia`.
- Si falta `Remote-User`, el API devuelve no autorizado.
- Usuarios/permisos de `Guacamole` se generan desde `.env` (`ADMIN_USER`, `GUAC_ACCESS_USERS`, `CON[n]_...`).

### Estructura de Nodos

- `PADRE`: maquina principal `Windows` para `AI`, escritorio remoto y acciones de energia
- `Raspberry Pi`: nodo de apoyo para control de energia, `SSH`, telemetria y puente de servicios
- `VPS`: punto de entrada publico y nodo de orquestacion para `Docker`, auth, proxy y dashboard

El detalle completo por maquina esta en la seccion `Dashboard` mas abajo.

---

## Detalle de Servicios

### Dashboard

Panel de control centralizado desarrollado con `Node` y `Fastify`, accesible desde el navegador a traves del `VPS`.

- Monitoriza `Padre` (`Windows x86_64`), `Raspberry` (`Linux ARM64`) y `VPS` (`Linux x86_64`)
- Organiza acciones en bloques: `Power`, `Access`, `Services`, `AI`, `Telemetry`, `Commands`
- Actua como punto unico de operacion para acceso remoto y servicios IA

Resumen por maquina:

- `Padre`:
  - `Power`: Wake on LAN, apagado y reinicio remoto
  - `Access`: `SSH`, `VNC`, `RDP` via `Guacamole`
  - `Services`: `Files` y `Torrent`
  - `AI`: `ComfyUI`, `Open WebUI`, `OpenClaw`
  - `Telemetry`: CPU, RAM, GPU, VRAM y discos C, D, E, G, V
  - `Commands`: comandos remotos por `K-Desktop`
- `Raspberry`:
  - `Power`: apagado y reinicio remoto
  - `Access`: `SSH` via `Guacamole`
  - `Services`: `Files` y `Torrent`
  - `Telemetry`: CPU + temperatura, RAM, disco raiz y disco externo
- `VPS`:
  - `Access`: `SSH` via `Guacamole`
  - `Services`: `Files` y `Portainer`
  - `Telemetry`: CPU, RAM y disco raiz

### Open WebUI

Interfaz web de chat desplegada en `Docker` sobre el `VPS`.

- Backend principal de modelos: `Ollama` por red `WireGuard`
- Integracion de busqueda: `SearXNG`
- Integracion de imagen: `ComfyUI`

### OpenClaw

Asistente personal de IA en `Docker` sobre el `VPS`.

- Interfaz de usuario via `Telegram`
- Backend de modelos: `Ollama` usando API nativa `/api/chat`
- Conexion a modelos por red interna `WireGuard`

### ComfyUI

Interfaz por nodos para generacion de imagen y video, ejecutada en `Windows`.

- Acceso remoto desde `VPS` mediante `WireGuard`
- Flujos con modelos base y `LoRA`
- Modelos y `LoRA` descargados principalmente desde `CivitAI`

Notas:

- `LoRA` (`Low-Rank Adaptation`) permite adaptar estilo/personaje/concepto sin reentrenar el modelo completo
- Para descargas desde gestor, algunos modelos en `CivitAI` requieren cuenta y `API key`

### Ollama

Servidor local de `LLM` y `API REST` para consumo por `Open WebUI` y `OpenClaw`.

- Endpoint habitual: `http://[IP]:11434`
- Para acceso remoto: `OLLAMA_HOST=0.0.0.0`
- Para CORS amplio: `OLLAMA_ORIGINS=*`

Comandos basicos:

```bash
ollama pull <modelo>
ollama list
ollama run <modelo>
```

Windows:

1. Instalar desde https://ollama.com/download
2. Cerrar `Ollama` desde la bandeja
3. Configurar variables de entorno del sistema:
   - `OLLAMA_HOST=0.0.0.0`
   - `OLLAMA_ORIGINS=*`
4. Abrir de nuevo `Ollama`

Linux:

```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl edit ollama.service
```

Agregar en `[Service]`:

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
Environment="OLLAMA_ORIGINS=*"
```

Aplicar cambios:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### SearXNG

Metabuscador `open source` desplegado en `Docker`.

- Agrega resultados de multiples motores
- Evita depender de un unico proveedor
- Reduce rastreo directo y mejora privacidad

### FileBrowser

Gestor web de archivos para `Windows` y `Linux`.

Argumentos principales:

| Argumento | Descripcion |
|---|---|
| `-r <path>` | Directorio raiz que se expone |
| `-a <address>` | Direccion de escucha (`0.0.0.0` para todas las interfaces) |
| `-p <port>` | Puerto web |
| `--noauth` | Desactiva autenticacion |
| `--database <path>` | Ruta de base de datos `.db` |

Windows (binario portable):

```bash
filebrowser.exe -r "C:\filebrowser" -a 0.0.0.0 -p 8085 --noauth --database "filebrowser.db"
```

Servicio en Windows con `NSSM`:

```bash
nssm install filebrowser
nssm edit filebrowser
nssm stop filebrowser
nssm start filebrowser
nssm remove filebrowser
```

Consultas y ajustes:

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

filebrowser -r /home/user -a 0.0.0.0 -p 8085 --noauth --database /opt/filebrowser/filebrowser.db
```

Servicio `systemd` (`/etc/systemd/system/filebrowser.service`):

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

Servicio `P2P` para transferencia distribuida entre pares.

Windows:

1. Instalar desde https://www.qbittorrent.com/download
2. Completar instalacion
3. Activar servidor web en configuracion

Linux (`qbittorrent-nox`):

```bash
sudo apt install qbittorrent-nox
sudo systemctl enable --now qbittorrent-nox
sudo journalctl -u qbittorrent-nox | grep password
```

Interfaz web: `http://[IP]:8080`

### Portainer

Panel web para gestionar `Docker` visualmente.

- Gestion de contenedores, imagenes, volumenes, redes y stacks
- Reinicio de servicios, consulta de logs y estado general
- Reduce operacion manual por terminal en despliegues grandes

### Guacamole

Gateway web para acceso remoto sin cliente local.

- `SSH`: terminal remota por puerto `22`
- `VNC`: escritorio remoto por puerto tipico `5900`
- `RDP`: escritorio `Windows` por puerto `3389`

Se ejecuta en `Docker` en el `VPS` y conecta con nodos internos por `WireGuard`.

### K-Desktop

[K-Desktop](https://github.com/Kobayashi82/K-Desktop) es una suite para `Windows` en `Visual Basic .NET`.

- Comandos remotos via `UDP`
- Atajos globales, capturas, audio/video y menus personalizados
- En esta infraestructura se usa principalmente para `Commands` remotos

### Telemetria

Dos clientes en `Python` exponen metricas en `JSON` para el dashboard.

`Windows`:

- `Sistema`: IP local, CPU y RAM (total, usado, porcentaje)
- `GPU`: nombre, uso, VRAM total/usada/libre y temperatura, con soporte multi-GPU
- `Discos`: total/usado/libre/porcentaje por unidad montada

`Linux` (`Raspberry Pi`):

- `Sistema`: IP local, CPU, RAM y temperatura CPU
- `GPU`: VideoCore IV, memoria total y asignada
- `Discos`: raiz `/`, firmware y disco externo en `/mnt/externo`

### Caddy

Servidor web y `reverse proxy` de entrada publica del entorno.

- Publica servicios internos de forma segura
- Gestion automatica de certificados `TLS` (`HTTPS`)
- Enruta por dominio/subdominio hacia contenedores `Docker`
- Consulta reglas de `Authelia` para proteger servicios

### Authelia

Sistema centralizado de autenticacion y autorizacion.

- Punto unico de login para servicios del stack
- Intermedio entre usuario y servicios internos
- `Caddy` redirige al portal de login cuando no hay sesion valida
- Simplifica gestion de usuarios/permisos y evita auth por app

### WireGuard

`VPN` cifrada de alto rendimiento para conectar nodos detras de `CG-NAT`.

Estructura por cliente:

| Fichero | Descripcion |
|---|---|
| `wireguard/peer_[cliente]/peer_[cliente].conf` | Configuracion importable |
| `wireguard/peer_[cliente]/peer_[cliente].png` | QR para importacion movil |

Ejemplo de configuracion:

```ini
[Interface]
Address = 10.0.0.2/24
PrivateKey = [private key...]
ListenPort = 51820
MTU = 1420

[Peer]
PublicKey = [public key...]
PresharedKey = [preshared key...]
Endpoint = [IP_SERVIDOR]:51820
AllowedIPs = 10.0.0.0/24
PersistentKeepalive = 25
```

Windows:

1. Instalar desde https://www.wireguard.com/install
2. Importar `.conf`
3. Activar tunel

Linux:

```bash
sudo apt install wireguard
sudo cp peer.conf /etc/wireguard/wg0.conf
sudo chmod 600 /etc/wireguard/wg0.conf
sudo systemctl enable --now wg-quick@wg0
sudo wg show
```

### VPS Base

Guia base para preparar el `VPS` antes de desplegar servicios.

Creacion y acceso:

- Crear un `VPS` con proveedor elegido y obtener IP
- Preferir `SSH` por clave publica en lugar de contraseña
- Si hace falta, cambiar contraseña root con `passwd root`

Configuracion de claves `SSH`:

```bash
ssh-keygen -t ed25519 -C "identificador"
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Ejemplo de `~/.ssh/config`:

```ini
Host [Nombre del Servidor]
    HostName [IP del Servidor]
    User root
    IdentityFile ~/.ssh/identificador
```

Hardening de SSH (`/etc/ssh/sshd_config`):

```ini
PermitRootLogin prohibit-password
PubkeyAuthentication yes
PasswordAuthentication no
```

```bash
systemctl restart ssh
```

Usuario con `sudo`:

```bash
adduser [user]
usermod -aG sudo [user]
```

Para ocultar mensaje de bienvenida:

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

Compilacion:

```bash
sudo apt update
sudo apt install build-essential -y
```

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
