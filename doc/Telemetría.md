# Telemetría

Obtenida por dos clientes que recopilan métricas del sistema en tiempo real y las exponen como `JSON` para que el `dashboard` del `VPS` las consuma y muestre.

---

## Windows

Escrito en `Python`, corre en la máquina principal y expone las siguientes métricas:

- `Sistema` — IP local, uso de CPU y RAM (total, usado y porcentaje).
- `GPU` — nombre, uso, VRAM total, usada y libre, y temperatura. Soporta múltiples GPUs.
- `Discos` — para cada unidad montada: espacio total, usado, libre y porcentaje de uso.

---

## Linux

Escrito en `Python`, corre en la `Raspberry Pi` y expone las siguientes métricas:

- `Sistema` — IP local, uso de CPU, RAM y temperatura de CPU.
- `GPU` — nombre (VideoCore IV), memoria total y asignada.
- `Discos` — para cada punto de montaje: espacio total, usado, libre y porcentaje. Incluye la raíz `/`, el firmware y el disco externo montado en `/mnt/externo`.
