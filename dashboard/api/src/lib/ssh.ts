import { NodeSSH } from 'node-ssh'
import { config } from '../config.js'

interface SSHTarget {
    host: string
    username: string
}

export async function runSSHCommand(target: SSHTarget, command: string, expectDisconnect = false, retries = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const ssh = new NodeSSH()
        let commandIssued = false
        try {
            await ssh.connect({
                host: target.host,
                username: target.username,
                privateKeyPath: config.SSH_KEY_PATH,
                readyTimeout: 10000,
            })

            if (expectDisconnect) {
                const connection = ssh.connection
                if (!connection) throw new Error('SSH connection unavailable')

                await new Promise<void>((resolve, reject) => {
                    connection.exec(command, (error: Error | null) => {
                        if (error) {
                            reject(error)
                            return
                        }

                        commandIssued = true

                        // -- Reboot/shutdown should drop the session shortly after the command is accepted.
                        setTimeout(resolve, 500)
                    })
                })
                return ''
            }

            const result = await ssh.execCommand(command)
            if (result.code !== 0 && result.stderr) throw new Error(result.stderr)
            return result.stdout
        } catch (error) {
            if (expectDisconnect && commandIssued) return ''
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
