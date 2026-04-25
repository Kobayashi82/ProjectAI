# SearXNG

Es un motor de búsqueda de código abierto que agrega resultados de múltiples motores de búsqueda sin depender de uno solo. Su objetivo es proporcionar resultados más completos, evitando el rastreo directo del usuario por parte de los buscadores externos.

En esta infraestructura se utiliza como buscador privado dentro del entorno `Docker`, permitiendo realizar consultas web sin exposición a seguimiento comercial o perfilado de usuario.

Todas las peticiones se procesan a través de instancias configuradas localmente, lo que permite mantener el control total sobre la privacidad, los proveedores de búsqueda utilizados y los datos generados.

Su función principal es:
- Unificar resultados de múltiples motores de búsqueda
- Evitar rastreo del usuario
- Proporcionar un buscador privado autoalojado
- Permitir control total sobre fuentes de búsqueda y configuración
