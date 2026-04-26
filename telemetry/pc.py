import socket
import asyncio
import psutil
import GPUtil
import uvicorn
from fastapi import FastAPI

app = FastAPI(title="Windows Hardware Monitor API - Optimized")

# Inicializamos la lectura de CPU para que la primera llamada a la API no devuelva 0
psutil.cpu_percent(interval=None)

def to_one_decimal(value):
    """Normaliza un valor numérico al formato n.n"""
    return float(f"{value:.1f}")

def get_ip():
    """Obtiene la IP local de forma segura"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # No necesita conexión real, solo para determinar la interfaz de salida
        s.connect(('8.8.8.8', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

@app.get("/")
async def get_system_status():
    # --- CPU ---
    # interval=None es clave: no bloquea la ejecución. 
    # Mide el uso desde la última vez que fue llamado.
    cpu_usage = psutil.cpu_percent(interval=None)
    
    # --- RAM ---
    ram = psutil.virtual_memory()
    
    # --- GPU ---
    gpu_data = []
    try:
        # GPUtil puede ser pesado si se llama muchas veces por segundo.
        gpus = GPUtil.getGPUs()
        if not gpus:
            gpu_data = "No se detectaron GPUs NVIDIA"
        for gpu in gpus:
            gpu_data.append({
                "nombre": gpu.name,
                "uso": f"{gpu.load * 100:.1f}%",
                "vram_total": f"{gpu.memoryTotal:.0f} MB",
                "vram_uso": f"{gpu.memoryUsed:.0f} MB",
                "vram_libre": f"{gpu.memoryFree:.0f} MB",
                "temp": f"{gpu.temperature:.1f} °C"
            })
    except Exception as e:
        gpu_data = f"Error al leer GPU: {str(e)}"

    # --- DISCOS ---
    # Optimizamos para no despertar discos en reposo innecesariamente
    discos = {}
    try:
        for part in psutil.disk_partitions(all=False): # all=False ignora unidades virtuales/CDs
            if 'fixed' in part.opts or 'rw' in part.opts:
                try:
                    uso = psutil.disk_usage(part.mountpoint)
                    # Solo mostramos discos físicos con tamaño real
                    if uso.total > 0:
                        discos[part.mountpoint] = {
                            "total": f"{uso.total // (1024**3)} GB",
                            "usado": f"{uso.used // (1024**3)} GB",
                            "libre": f"{uso.free // (1024**3)} GB",
                            "porcentaje": f"{uso.percent:.1f}%"
                        }
                except (PermissionError, OSError):
                    continue
    except Exception:
        discos = "Error al leer discos"

    return {
        "sistema": {
            "ip_local": get_ip(),
            "cpu_uso_porcentaje": to_one_decimal(cpu_usage),
            "ram": {
                "total_gb": to_one_decimal(ram.total / (1024**3)),
                "usado_gb": to_one_decimal(ram.used / (1024**3)),
                "porcentaje": to_one_decimal(ram.percent)
            }
        },
        "gpus": gpu_data,
        "discos": discos
    }

if __name__ == "__main__":
    # Optimizaciones de Uvicorn:
    # - host="0.0.0.0" permite acceso desde otros dispositivos.
    # - loop="asyncio" asegura compatibilidad con el sistema.
    # - log_level="info" para ver errores, pero puedes usar "warning" para menos ruido.
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        log_level="info",
        access_log=False # Desactivar el log de cada petición ahorra I/O
    )