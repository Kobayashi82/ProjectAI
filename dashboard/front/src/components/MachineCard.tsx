import { useState, useEffect } from 'react'
import StatusBadge from './StatusBadge'
import ActionButton from './ActionButton'
import MachineIcon from './MachineIcon'
import MetricItem from './MetricItem'
import padreCover from '../assets/hero-padre.svg'
import rpiCover from '../assets/hero-rpi.svg'
import vpsCover from '../assets/hero-vps.svg'
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

const COVER_BY_ID: Record<string, string> = {
    pc: padreCover,
    rpi: rpiCover,
    vps: vpsCover,
}

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
            style={{ width: `${Math.min(value, 100)}%`, opacity: 0.4 }}
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

const ServiceButton = ({
    label,
    url,
    disabled,
    className = '',
}: {
    label: string
    url: string
    disabled: boolean
    className?: string
}) => (
    <button
        type="button"
        onClick={(event) => {
            event.currentTarget.blur()
            window.open(url, '_blank', 'noopener,noreferrer')
        }}
        disabled={disabled}
        className={`btn-service disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
    >
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
    pc:  [{ label: 'Files',     url: toHttpsUrl(import.meta.env.VITE_FILEBROWSER_PC_DOMAIN, 'VITE_FILEBROWSER_PC_DOMAIN') },
		{ label: 'Jellyfin',   url: toHttpsUrl(import.meta.env.VITE_JELLYFIN_PC_DOMAIN, 'VITE_JELLYFIN_PC_DOMAIN') },
        { label: 'Torrent',   url: toHttpsUrl(import.meta.env.VITE_TORRENT_PC_DOMAIN, 'VITE_TORRENT_PC_DOMAIN') }],
    rpi: [{ label: 'Files',     url: toHttpsUrl(import.meta.env.VITE_FILEBROWSER_RPI_DOMAIN, 'VITE_FILEBROWSER_RPI_DOMAIN') },
        { label: 'Torrent',   url: toHttpsUrl(import.meta.env.VITE_TORRENT_RPI_DOMAIN, 'VITE_TORRENT_RPI_DOMAIN') }],
    vps: [{ label: 'Files',     url: toHttpsUrl(import.meta.env.VITE_FILEBROWSER_VPS_DOMAIN, 'VITE_FILEBROWSER_VPS_DOMAIN') },
        { label: 'Portainer', url: toHttpsUrl(import.meta.env.VITE_PORTAINER_DOMAIN, 'VITE_PORTAINER_DOMAIN') }],
}

const AI_LINKS: Record<string, { label: string; url: string }[]> = {
    pc: [
		{ label: 'Ace Step',   url: toHttpsUrl(import.meta.env.VITE_ACESTEP_DOMAIN, 'VITE_ACESTEP_DOMAIN') },
        { label: 'ComfyUI',    url: toHttpsUrl(import.meta.env.VITE_COMFYUI_DOMAIN, 'VITE_COMFYUI_DOMAIN') },
        { label: 'Open WebUI', url: toHttpsUrl(import.meta.env.VITE_OPENWEBUI_DOMAIN, 'VITE_OPENWEBUI_DOMAIN') },
        // {
        //     label: 'OpenClaw',
        //     url: toHttpsUrl(
        //         import.meta.env.VITE_OPENCLAW_DOMAIN,
        //         'VITE_OPENCLAW_DOMAIN',
        //         `/#token=${requiredEnv(import.meta.env.VITE_OPENCLAW_TOKEN, 'VITE_OPENCLAW_TOKEN')}`,
        //     ),
        // },
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
    const [showTelemetry, setShowTelemetry]   = useState(false)
    const [showPower, setShowPower]           = useState(false)
    const [showAccess, setShowAccess]         = useState(false)
    const [showServices, setShowServices]     = useState(false)
    const [showAi, setShowAi]                 = useState(false)
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
    const coverImage   = COVER_BY_ID[id] ?? padreCover

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
        <div className="machine-card group flex flex-col gap-4">
            {/* <div
                className="h-28 w-full rounded-xl overflow-hidden border border-surface-border/50 bg-cover bg-center"
                style={{ backgroundImage: `url(${coverImage})` }}
            /> */}
            {/* Header con Icono */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Machine Icon */}
                    <div className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300 scale-90 -mr-2 -translate-y-2">
                        <MachineIcon machine={id as 'pc' | 'rpi' | 'vps'} size="md" />
                    </div>
                    {/* Title and Subtitle */}
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-accent/40 tracking-widest uppercase font-semibold mb-1">{subtitle}</div>
                        {/* <h2 className="text-xl font-black tracking-wider uppercase glow truncate">{label}</h2> */}
						<h2 className="text-xl font-black tracking-wider uppercase truncate">{label}</h2>
                    </div>
                </div>
                {/* Status Badge */}
                <div className="flex-shrink-0">
                    <StatusBadge online={online} loading={statusLoading} />
                </div>
            </div>

            {/* Power Controls */}
            {(canWake || canShutdown || canReboot) && (
                <>
                    <div className="border-t border-surface-border/50" />
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowPower(!showPower)}
                            className="w-full text-xs font-bold text-accent/50 tracking-widest uppercase mb-3 flex items-center gap-2 hover:text-accent/70 transition-colors"
                        >
                            <span className="text-accent text-base">⚡</span>
                            <span>Power</span>
                            {/* <span className="text-[10px] opacity-50">{showPower ? '▼' : '▶'}</span> */}
                        </button>
                        {showPower && (
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
                        )}
                    </div>
                </>
            )}

            {/* Access (Guacamole) */}
            {accessLinks.length > 0 && (
                <>
                    <div className="border-t border-surface-border/50" />
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowAccess(!showAccess)}
                            className="w-full text-xs font-bold text-accent/50 tracking-widest uppercase mb-3 flex items-center gap-2 hover:text-accent/70 transition-colors"
                        >
                            <span className="text-accent text-base">🗝️</span>
                            <span>Access</span>
                            {/* <span className="text-[10px] opacity-50">{showAccess ? '▼' : '▶'}</span> */}
                        </button>
                        {showAccess && (
                            <div className="flex flex-wrap gap-2">
                                {accessLinks.map(c => (
                                    <ServiceButton key={c.url} label={c.type} url={c.url} disabled={!online} className="btn-service-services" />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Services */}
            {serviceLinks.length > 0 && (
                <>
                    <div className="border-t border-surface-border/50" />
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowServices(!showServices)}
                            className="w-full text-xs font-bold text-accent/50 tracking-widest uppercase mb-3 flex items-center gap-2 hover:text-accent/70 transition-colors"
                        >
                            <span className="text-accent text-base">✨</span>
                            <span>Services</span>
                            {/* <span className="text-[10px] opacity-50">{showServices ? '▼' : '▶'}</span> */}
                        </button>
                        {showServices && (
                            <div className="flex flex-wrap gap-2">
                                {serviceLinks.map(svc => (
                                    <ServiceButton key={svc.url} label={svc.label} url={svc.url} disabled={!online} className="btn-service-ai" />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* AI */}
            {aiLinks.length > 0 && (
                <>
                    <div className="border-t border-surface-border/50" />
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowAi(!showAi)}
                            className="w-full text-xs font-bold text-accent/50 tracking-widest uppercase mb-3 flex items-center gap-2 hover:text-accent/70 transition-colors"
                        >
                            <span className="text-accent text-base">🪄</span>
                            <span>AI</span>
                            {/* <span className="text-[10px] opacity-50">{showAi ? '▼' : '▶'}</span> */}
                        </button>
                        {showAi && (
                            <div className="flex flex-wrap gap-2">
                                {aiLinks.map(svc => (
                                    <ServiceButton key={svc.url} label={svc.label} url={svc.url} disabled={!online} className="btn-service-access" />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Remote Commands */}
			{id === 'pc' && online && (
				<>
					<div className="border-t border-surface-border/50" />
					<div>
						<div className="flex items-center justify-between mb-3">
							<button
								type="button"
								onClick={toggleCommands}
								className="w-full text-xs font-bold text-accent/50 tracking-widest uppercase hover:text-accent/70 flex items-center gap-2 transition-colors"
							>
								<span className="text-accent text-base">📲</span>
								<span>Commands</span>
								{/* <span className="text-[10px] opacity-50">{showCommands ? '▼' : '▶'}</span> */}
							</button>
							{showCommands && (
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
							)}
						</div>
                        {showCommands && (
                            <div className="cmd-grid animate-fade-in-up">
                                {commands.map(cmd => (
                                    <div
                                        key={cmd}
                                        className="cmd-item group"
                                    >
                                        <span className="cmd-name">{cmd}</span>
                                        <button
                                            onClick={() => handleExecute(cmd)}
                                            disabled={executingCmd !== null}
                                            className="cmd-run disabled:opacity-40"
                                            aria-label={`Run ${cmd}`}
                                        >
                                            {executingCmd === cmd ? (
                                                <span className="text-[9px] tracking-wider">...</span>
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
                {/* Telemetry - Enhanced */}
                {telemetry && online && tel && (
                    <>
                        <div className="border-t border-surface-border/50" />
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowTelemetry(!showTelemetry)}
                                className="w-full text-xs font-bold text-accent/50 tracking-widest uppercase mb-4 flex items-center gap-2 hover:text-accent/70 transition-colors"
                            >
                                <span className="text-accent text-base">📡</span>
                                <span>Telemetry</span>
                                {/* <span className="text-[10px] opacity-50">{showTelemetry ? '▼' : '▶'}</span> */}
                            </button>
                            {showTelemetry && (
                                <div className="space-y-5">
                                    {/* CPU Metrics */}
                                    <MetricItem
                                        label="CPU"
                                        value={tel.sistema.cpu_uso_porcentaje}
                                        unit="%"
                                        temp={tel.sistema.temperatura_cpu}
                                    />

                                    {/* RAM Metrics */}
                                    <MetricItem
                                        label="Memory"
                                        value={tel.sistema.ram.usado_gb}
                                        max={tel.sistema.ram.total_gb}
                                        displayText={`${tel.sistema.ram.usado_gb.toFixed(1)} GB / ${tel.sistema.ram.total_gb.toFixed(1)} GB`}
                                    />

                                    {/* GPU Metrics */}
                                    {tel.gpus?.map((gpu, i) => {
                                        const vramPercent = (parseFloat(gpu.vram_uso) / parseFloat(gpu.vram_total)) * 100
                                        return (
                                            <div key={i} className="space-y-3">
                                                <MetricItem
                                                    label={`GPU ${tel.gpus!.length > 1 ? i + 1 : ''}`}
                                                    value={parseFloat(gpu.uso)}
                                                    unit="%"
                                                    temp={gpu.temp}
                                                />

                                                <MetricItem
                                                    label="VRAM"
                                                    value={vramPercent}
                                                    displayText={`${gpu.vram_uso} / ${gpu.vram_total}`}
                                                />
                                            </div>
                                        )
                                    })}

                                    {/* Storage Metrics */}
                                    {Object.entries(tel.discos).map(([mount, disk]) => (
                                        <MetricItem
                                            key={mount}
                                            label={mount}
                                            value={parseFloat(disk.porcentaje)}
                                            unit="%"
                                            displayText={`${disk.usado} / ${disk.total}`}
                                        />
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