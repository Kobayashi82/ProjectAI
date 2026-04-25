# Dashboard

Panel de control centralizado que muestra el estado en tiempo real de todas las máquinas de la infraestructura. Desarrollado a medida con `Node` y `Fastify`, accesible desde el navegador a través del `VPS`.

Actualmente monitoriza tres máquinas: `Padre` (Windows x86_64), `Raspberry` (Linux ARM64) y `VPS` (Linux x86_64).

---

## Máquinas

Cada máquina se muestra como una tarjeta independiente con su estado de conexión y las secciones relevantes según el equipo.

### Padre

Máquina principal Windows:

- `Power` — Wake on LAN, apagado y reinicio remoto.
- `Access` — acceso rápido a `SSH`, `VNC` y `RDP` a través de `Guacamole`.
- `Services` — acceso a `Files` y `Torrent`.
- `AI` — acceso directo a `ComfyUI`, `Open WebUI` y `OpenClaw`.
- `Telemetry` — CPU, RAM, GPU, VRAM y uso de los discos C, D, E, G y V.
- `Commands` — ejecución de comandos remotos vía `K-Desktop`.

### Raspberry

Máquina Linux ARM64:

- `Power` — apagado y reinicio remoto.
- `Access` — acceso `SSH` a través de `Guacamole`.
- `Services` — acceso a `Files` y `Torrent`.
- `Telemetry` — CPU con temperatura, RAM, disco raíz y disco externo.

### VPS

Servidor Linux x86_64:

- `Access` — acceso `SSH` a través de `Guacamole`.
- `Services` — acceso a `Files` y `Portainer`.
- `Telemetry` — CPU, RAM y disco raíz.
