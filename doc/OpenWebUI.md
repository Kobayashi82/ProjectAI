# Open WebUI

Interfaz web de chat que actúa como frontend para modelos de lenguaje. Permite interactuar con modelos servidos por Ollama u otros backends compatibles desde cualquier navegador, sin necesidad de instalar nada en el cliente.

En esta infraestructura corre en un `VPS` mediante `Docker` y se integra con:

- `Ollama` — como backend de modelos, conectado a través de la red `WireGuard`.
- `SearXNG` — como motor de búsqueda para enriquecer las respuestas con información de la web.
- `ComfyUI` — como backend de generación de imágenes.
