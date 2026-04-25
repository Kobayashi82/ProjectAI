# Caddy

Es un servidor web y proxy inverso moderno diseñado para simplificar la publicación de servicios en red. Su principal ventaja es la configuración mínima necesaria y la gestión automática de certificados `TLS` (HTTPS) mediante `Let’s Encrypt`.

En esta infraestructura se utiliza como punto de entrada a todos los servicios desplegados en Docker. `Caddy` recibe las peticiones del exterior y las redirige al servicio correspondiente según el dominio o subdominio configurado.

Además, actúa como capa de integración con el sistema de autenticación, consultando sus reglas antes de permitir el acceso a los servicios protegidos. De esta forma, cualquier acceso puede ser validado centralmente sin necesidad de implementar autenticación en cada aplicación.

Su función principal en el sistema es:
- Exponer servicios internos de forma segura
- Gestionar HTTPS automáticamente
- Actuar como proxy inverso para contenedores Docker
- Integrarse con Authelia para control de acceso
