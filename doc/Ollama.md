# Ollama

Es una herramienta que permite descargar y ejecutar modelos de lenguaje `LLM` de forma local, sin depender de servicios en la nube. Actúa como servidor de modelos, exponiendo una `API REST` que otros servicios como `Open WebUI` o `OpenClaw` pueden consumir para ofrecer una interfaz de chat completa.

En esta infraestructura, `Ollama` corre en la máquina local y se accede a él en remoto desde otros servicios a través de la red interna de `WireGuard`.

---

## Acceso remoto

Por defecto, `Ollama` solo escucha en `localhost` y no acepta conexiones externas. Para permitir acceso desde otros dispositivos de la red es necesario configurar la variable de entorno `OLLAMA_HOST=0.0.0.0`.

La API queda disponible en `http://[IP]:11434`.

## Modelos

Puede descargar modelos y abrir una sesion de chat desde la terminal.

```bash
ollama pull <modelo>
ollama list
ollama run <modelo>
```

---

## Windows

1. Descargar el instalador desde https://ollama.com/download
2. Ejecutar el instalador. `Ollama` queda corriendo como proceso en segundo plano accesible desde la barra de tareas.

### Configuración para acceso remoto

`Ollama` hereda las variables de entorno del sistema. Para configurarlas:

1. Salir de `Ollama` desde la barra de tareas.
2. Abrir las variables de entorno de `Windows` y crear o editar:
   - `OLLAMA_HOST` → `0.0.0.0`
   - `OLLAMA_ORIGINS` → `*`
4. Guardar y volver a abrir `Ollama`.

---

## Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

El script instala `Ollama` y lo configura como servicio `systemd` que arranca automáticamente.

### Configuración para acceso remoto

Editar el servicio para añadir la variable de entorno:

```bash
sudo systemctl edit ollama.service
```

Añadir bajo la sección `[Service]`:

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
Environment="OLLAMA_ORIGINS=*"
```

Guardar y recargar el servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```
