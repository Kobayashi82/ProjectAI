import socket
import time
import psutil
import uvicorn
import pynvml
from fastapi import FastAPI

app = FastAPI(title="Windows Hardware Monitor API - Optimized")

# Initialize CPU percent so the first API call doesn't return 0
psutil.cpu_percent(interval=None)

# ---------------------------------------------------------------------------
# IP — resolved once at startup
# ---------------------------------------------------------------------------
def _resolve_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        return s.getsockname()[0]
    except Exception:
        return "0.0.0.0"
    finally:
        s.close()

LOCAL_IP: str = _resolve_ip()

# ---------------------------------------------------------------------------
# NVML — initialized once at startup, handles kept open
# ---------------------------------------------------------------------------
_nvml_ready: bool = False
_gpu_handles: list = []

try:
    pynvml.nvmlInit()
    device_count = pynvml.nvmlDeviceGetCount()
    _gpu_handles = [pynvml.nvmlDeviceGetHandleByIndex(i) for i in range(device_count)]
    _nvml_ready = True
except pynvml.NVMLError:
    _nvml_ready = False

# ---------------------------------------------------------------------------
# Disk — partitions cached at startup, usage cached with 60s TTL
# ---------------------------------------------------------------------------
_DISK_TTL_SECONDS: int = 60

# Cache partition list once — partitions don't change at runtime
_cached_partitions: list = []
try:
    for _part in psutil.disk_partitions(all=False):
        if 'fixed' in _part.opts or 'rw' in _part.opts:
            _cached_partitions.append(_part)
except Exception:
    _cached_partitions = []

# Disk usage cache: stores last read value and its timestamp
_disk_cache: dict = {
    "data":        None,
    "last_update": 0.0
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def to_one_decimal(value) -> float:
    """Normalizes a numeric value to n.n format"""
    return float(f"{value:.1f}")


def _read_gpus() -> list | str:
    """Reads GPU stats using open NVML handles — no subprocess overhead"""
    if not _nvml_ready or not _gpu_handles:
        return "No NVIDIA GPUs detected or NVML unavailable"

    result = []
    try:
        for handle in _gpu_handles:
            name = pynvml.nvmlDeviceGetName(handle)
            if isinstance(name, bytes):
                name = name.decode("utf-8")

            utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)
            mem_info    = pynvml.nvmlDeviceGetMemoryInfo(handle)
            temp        = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)

            vram_total_mb = mem_info.total // (1024 ** 2)
            vram_used_mb  = mem_info.used  // (1024 ** 2)
            vram_free_mb  = mem_info.free  // (1024 ** 2)

            result.append({
                "nombre":     name,
                "uso":        f"{utilization.gpu:.1f}%",
                "vram_total": f"{vram_total_mb} MB",
                "vram_uso":   f"{vram_used_mb} MB",
                "vram_libre": f"{vram_free_mb} MB",
                "temp":       f"{temp:.1f} °C"
            })
    except pynvml.NVMLError as e:
        return f"Error reading GPU: {str(e)}"

    return result


def _read_disks() -> dict | str:
    """
    Returns disk usage from cache if within TTL,
    otherwise reads from disk and updates the cache.
    Partition list is pre-cached at startup.
    """
    now = time.monotonic()

    # Return cached data if still valid
    if _disk_cache["data"] is not None and (now - _disk_cache["last_update"]) < _DISK_TTL_SECONDS:
        return _disk_cache["data"]

    # TTL expired — read from disk and update cache
    discos = {}
    try:
        for part in _cached_partitions:
            try:
                uso = psutil.disk_usage(part.mountpoint)
                if uso.total > 0:
                    discos[part.mountpoint] = {
                        "total":      f"{uso.total // (1024 ** 3)} GB",
                        "usado":      f"{uso.used  // (1024 ** 3)} GB",
                        "libre":      f"{uso.free  // (1024 ** 3)} GB",
                        "porcentaje": f"{uso.percent:.1f}%"
                    }
            except (PermissionError, OSError):
                continue
    except Exception:
        return "Error reading disks"

    _disk_cache["data"]        = discos
    _disk_cache["last_update"] = now

    return discos


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@app.get("/")
async def get_system_status():
    # CPU — interval=None: non-blocking, measures since last call
    cpu_usage = psutil.cpu_percent(interval=None)

    # RAM
    ram = psutil.virtual_memory()

    return {
        "sistema": {
            "ip_local":           LOCAL_IP,
            "cpu_uso_porcentaje": to_one_decimal(cpu_usage),
            "ram": {
                "total_gb":   to_one_decimal(ram.total / (1024 ** 3)),
                "usado_gb":   to_one_decimal(ram.used  / (1024 ** 3)),
                "porcentaje": to_one_decimal(ram.percent)
            }
        },
        "gpus":   _read_gpus(),
        "discos": _read_disks()
    }


# ---------------------------------------------------------------------------
# Shutdown
# ---------------------------------------------------------------------------
@app.on_event("shutdown")
def _shutdown():
    """Clean up NVML on server shutdown"""
    if _nvml_ready:
        pynvml.nvmlShutdown()


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        access_log=False
    )