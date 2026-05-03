import { isPortOpen } from './portCheck.js'

export async function isMachineOnline(host: string): Promise<boolean> {
	return isPortOpen(host, 22, 1000)
}
