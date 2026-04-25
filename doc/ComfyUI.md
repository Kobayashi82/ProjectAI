# ComfyUI

Interfaz basada en nodos para generación de imágenes y vídeo mediante modelos de difusión. Permite construir flujos de trabajo visuales conectando nodos que representan cada paso del proceso: carga de modelo, prompt, sampler, decodificación, etc.

En esta infraestructura corre en `Windows` y se accede desde el `VPS` a través de la red `WireGuard`.

---

## Modelos y LoRAs

Los modelos base y LoRAs se descargan principalmente desde **CivitAI**, una plataforma de la comunidad donde se publican y comparten modelos de generación de imágenes.

### LoRAs

Los `LoRA` (Low-Rank Adaptation) son adaptaciones ligeras que se aplican sobre un modelo base para modificar su estilo, personajes o conceptos concretos sin necesidad de reentrenar el modelo completo. Se combinan con el modelo base en el flujo de trabajo, pudiendo ajustar su peso de influencia.

### CivitAI

Para descargar modelos es necesario tener cuenta en https://civitai.com y en algunos casos generar una `API key` desde el perfil para poder descargar directamente desde ComfyUI mediante el gestor de modelos.
