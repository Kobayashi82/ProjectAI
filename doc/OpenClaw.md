# OpenClaw

Asistente de IA personal que conecta servicios de mensajería con modelos de lenguaje, permitiendo interactuar con ellos directamente desde el chat sin necesidad de abrir ninguna interfaz web. Actúa como `gateway` entre el cliente de mensajería y el backend de modelos.

En esta infraestructura corre en el `VPS` mediante `Docker`, se conecta a `Telegram` como interfaz de usuario y utiliza `Ollama` como backend de modelos a través de la red `WireGuard`.

Se interactúa con `OpenClaw` directamente desde `Telegram`, a través del bot configurado durante la instalación.

`OpenClaw` se comunica con `Ollama` usando la API nativa (`/api/chat`). La URL base apunta a la IP de la máquina con `Ollama` dentro de la red `WireGuard`
