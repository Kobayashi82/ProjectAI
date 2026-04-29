import { NodeSSH } from 'node-ssh'
import { config } from '../config.js'

interface SSHTarget {
	host: string
	username: string
}

export async function runSSHCommand(target: SSHTarget, command: string, expectDisconnect = false, retries = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const ssh = new NodeSSH()
        try {
            await ssh.connect({
                host: target.host,
                username: target.username,
                privateKeyPath: config.SSH_KEY_PATH,
                readyTimeout: 10000,
            })

            if (expectDisconnect) {
                ssh.connection?.exec(command, () => {})
                await new Promise(res => setTimeout(res, 500))
                return ''
            }

            const result = await ssh.execCommand(command)
            if (result.code !== 0 && result.stderr) throw new Error(result.stderr)
            return result.stdout
        } catch (error) {
            if (expectDisconnect) return ''
            if (attempt < retries) {
                console.warn(`SSH attempt ${attempt} failed, retrying...`)
                continue
            }
            throw error instanceof Error ? error : new Error(String(error))
        } finally {
            ssh.dispose()
        }
    }
    throw new Error('SSH failed after retries')
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