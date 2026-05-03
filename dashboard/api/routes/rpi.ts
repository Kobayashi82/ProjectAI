import type { FastifyInstance } from 'fastify'
import { runSSHCommand, targets } from '../lib/ssh.js'

export async function rpiRoutes(app: FastifyInstance) {
	// -- POST /api/rpi/shutdown
	// -- Shuts down the Raspberry Pi via SSH
	// -- Requires passwordless sudo for /sbin/shutdown in sudoers
	app.post('/shutdown', async (_, reply) => {
		try {
			await runSSHCommand(targets.rpi, 'nohup sudo -n /sbin/shutdown now >/dev/null 2>&1 < /dev/null &', false, 10)
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
			await runSSHCommand(targets.rpi, 'nohup sudo -n /sbin/reboot >/dev/null 2>&1 < /dev/null &', false, 10)
      return { success: true }
    } catch (err) {
      reply.code(500).send({ error: 'Failed to reboot RPi' })
    }
  })
}
