import type { FastifyInstance } from 'fastify'
import { readFile, statfs } from 'fs/promises'

async function readHostFile(path: string): Promise<string> {
    return readFile(`/host${path}`, 'utf-8')
}

async function getCpu(): Promise<number> {
    const sample = async () => {
        const raw = await readHostFile('/proc/stat')
        const line = raw.split('\n')[0].split(/\s+/).slice(1).map(Number)
        const idle = line[3]
        const total = line.reduce((a, b) => a + b, 0)
        return { idle, total }
    }

    const a = await sample()
    await new Promise(r => setTimeout(r, 500))
    const b = await sample()

    const totalDiff = b.total - a.total
    const idleDiff = b.idle - a.idle
    return Math.round((1 - idleDiff / totalDiff) * 1000) / 10
}

async function getRam(): Promise<{ total_gb: number; usado_gb: number; porcentaje: number }> {
    const raw = await readHostFile('/proc/meminfo')
    const get = (key: string) => {
        const match = raw.match(new RegExp(`${key}:\\s+(\\d+)`))
        return match ? parseInt(match[1]) * 1024 : 0
    }

    const total = get('MemTotal')
    const available = get('MemAvailable')
    const used = total - available

    return {
        total_gb: Math.round((total / 1e9) * 100) / 100,
        usado_gb: Math.round((used / 1e9) * 100) / 100,
        porcentaje: Math.round((used / total) * 1000) / 10,
    }
}

async function getDiscos(): Promise<Record<string, { total: string; usado: string; libre: string; porcentaje: string }>> {
    const s = await statfs('/host/')
    const total = s.blocks * s.bsize
    const free = s.bfree * s.bsize
    const used = total - free
    const pct = Math.round((used / total) * 1000) / 10

    return {
        '/': {
            total: `${Math.round(total / 1e9)} GB`,
            usado: `${Math.round(used / 1e9)} GB`,
            libre: `${Math.round(free / 1e9)} GB`,
            porcentaje: `${pct}%`,
        }
    }
}

async function getTemp(): Promise<string | null> {
    try {
        const raw = await readHostFile('/sys/class/thermal/thermal_zone0/temp')
        return `${(parseInt(raw.trim()) / 1000).toFixed(1)}°C`
    } catch {
        return null
    }
}

export async function vpsRoutes(app: FastifyInstance) {
    app.get('/vps', async () => {
        const [cpu, ram, discos, temp] = await Promise.all([
            getCpu(),
            getRam(),
            getDiscos(),
            getTemp(),
        ])

        return {
            online: true,
            data: {
                sistema: {
                    cpu_uso_porcentaje: cpu,
                    temperatura_cpu: temp,
                    ram,
                },
                discos,
            }
        }
    })
}
