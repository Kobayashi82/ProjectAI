import net from 'net'

// -- Tries to open a TCP connection to host:port.
// -- Resolves true if the port accepts connections, false otherwise.
// -- Used to check if services like ComfyUI or Open WebUI are running.
export function isPortOpen(host: string, port: number, timeoutMs = 3000): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket()

        socket.setTimeout(timeoutMs)

        socket.on('connect', () => {
            socket.destroy()
            resolve(true)
        })

        socket.on('timeout', () => {
            socket.destroy()
            resolve(false)
        })

        socket.on('error', () => {
            resolve(false)
        })

        socket.connect(port, host)
    })
}
