# Torrent

Protocolo de transferencia de archivos entre pares (P2P) que distribuye la carga entre todos los participantes en lugar de depender de un único servidor central. Cada cliente que descarga un archivo también lo comparte simultáneamente con el resto, lo que hace que las descargas sean más rápidas y resistentes cuanto más usuarios hay.

---

### Windows

1. Descargar el instalador desde https://www.qbittorrent.com/download
2. Ejecutar el instalador y seguir los pasos.
3. Habilitar el servidor web en los ajustes.

---

### Linux

`qbittorrent-nox` es la versión sin interfaz gráfica, pensada para correr como servicio en segundo plano y gestionarse desde un navegador web.

```bash
sudo apt install qbittorrent-nox
sudo systemctl enable --now qbittorrent-nox
```

En el primer arranque se genera una contraseña temporal aleatoria.

```bash
sudo journalctl -u qbittorrent-nox | grep password
```

Una vez activo, la interfaz web está disponible en `http://[IP]:8080`.
