import type { FastifyInstance } from 'fastify'
import { isReachable } from '../lib/ping.js'
import { isPortOpen } from '../lib/portCheck.js'
import { config } from '../config.js'

async function isMachineOnline(host: string): Promise<boolean> {
	try {
		await Promise.any([
			isReachable(host).then((online) => online || Promise.reject(new Error('offline'))),
			isPortOpen(host, 22, 1000).then((online) => online || Promise.reject(new Error('offline'))),
		])
		return true
	} catch {
		return false
	}
}

// -- Filters and renames RPi disk entries
function cleanRpiDisks(data: any) {
	const EXCLUDE = ['/boot/firmware']
	const RENAME: Record<string, string> = {
		'/mnt/externo': '/externo',
	}

	const cleaned: Record<string, unknown> = {}
	for (const [mount, disk] of Object.entries(data.discos)) {
		if (EXCLUDE.includes(mount)) continue
		const key = RENAME[mount] ?? mount
		cleaned[key] = disk
	}

	return { ...data, discos: cleaned }
}

// -- Fetches telemetry JSON from a machine's local agent (running on :8000)
async function fetchTelemetry(ip: string, port: number): Promise<unknown> {
	const response = await fetch(`http://${ip}:${port}`)
	if (!response.ok) throw new Error(`Agent responded with status ${response.status}`)
	return response.json()
}

export async function telemetryRoutes(app: FastifyInstance) {
	// -- GET /api/telemetry/pc
	// -- Pings the PC first. If offline, returns early without calling the agent.
	app.get('/pc', async () => {
		const online = await isMachineOnline(config.PC_IP)
		if (!online) return { online: false, data: null }

		try {
			const data = await fetchTelemetry(config.PC_IP, config.PERFORMANCE_PADRE_PORT)
			return { online: true, data }
		} catch {
			return { online: true, data: null }
		}
	})

	// -- GET /api/telemetry/rpi
	// -- Pings the RPi first. If offline, returns early without calling the agent.
	app.get('/rpi', async () => {
		const online = await isMachineOnline(config.RPI_IP)
		if (!online) return { online: false, data: null }

		try {
			const data = await fetchTelemetry(config.RPI_IP, config.PERFORMANCE_RASPBERRY_PORT)
			return { online: true, data: cleanRpiDisks(data) }
		} catch {
			return { online: true, data: null }
		}
	})
}
