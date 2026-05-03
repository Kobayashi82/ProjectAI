import type { FastifyInstance } from 'fastify'
import { isMachineOnline } from '../lib/machineOnline.js'
import { config } from '../config.js'

export async function statusRoutes(app: FastifyInstance) {

  app.get('/health', async () => {
		return { status: 'ok' }
	})

	// -- Checks both machines via SSH port 22 and returns their online/offline state
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
