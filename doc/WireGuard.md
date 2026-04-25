# WireGuard

Sistema de `VPN` moderno que crea túneles cifrados entre dispositivos con alto rendimiento, baja latencia y configuración simple. Permite interconectar clientes con la red interna de forma segura sin exponer servicios directamente a `Internet`.

---

## Clientes

Cada cliente tiene su propio directorio con dos ficheros:

| Fichero                                        | Descripción                         |
|------------------------------------------------|-------------------------------------|
| `wireguard/peer_[cliente]/peer_[cliente].conf` | Configuración lista para importar   |
| `wireguard/peer_[cliente]/peer_[cliente].png`  | Código QR para importar desde móvil |

---

## Configuración de ejemplo

```ini
[Interface]
Address = 10.0.0.2/24               # IP del cliente dentro de la red
PrivateKey = [private key...]       # Clave privada del cliente
ListenPort = 51820                  # Puerto UDP en el que escucha la interfaz local
MTU = 1420                          # Tamaño máximo de paquete

[Peer]
PublicKey = [public key...]         # Clave pública del servidor
PresharedKey = [preshared key...]   # Clave simétrica adicional
Endpoint = 178.104.192.197:51820    # IP y puerto del servidor WireGuard
AllowedIPs = 10.0.0.0/24            # Limita el túnel solo a la red indicada
PersistentKeepalive = 25            # Mantiene el túnel activo
```

---

## Windows

1. Descargar e instalar el https://www.wireguard.com/install
2. Abrir la aplicación e importar el fichero `.conf`.
3. Activar la conexión

---

## Linux

```bash
sudo apt install wireguard
sudo cp peer.conf /etc/wireguard/wg0.conf
sudo chmod 600 /etc/wireguard/wg0.conf
sudo systemctl enable --now wg-quick@wg0
sudo wg show
```
