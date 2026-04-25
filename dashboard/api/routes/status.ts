import type { FastifyInstance } from 'fastify'
import { isReachable } from '../lib/ping.js'
import { isPortOpen } from '../lib/portCheck.js'
import { config } from '../config.js'

async function isMachineOnline(host: string): Promise<boolean> {
	const checks = [
		isReachable(host),
		isPortOpen(host, 22, 1000),
	]

	try {
		await Promise.any([
			checks[0].then((online) => online || Promise.reject(new Error('offline'))),
			checks[1].then((online) => online || Promise.reject(new Error('offline'))),
		])
		return true
	} catch {
		return false
	}
}

export async function statusRoutes(app: FastifyInstance) {

  app.get('/health', async () => {
		return { status: 'ok' }
	})

	// -- Pings both machines and returns their online/offline state
	app.get('/status', async () => {
		const [pcOnline, rpiOnline] = await Promise.all([
			isMachineOnline(config.PC_IP),
			isMachineOnline(config.RPI_IP),
		])

		return {
			pc: { online: pcOnline },
			rpi: { online: rpiOnline },
		}
	})
}
