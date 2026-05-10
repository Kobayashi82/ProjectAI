import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const GUAC_BASE    = process.env.GUAC_URL      ?? 'http://guacamole:8080/guacamole'
const GUAC_PUBLIC_BASE = process.env.GUAC_PUBLIC_URL ?? GUAC_BASE
const GUAC_USER    = process.env.ADMIN_USER    ?? 'guaca_admin'
const GUAC_PASS    = process.env.ADMIN_PASS    ?? 'guaca_pass'
const GUAC_DATASOURCE = process.env.GUAC_DATASOURCE

interface AuthSession {
    token: string
    dataSource: string
    expiresAt: number
}

// Cache por usuario para mantener alineada la sesión de Guacamole con Remote-User.
const authSessionCache = new Map<string, AuthSession>()

interface GuacTokenResponse {
    authToken: string
    dataSource?: string
    availableDataSources?: string[]
}

function pickDataSource(payload: GuacTokenResponse): string {
    const available = payload.availableDataSources ?? []

    if (GUAC_DATASOURCE && available.includes(GUAC_DATASOURCE)) return GUAC_DATASOURCE

    // Prefer database-backed sources when header auth is enabled.
    const preferred = ['postgresql', 'postgres', 'mysql']
    for (const ds of preferred) {
        if (available.includes(ds)) return ds
    }

    if (payload.dataSource) return payload.dataSource
    return 'postgresql'
}

async function getAuthSession(username: string): Promise<{ token: string; dataSource: string }> {
    const cached = authSessionCache.get(username)
    if (cached && Date.now() < cached.expiresAt) {
        return { token: cached.token, dataSource: cached.dataSource }
    }

    const res = await fetch(`${GUAC_BASE}/api/tokens`, {
        method: 'POST',
        body: new URLSearchParams({ username, password: GUAC_PASS }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Remote-User': username,
        },
    })

    if (!res.ok) throw new Error(`Guacamole auth failed for ${username}: ${res.status}`)

    const data: GuacTokenResponse = await res.json()
    const nextSession: AuthSession = {
        token: data.authToken,
        dataSource: pickDataSource(data),
        expiresAt: Date.now() + 25 * 60 * 1000,
    }

    authSessionCache.set(username, nextSession)
    return { token: nextSession.token, dataSource: nextSession.dataSource }
}

// ─── Construir URL de cliente Guacamole ───────────────────────────────────────
function buildClientUrl(connectionId: string, dataSource: string): string {
    const raw = `${connectionId}\0c\0${dataSource}`
    const encoded = Buffer.from(raw).toString('base64')
    return `${GUAC_PUBLIC_BASE}/#/client/${encoded}`
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface GuacConnection {
    label: string
    type: string
    machine: string
    url: string
}

function normalizeMachine(rawMachine: string): string {
    const value = rawMachine.trim().toLowerCase()
    if (value === 'pc' || value === 'padre' || value === 'windows') return 'pc'
    if (value === 'rpi' || value === 'raspberry' || value === 'pi') return 'rpi'
    return value
}

// ─── Plugin ───────────────────────────────────────────────────────────────────
export default async function guacamoleRoutes(app: FastifyInstance) {

    app.get('/guacamole/connections', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const remoteUserHeader = request.headers['remote-user']
            const remoteUser = Array.isArray(remoteUserHeader)
                ? remoteUserHeader[0]
                : (remoteUserHeader ?? GUAC_USER)

            const { token, dataSource } = await getAuthSession(remoteUser)

            const res = await fetch(
                `${GUAC_BASE}/api/session/data/${dataSource}/connections?token=${token}`
            )

            if (!res.ok) {
                // Si el token expiró, invalidar cache de este usuario y pedir reintento
                if (res.status === 403) {
                    authSessionCache.delete(remoteUser)
                    return reply.status(503).send({ error: 'Guacamole token expired, retry' })
                }
                throw new Error(`Guacamole connections failed for ${remoteUser}: ${res.status}`)
            }

            const raw: Record<string, { identifier?: string; name: string; protocol?: string }> = await res.json()

            const connections: GuacConnection[] = Object.entries(raw).map(([id, conn]) => {
                const parts  = conn.name.split('-')        // "PC-SSH" → ["PC", "SSH"]
                const machine = normalizeMachine(parts[0] ?? '')
                const type = parts.length > 1
                    ? parts.slice(1).join('-')
                    : (conn.protocol ?? 'ACCESS').toUpperCase()

                return {
                    label:   conn.name,
                    type,
                    machine,
                    url: buildClientUrl(conn.identifier ?? id, dataSource),
                }
            })

            return reply.send(connections)

        } catch (err) {
            app.log.error(err)
            return reply.status(500).send({ error: 'Failed to fetch Guacamole connections' })
        }
    })
}
