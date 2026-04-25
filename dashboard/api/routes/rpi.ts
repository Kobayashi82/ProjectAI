import type { FastifyInstance } from 'fastify'
import { runSSHCommand, targets } from '../lib/ssh.js'

export async function rpiRoutes(app: FastifyInstance) {
	// -- POST /api/rpi/shutdown
	// -- Shuts down the Raspberry Pi via SSH
	// -- Requires passwordless sudo for /sbin/shutdown in sudoers
	app.post('/shutdown', async (_, reply) => {
		try {
			await runSSHCommand(targets.rpi, 'sudo shutdown now', true)
			return { success: true }
		} catch (err) {
			reply.code(500).send({ error: 'Failed to shutdown RPi' })
		}
	})

	// -- POST /api/rpi/reboot
	// -- Reboots the Raspberry Pi via SSH
	// -- Requires passwordless sudo for /sbin/reboot in sudoers
  app.post('/reboot', async (_, reply) => {
    try {
      const result = await runSSHCommand(targets.rpi, 'sudo reboot', true)
      console.log('reboot stdout:', result)
      return { success: true }
    } catch (err) {
      console.error('reboot error:', err)
      reply.code(500).send({ error: 'Failed to reboot RPi' })
    }
  })
}
