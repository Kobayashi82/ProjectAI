import { NodeSSH } from 'node-ssh'
import { config } from '../config.js'

interface SSHTarget {
	host: string
	username: string
}

export async function runSSHCommand(target: SSHTarget, command: string, expectDisconnect = false): Promise<string> {
	const ssh = new NodeSSH()

	try {
		await ssh.connect({
			host: target.host,
			username: target.username,
			privateKeyPath: config.SSH_KEY_PATH,
			readyTimeout: 5000,
		})

		const result = await ssh.execCommand(command)

		if (result.code !== 0 && result.stderr) {
			throw new Error(result.stderr)
		}

		return result.stdout
	} catch (error) {
		// If disconnect is expected (shutdown/reboot), ECONNRESET is not an error
      if (expectDisconnect && (error as NodeJS.ErrnoException).code === 'ECONNRESET') {
          return ''
      }
      throw error instanceof Error ? error : new Error(String(error))
	} finally {
		ssh.dispose()
	}
}

export const targets = {
	pc: {
		host: config.PC_IP,
		username: config.SSH_USER_PC,
	},
	rpi: {
		host: config.RPI_IP,
		username: config.SSH_USER_RPI,
	},
}