# FileBrowser

Es un servidor web de gestión de archivos con interfaz gráfica. Permite explorar, subir, descargar y organizar ficheros desde el navegador sin necesidad de software adicional en el cliente.

---
### Windows

#### Instalación

Descarga el binario desde el repositorio oficial y colócalo en la carpeta de destino. No requiere instalación adicional, es un ejecutable portable.

- Repositorio oficial: https://github.com/filebrowser/filebrowser/releases

#### Configuración

FileBrowser se configura mediante argumentos en la línea de comandos al ejecutarlo.

| Argumento           | Descripción                                                                |
|---------------------|----------------------------------------------------------------------------|
| `-r <path>`         | Directorio raíz que se servirá en la interfaz web                          |
| `-a <address>`      | Dirección de escucha. `0.0.0.0` acepta conexiones desde cualquier interfaz |
| `-p <port>`         | Puerto donde estará disponible la interfaz web                             |
| `--noauth`          | Desactiva la autenticación. Útil en redes locales de confianza             |
| `--database <path>` | Ruta al archivo `.db` donde se guarda la configuración y usuarios          |

```bash
filebrowser.exe -r "C:\filebrowser" -a 0.0.0.0 -p 8085 --noauth --database "filebrowser.db"
```
#### NSSM

NSSM (Non-Sucking Service Manager) permite registrar cualquier ejecutable como un servicio de Windows, de forma que arranque automáticamente con el sistema y se pueda gestionar desde los servicios de Windows.

Para instalar un programa como servicio con `nssm` se debe configurar el programa a ejecutar, su directorio de trabajo y los argumentos.

Esto se hace desde una ventana que se abre al ejecutar ciertos comandos de `nssm`.

```bash
nssm install filebrowser    # Instalar el servicio
nssm edit    filebrowser    # Editar   el servicio
nssm stop    filebrowser    # Detener  el servicio
nssm start   filebrowser    # Iniciar  el servicio
nssm remove  filebrowser    # Eliminar el servicio
```

Se pueden consultar y modificar individualmente desde la línea de comandos:

```
nssm get filebrowser Application
nssm set filebrowser Application "C:\path\to\filebrowser.exe"

nssm get filebrowser AppDirectory
nssm set filebrowser AppDirectory "C:\path\to\FileBrowser"

nssm get filebrowser AppParameters
nssm set filebrowser AppParameters "-r D:\filebrowser -a 0.0.0.0 -p 8085 --noauth --database filebrowser.db"
```

---

### Linux

#### Instalación

Descarga el binario correspondiente para la arquitectura del sistema desde el repositorio oficial y colócalo en una ruta del sistema.

```bash
# x86_64
wget https://github.com/filebrowser/filebrowser/releases/latest/download/linux-amd64-filebrowser.tar.gz

# ARM64
wget https://github.com/filebrowser/filebrowser/releases/latest/download/linux-arm64-filebrowser.tar.gz
```

Extraer e instalar:

```bash
tar -xzf linux-*.tar.gz
sudo mv filebrowser /usr/local/bin/filebrowser
sudo chmod +x /usr/local/bin/filebrowser
```

#### Configuración

Los argumentos son los mismos que en Windows, cambiando las rutas al formato Unix.

```bash
filebrowser -r /home/user -a 0.0.0.0 -p 8085 --noauth --database /opt/filebrowser/filebrowser.db
```

En Linux el estándar para gestionar servicios es `systemd`. Se crea un archivo de unidad que describe cómo lanzar FileBrowser.

```bash
sudo nano /etc/systemd/system/filebrowser.service
```

Contenido del archivo:

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

Una vez creado el archivo, activar e iniciar el servicio:

```bash
sudo systemctl daemon-reload          # Recargar systemd para detectar la nueva unidad
sudo systemctl enable filebrowser     # Habilitar el inicio automático al arrancar
sudo systemctl start filebrowser      # Iniciar el servicio ahora
sudo systemctl status filebrowser     # Comprobar el estado del servicio
```
