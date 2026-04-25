# Virtual Private Server (VPS)

Un VPS (Virtual Private Server) es un servidor virtual privado alojado en una máquina física compartida con otros usuarios, pero con recursos dedicados y aislados. Ofrece control total sobre el sistema operativo, similar a un servidor dedicado pero a menor coste.

## Creación

Elegir el proveedor preferido, crear el VPS y obtener la dirección IP

## Acceso

A la hora de crear el VPS puede elegir acceder por SSH con contraseña o con clave pública.
Se recomienda entrar con clave pública y deshabilitar el acceso por contraseña.

Si desea crear o modificar la contraseña de root, ejecute `passwd root`

Para configurar el acceso con clave pública siga estos pasos:

- Genere una clave SSH con `ssh-keygen -t ed25519 -C "identificador"`
- Introduzca el nombre del archivo generado
- Cree el directorio `~/.ssh` y aplique los permisos `chmod 700 ~/.ssh`
- Copie ambos archivos en el directorio `~/.ssh`
- Edite el archivo `~/.ssh/config`

```bash
Host [Nombre del Servidor]
    HostName [IP del Servidor]
    User root
    IdentityFile ~/.ssh/identificador
```

- Copie el contenido de la clave pública desde `~/.ssh/identificador.pub`
- Añada dicho contenido al archivo `~/.ssh/authorized_keys` dentro del VPS
- Establezca los permisos con `chmod 600 ~/.ssh/authorized_keys`

Para deshabilitar el acceso con contraseña para root haga lo siguiente:

- Edite el archivo `/etc/ssh/sshd_config`
- Modifique las siguientes líneas para que queden así:

```ini
PermitRootLogin prohibit-password  # Deshabilita el acceso con contraseña para root
PubkeyAuthentication yes           # Habilita el acceso por clave
PasswordAuthentication no          # [OPCIONAL] Deshabilita el acceso con contraseñas para todos los usuarios
```

- Reinicie el servicio de SSH con `systemctl restart ssh`

## Usuarios

Es preferible crear un usuario con permisos de sudo.

- Cree el usuario con `adduser [user]`
- Añadalo a sudo con `usermod -aG sudo [user]`

Para entrar con el usuario por SSH con clave pública:

- Conéctese al `VPS` con el nuevo usuario
- Cree el directorio `~/.ssh` y aplique los permisos `chmod 700 ~/.ssh`
- Cree el archivo `~/.ssh/authorized_keys` y añada el contenido de su clave pública
- Establezca los permisos con `chmod 600 ~/.ssh/authorized_keys`
- Añada la entrada correspondiente en `~/.ssh/config` de su máquina local

Si cuando conecta le sale un mensaje de bienvenida y quiere quitarlo, ejecute `touch ~/.hushlogin`

# Fail2ban

`Fail2ban` protege el servidor bloqueando automáticamente IPs que realizan demasiados intentos 
fallidos de conexión. Es especialmente útil para proteger el acceso `SSH`.

Para instalarlo:

```bash
sudo apt update                                          # Actualizar lista de paquetes
sudo apt install fail2ban -y                             # Instalar Fail2ban
sudo systemctl enable fail2ban                           # Habilitar al inicio
sudo systemctl start fail2ban                            # Iniciar el servicio
sudo fail2ban-client status sshd                         # Ver estado y IPs bloqueadas
```

La configuración por defecto ya protege SSH. Para verificar que está funcionando:

# Docker

Para instalar Docker, ejecute lo siguiente

```bash
curl -fsSL https://get.docker.com | sudo sh              # Instalar Docker
sudo usermod -aG docker [user]                           # Añadir usuario al grupo docker
newgrp docker                                            # Aplicar grupo a la sesión actual
docker run --rm hello-world && docker rmi hello-world    # Verificar instalación
```

# Compilación

Para instalar las herramientas de compilación (gcc, make, g++, etc.)

```bash
sudo apt update                                          # Actualizar lista de paquetes
sudo apt install build-essential -y                      # Instalar gcc, make, g++, etc.
```
