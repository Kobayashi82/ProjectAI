
# Authelia

Es un sistema de autenticación y autorización centralizado diseñado para proteger aplicaciones y servicios expuestos en red.

Actúa como una capa de seguridad intermedia entre el usuario y los servicios internos, gestionando el inicio de sesión, la validación de identidad y las políticas de acceso.

En esta infraestructura se utiliza como punto único de autenticación para todos los servicios desplegados en Docker. De este modo, no es necesario implementar autenticación individual en cada aplicación, sino que todas delegan este control en `Authelia`.

El proxy inverso se encarga de interceptar las peticiones entrantes y consultar a `Authelia` antes de permitir el acceso a cualquier servicio. Si el usuario no está autenticado, `Caddy` redirige automáticamente al portal de login de `Authelia`..

Este enfoque permite:
- Centralizar la autenticación en un único servicio
- Simplificar la gestión de usuarios y permisos
- Evitar exponer credenciales en cada aplicación
