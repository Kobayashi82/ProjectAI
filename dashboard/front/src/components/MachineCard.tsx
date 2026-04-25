import { useState, useEffect } from 'react'
import StatusBadge from './StatusBadge'
import ActionButton from './ActionButton'
import { type ReactNode } from 'react'
import { useAction } from '../hooks/useAction.js'
import { useTelemetry } from '../hooks/useTelemetry.js'

interface MachineCardProps {
    id: string
    label: string
    subtitle: string
    online: boolean
    statusLoading: boolean
    canWake?: boolean
    canShutdown?: boolean
    canReboot?: boolean
    telemetry?: 'pc' | 'rpi' | 'vps'
}

interface GuacConnection {
    label: string
    type: string
    machine: string
    url: string
}

type ConfirmAction = 'shutdown' | 'reboot' | null

const formatPercent = (value: number, decimals = 1) => `${value.toFixed(decimals)}%`

const formatPercentFromString = (value: string, decimals = 1) => formatPercent(parseFloat(value), decimals)

const usageColor = (percent: number) => {
    if (percent >= 85) return 'text-offline/50'
    if (percent >= 60) return 'text-warning/50'
    return 'text-online/50'
}

const usageBar = (percent: number) => {
    if (percent >= 85) return 'bg-offline'
    if (percent >= 60) return 'bg-warning'
    return 'bg-online'
}

const Bar = ({ value }: { value: number }) => (
    <div className="w-full h-px bg-surface-border mt-1 mb-2">
        <div
            className={`h-full ${usageBar(value)} transition-all duration-500`}
            style={{ width: `${Math.min(value, 100)}%`, opacity: 0.7 }}
        />
    </div>
)

const TelemetryRow = ({
    label,
    value,
    valueClassName,
    right,
}: {
    label: string
    value: ReactNode
    valueClassName: string
    right: ReactNode
}) => (
    <div className="grid grid-cols-[minmax(0,0.5fr)_1.75rem_minmax(0,1.5fr)] items-center gap-x-2 sm:gap-x-4 sm:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)]">
        <span className="text-accent/40 min-w-0 truncate">{label}</span>
        <span className={`${valueClassName} w-full min-w-0 overflow-hidden whitespace-nowrap justify-self-center text-center text-xs`}>{value}</span>
        <span className="text-accent/30 min-w-0 justify-self-end truncate text-right text-xs">{right}</span>
    </div>
)

const ServiceButton = ({ label, url, disabled }: { label: string; url: string; disabled: boolean }) => (
    <button
        type="button"
        onClick={(event) => {
            event.currentTarget.blur()
            window.open(url, '_blank', 'noopener,noreferrer')
        }}
        disabled={disabled}
        className="btn-service disabled:opacity-30 disabled:cursor-not-allowed"
    >
        <span className="text-accent/40">›</span>
        {label}
    </button>
)

const requiredEnv = (value: string | undefined, key: string) => {
    if (!value || value.trim().length === 0) {
        console.error(`Missing required env var: ${key}`)
        return ''
    }
    return value.trim()
}

const toHttpsUrl = (domain: string | undefined, key: string, path = '') => {
    const host = requiredEnv(domain, key)
    if (!host) return ''
    return `https://${host}${path}`
}

// ─── Links estáticos (Files, servicios, AI) ───────────────────────────────────
const SERVICE_LINKS: Record<string, { label: string; url: string }[]> = {
    pc:  [{ label: 'Files',     url: toHttpsUrl(import.meta.env.VITE_FILEBROWSER_PADRE_DOMAIN, 'VITE_FILEBROWSER_PADRE_DOMAIN') },
        { label: 'Torrent',   url: toHttpsUrl(import.meta.env.VITE_TORRENT_PADRE_DOMAIN, 'VITE_TORRENT_PADRE_DOMAIN') }],
    rpi: [{ label: 'Files',     url: toHttpsUrl(import.meta.env.VITE_FILEBROWSER_RASPBERRY_DOMAIN, 'VITE_FILEBROWSER_RASPBERRY_DOMAIN') },
        { label: 'Torrent',   url: toHttpsUrl(import.meta.env.VITE_TORRENT_RASPBERRY_DOMAIN, 'VITE_TORRENT_RASPBERRY_DOMAIN') }],
    vps: [{ label: 'Files',     url: toHttpsUrl(import.meta.env.VITE_FILEBROWSER_VPS_DOMAIN, 'VITE_FILEBROWSER_VPS_DOMAIN') },
        { label: 'Portainer', url: toHttpsUrl(import.meta.env.VITE_PORTAINER_DOMAIN, 'VITE_PORTAINER_DOMAIN') }],
}

const AI_LINKS: Record<string, { label: string; url: string }[]> = {
    pc: [
        { label: 'ComfyUI',    url: toHttpsUrl(import.meta.env.VITE_COMFYUI_DOMAIN, 'VITE_COMFYUI_DOMAIN') },
        { label: 'Open WebUI', url: toHttpsUrl(import.meta.env.VITE_OPENWEBUI_DOMAIN, 'VITE_OPENWEBUI_DOMAIN') },
        {
            label: 'OpenClaw',
            url: toHttpsUrl(
                import.meta.env.VITE_OPENCLAW_DOMAIN,
                'VITE_OPENCLAW_DOMAIN',
                `/#token=${requiredEnv(import.meta.env.VITE_OPENCLAW_TOKEN, 'VITE_OPENCLAW_TOKEN')}`,
            ),
        },
    ],
}

// ─── Cache compartida entre cards ─────────────────────────────────────────────
let guacCache: GuacConnection[] | null = null
let guacFetchPromise: Promise<GuacConnection[]> | null = null

async function fetchGuacConnections(): Promise<GuacConnection[]> {
    if (guacCache) return guacCache
    if (!guacFetchPromise) {
        guacFetchPromise = fetch('/api/guacamole/connections')
            .then(r => r.json())
            .then(data => { guacCache = data; return data })
            .finally(() => { guacFetchPromise = null })
    }
    return guacFetchPromise
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function MachineCard({
    id,
    label,
    subtitle,
    online,
    statusLoading,
    canWake,
    canShutdown,
    canReboot,
    telemetry,
}: MachineCardProps) {
    const [confirmAction, setConfirmAction]   = useState<ConfirmAction>(null)
    const [showCommands, setShowCommands]     = useState(false)
    const [commands, setCommands]             = useState<string[]>([])
    const [cmdLoading, setCmdLoading]         = useState(false)
    const [executingCmd, setExecutingCmd]     = useState<string | null>(null)
    const [accessLinks, setAccessLinks]       = useState<GuacConnection[]>([])

    const wake     = useAction(`/api/${id}/wake`)
    const shutdown = useAction(`/api/${id}/shutdown`)
    const reboot   = useAction(`/api/${id}/reboot`)

    const { data: tel } = useTelemetry(telemetry as 'pc' | 'rpi', !!telemetry && online)

    const serviceLinks = (SERVICE_LINKS[id] ?? []).filter((link) => Boolean(link.url))
    const aiLinks      = (AI_LINKS[id] ?? []).filter((link) => Boolean(link.url))

    // ─── Cargar conexiones Guacamole ──────────────────────────────────────────
    useEffect(() => {
        fetchGuacConnections()
            .then(all => setAccessLinks(all.filter(c => c.machine === id)))
            .catch(err => console.error('Error fetching Guacamole connections', err))
    }, [id])

    // ─── Comandos remotos ─────────────────────────────────────────────────────
    const fetchCommands = async () => {
        setCmdLoading(true)
        try {
            const res  = await fetch('/api/remote/list')
            const data = await res.json()
            if (data.success) setCommands(data.commands)
        } catch (e) {
            console.error('Error fetching commands', e)
        } finally {
            setCmdLoading(false)
        }
    }

    const handleExecute = async (cmd: string) => {
        setExecutingCmd(cmd)
        try {
            const res  = await fetch('/api/remote/command', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ name: cmd }),
            })
            const data = await res.json()
            if (!data.success) console.error('Command failed', data.message)
        } catch (e) {
            console.error('UDP Bridge Error', e)
        } finally {
            setExecutingCmd(null)
        }
    }

    const toggleCommands = () => {
        if (!showCommands && commands.length === 0) fetchCommands()
        setShowCommands(!showCommands)
    }

    const handleConfirm = async () => {
        const action = confirmAction
        setConfirmAction(null)
        if (action === 'shutdown') await shutdown.execute()
        if (action === 'reboot')   await reboot.execute()
    }

    return (
        <div className="terminal-border bg-surface-card p-6 flex flex-col gap-5 transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs text-accent/40 tracking-[0.3em] uppercase mb-1">{subtitle}</div>
                    <h2 className="text-xl font-bold tracking-widest uppercase glow">{label}</h2>
                </div>
                <StatusBadge online={online} loading={statusLoading} />
            </div>

            {/* Power */}
            {(canWake || canShutdown || canReboot) && (
                <>
                    <div className="border-t border-surface-border" />
                    <div>
                        <div className="text-xs text-accent/30 tracking-[0.25em] uppercase mb-3">// power</div>
                        <div className="flex flex-wrap gap-2">
                            {canWake && (
                                <ActionButton label="Wake" onClick={wake.execute} loading={wake.loading} disabled={online} />
                            )}
                            {canShutdown && (
                                <ActionButton label="Shutdown" onClick={() => setConfirmAction('shutdown')} loading={shutdown.loading} disabled={!online} danger />
                            )}
                            {canReboot && (
                                <ActionButton label="Reboot" onClick={() => setConfirmAction('reboot')} loading={reboot.loading} disabled={!online} danger />
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Access (Guacamole) */}
            {accessLinks.length > 0 && (
                <>
                    <div className="border-t border-surface-border" />
                    <div>
                        <div className="text-xs text-accent/30 tracking-[0.25em] uppercase mb-3">// access</div>
                        <div className="flex flex-wrap gap-2">
                            {accessLinks.map(c => (
                                <ServiceButton key={c.url} label={c.type} url={c.url} disabled={!online} />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Services */}
            {serviceLinks.length > 0 && (
                <>
                    <div className="border-t border-surface-border" />
                    <div>
                        <div className="text-xs text-accent/30 tracking-[0.25em] uppercase mb-3">// services</div>
                        <div className="flex flex-wrap gap-2">
                            {serviceLinks.map(svc => (
                                <ServiceButton key={svc.url} label={svc.label} url={svc.url} disabled={!online} />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* AI */}
            {aiLinks.length > 0 && (
                <>
                    <div className="border-t border-surface-border" />
                    <div>
                        <div className="text-xs text-accent/30 tracking-[0.25em] uppercase mb-2">// ai</div>
                        <div className="flex flex-wrap gap-2">
                            {aiLinks.map(svc => (
                                <ServiceButton key={svc.url} label={svc.label} url={svc.url} disabled={!online} />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Telemetry */}
            {telemetry && online && tel && (
                <>
                    <div className="border-t border-surface-border" />
                    <div>
                        <div className="text-xs text-accent/30 tracking-[0.25em] uppercase mb-3">// telemetry</div>
                        <div className="flex flex-col text-xs font-mono tabular-nums">
                            <TelemetryRow
                                label="cpu"
                                value={formatPercent(tel.sistema.cpu_uso_porcentaje)}
                                valueClassName={usageColor(tel.sistema.cpu_uso_porcentaje)}
                                right={tel.sistema.temperatura_cpu ?? '—'}
                            />
                            <Bar value={tel.sistema.cpu_uso_porcentaje} />
                            <TelemetryRow
                                label="ram"
                                value={formatPercent(tel.sistema.ram.porcentaje)}
                                valueClassName={usageColor(tel.sistema.ram.porcentaje)}
                                right={`${tel.sistema.ram.usado_gb.toFixed(1)} / ${tel.sistema.ram.total_gb.toFixed(1)} GB`}
                            />
                            <Bar value={tel.sistema.ram.porcentaje} />
                            {tel.gpus?.map((gpu, i) => {
                                const gpuUsage = parseFloat(gpu.uso)
                                const vramPercent = Math.round((parseFloat(gpu.vram_uso) / parseFloat(gpu.vram_total)) * 100)
                                return (
                                    <div key={i}>
                                        <TelemetryRow
                                            label={`gpu${tel.gpus!.length > 1 ? ` ${i + 1}` : ''}`}
                                            value={formatPercentFromString(gpu.uso)}
                                            valueClassName={usageColor(gpuUsage)}
                                            right={gpu.temp}
                                        />
                                        <Bar value={gpuUsage} />
                                        <TelemetryRow
                                            label="vram"
                                            value={formatPercent(vramPercent)}
                                            valueClassName={usageColor(vramPercent)}
                                            right={`${gpu.vram_uso} / ${gpu.vram_total}`}
                                        />
                                        <Bar value={vramPercent} />
                                    </div>
                                )
                            })}
                            {Object.entries(tel.discos).map(([mount, disk]) => {
                                const pct = parseFloat(disk.porcentaje)
                                return (
                                    <div key={mount}>
                                        <TelemetryRow
                                            label={mount}
                                            value={formatPercent(pct)}
                                            valueClassName={usageColor(pct)}
                                            right={`${disk.usado} / ${disk.total}`}
                                        />
                                        <Bar value={pct} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Remote Commands */}
            {id === 'pc' && online && (
                <>
                    <div className="border-t border-surface-border" />
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div
                                className="text-xs text-accent/30 tracking-[0.25em] uppercase cursor-pointer hover:text-accent/60 flex items-center gap-2"
                                onClick={toggleCommands}
                            >
                                <span>// commands</span>
                                <span className="text-[10px] opacity-50">{showCommands ? '▼' : '▶'}</span>
                            </div>
                            <button
                                onClick={fetchCommands}
                                disabled={cmdLoading}
                                aria-label="refresh commands"
                                title="Refresh commands"
                                className="btn-refresh"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    className={`h-4 w-4 ${cmdLoading ? 'animate-spin' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 11a8 8 0 1 0-2.34 5.66" />
                                    <path d="M20 4v7h-7" />
                                </svg>
                            </button>
                        </div>
                        {showCommands && (
                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-top-1">
                                {commands.map(cmd => (
                                    <div
                                        key={cmd}
                                        className="flex items-center justify-between p-1 px-2 bg-surface-base/30 border border-surface-border/50 hover:border-accent/30 group"
                                    >
                                        <span className="text-[10px] font-mono text-accent/40 truncate uppercase">{cmd}</span>
                                        <button
                                            onClick={() => handleExecute(cmd)}
                                            disabled={executingCmd !== null}
                                            className="text-[9px] text-accent/30 opacity-0 group-hover:opacity-100 group-hover:text-accent/60 transition-all disabled:opacity-30 flex items-center justify-center"
                                        >
                                            {executingCmd === cmd ? (
                                                '...'
                                            ) : (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                    className="h-3 w-3"
                                                    fill="currentColor"
                                                >
                                                    <path d="M8 5v14l11-7L8 5z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Confirm modal */}
            {confirmAction && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 backdrop-blur-sm"
                    onClick={() => setConfirmAction(null)}
                >
                    <div
                        className="terminal-border bg-surface-card p-6 flex flex-col gap-4 w-80"
                        onClick={e => e.stopPropagation()}
                    >
                        <div>
                            <div className="text-xs text-accent/30 tracking-[0.25em] uppercase mb-1">// confirm</div>
                            <h3 className="text-sm font-bold tracking-widest uppercase glow">
                                {confirmAction === 'shutdown' ? 'Shutdown' : 'Reboot'} {label}?
                            </h3>
                        </div>
                        <p className="text-xs text-accent/50 font-mono leading-relaxed">
                            ! This action will {confirmAction === 'shutdown' ? 'power off' : 'restart'} the machine.
                            {confirmAction === 'shutdown' && ' You will need to wake it manually afterwards.'}
                        </p>
                        <div className="flex gap-2 justify-end">
                            <ActionButton label="Cancel" onClick={() => setConfirmAction(null)} />
                            <ActionButton
                                label={confirmAction === 'shutdown' ? 'Shutdown' : 'Reboot'}
                                onClick={handleConfirm}
                                loading={shutdown.loading || reboot.loading}
                                danger
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}