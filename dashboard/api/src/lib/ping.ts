import ping from 'ping'

// -- Returns true if the host responds to ping, false otherwise.
// -- Timeout is short - this is called on every status poll.
export async function isReachable(host: string): Promise<boolean> {
    try {
        const result = await ping.promise.probe(host, { timeout: 1 })
        return result.alive
    } catch {
        return false
    }
}
