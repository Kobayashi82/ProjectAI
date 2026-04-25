# Guacamole

Gateway de escritorio remoto basado en web que permite acceder a máquinas mediante `SSH`, `VNC` y `RDP` directamente desde el navegador, sin necesidad de instalar ningún cliente adicional.

En esta infraestructura corre en el `VPS` mediante `Docker` y se conecta a las máquinas de la red interna a través de `WireGuard`.

---

## SSH

Protocolo de acceso remoto por terminal. Se usa para conectarse a servidores y gestionar el sistema mediante línea de comandos. La conexión se configura con la IP de la máquina, el puerto 22 y las credenciales del usuario.

---

## VNC

Protocolo de escritorio remoto que transmite la pantalla gráfica de la máquina. Requiere que la máquina destino tenga un servidor `VNC` activo. La conexión se configura con la IP y el puerto del servidor `VNC`, habitualmente el `5900`.

---

## RDP

Protocolo de escritorio remoto de Microsoft. Se usa para acceder a máquinas `Windows` con una experiencia más fluida que `VNC`, con soporte de audio, portapapeles compartido y redirección de dispositivos. La conexión se configura con la IP y el puerto `3389`.
