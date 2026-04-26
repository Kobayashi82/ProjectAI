import psutil
import socket
import subprocess
from fastapi import FastAPI

app = FastAPI()

def get_ip():
	try:
		s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
		s.connect(("8.8.8.8", 80))
		ip = s.getsockname()[0]
		s.close()
		return ip
	except:
		return "unknown"

def get_cpu_temp():
	try:
		result = subprocess.run(
			["vcgencmd", "measure_temp"],
			capture_output=True, text=True
		)
		# Returns "temp=44.0'C", we extract the number
		return result.stdout.strip().replace("temp=", "").replace("'C", "°C")
	except:
		return "unknown"

def get_gpu_memory():
	try:
		result = subprocess.run(
			["vcgencmd", "get_mem", "gpu"],
			capture_output=True, text=True
		)
		# Returns "gpu=128M", we extract the number
		mem_str = result.stdout.strip().replace("gpu=", "").replace("M", "")
		return int(mem_str)
	except:
		return 0

@app.get("/")
def monitor():
	ram = psutil.virtual_memory()
	discos = {}

	for partition in psutil.disk_partitions():
		try:
			usage = psutil.disk_usage(partition.mountpoint)
			discos[partition.mountpoint] = {
				"total": f"{usage.total // (1024**3)} GB",
				"usado": f"{usage.used // (1024**3)} GB",
				"libre": f"{usage.free // (1024**3)} GB",
				"porcentaje": f"{usage.percent}%"
			}
		except:
			continue

	return ({
		"sistema": {
			"ip_local": get_ip(),
			"cpu_uso_porcentaje": psutil.cpu_percent(interval=1),
			"ram": {
				"total_gb": round(ram.total / (1024**3), 2),
				"usado_gb": round(ram.used / (1024**3), 2),
				"porcentaje": ram.percent
			},
			"temperatura_cpu": get_cpu_temp()
		},
		"gpu": {
			"nombre": "VideoCore IV",
			"memoria_total_mb": get_gpu_memory(),
			"memoria_asignada_mb": get_gpu_memory()
		},
		"discos": discos
	})
