import { Fragment, useState, useEffect } from 'react'
import StatusBadge from './StatusBadge'
import ActionButton from './ActionButton'
import MachineIcon from './MachineIcon'
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
    globalToggle?: boolean
}

interface GuacConnection {
    label: string
    type: string
    machine: string
    url: string
}

interface LinkItem {
    label: string
    url: string
}

type ConfirmAction = 'shutdown' | 'reboot' | null

type TelemetryTile = {
    id: string
    label: string
    percent: number
    detail?: string
    temp?: string
}

const getTelemetryTone = (percent: number) => {
    if (percent >= 85) {
        return {
            bg: 'bg-offline/8',
            value: 'text-offline/40',
        }
    }

    if (percent >= 60) {
        return {
            bg: 'bg-warning/8',
            value: 'text-warning/40',
        }
    }

    return {
        bg: 'bg-online/8',
        value: 'text-online/40',
    }
}

const TelemetryTileCard = ({ label, percent, detail, temp }: TelemetryTile) => {
    const tone = getTelemetryTone(percent)

    return (
        <div
            className={`inline-flex min-w-0 flex-col rounded-lg ${tone.bg} px-2 py-1.5 select-none`}
        >
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-300/60 select-none">
                {label}
            </span>
            <div className="mt-0.5 flex min-w-0 items-end gap-1 leading-none text-left select-none">
                <span className={`text-[12px] font-black ${tone.value} select-none`}>
                    {Math.round(percent)}%
                </span>
            </div>
            {detail && (
                <span className="mt-0.5 truncate text-[8px] font-medium text-accent/35 select-none">
                    {detail}
                </span>
            )}
            {temp && (
                <span className="mt-0.5 truncate text-[8px] font-medium text-accent/35 select-none">
                    {temp}
                </span>
            )}
        </div>
    )
}

const buildTelemetryTiles = (tel: NonNullable<ReturnType<typeof useTelemetry>['data']>): TelemetryTile[] => {
    const tiles: TelemetryTile[] = [
        {
            id: 'cpu',
            label: 'CPU',
            percent: tel.sistema.cpu_uso_porcentaje,
            temp: tel.sistema.temperatura_cpu,
        },
        {
            id: 'ram',
            label: 'RAM',
            percent: tel.sistema.ram.porcentaje,
        },
    ]

    tel.gpus?.forEach((gpu, index) => {
        const gpuPercent = Number.parseFloat(gpu.uso)
        const vramPercent = (Number.parseFloat(gpu.vram_uso) / Number.parseFloat(gpu.vram_total)) * 100
        const suffix = tel.gpus && tel.gpus.length > 1 ? ` ${index + 1}` : ''

        tiles.push(
            {
                id: `gpu-${index}`,
                label: `GPU${suffix}`,
                percent: gpuPercent,
                temp: gpu.temp,
            },
            {
                id: `vram-${index}`,
                label: `VRAM${suffix}`,
                percent: vramPercent,
            },
        )
    })

    Object.entries(tel.discos).forEach(([mount, disk]) => {
        tiles.push({
            id: `disk-${mount}`,
            label: mount,
            percent: Number.parseFloat(disk.porcentaje),
        })
    })

    return tiles
}

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

// ─── Enlaces estáticos por máquina y categoría ──────────────────────────────
const FILE_LINKS_BY_MACHINE: Record<string, LinkItem[]> = {
    pc: [{ label: 'Files', url: toHttpsUrl(import.meta.env.VITE_FILEBROWSER_PC_DOMAIN, 'VITE_FILEBROWSER_PC_DOMAIN') }],
    rpi: [{ label: 'Files', url: toHttpsUrl(import.meta.env.VITE_FILEBROWSER_RPI_DOMAIN, 'VITE_FILEBROWSER_RPI_DOMAIN') }],
    vps: [{ label: 'Files', url: toHttpsUrl(import.meta.env.VITE_FILEBROWSER_VPS_DOMAIN, 'VITE_FILEBROWSER_VPS_DOMAIN') }],
}

const DEVELOPMENT_LINKS_BY_MACHINE: Record<string, LinkItem[]> = {
    pc: [
		{ label: 'VSCode', url: toHttpsUrl(import.meta.env.VITE_VSCODE_PC_DOMAIN, 'VITE_VSCODE_PC_DOMAIN') },
	],
}

const MULTIMEDIA_LINKS_BY_MACHINE: Record<string, LinkItem[]> = {
    pc: [
        { label: 'Navidrome', url: toHttpsUrl(import.meta.env.VITE_NAVIDROME_PC_DOMAIN, 'VITE_NAVIDROME_PC_DOMAIN') },
        { label: 'Jellyfin', url: toHttpsUrl(import.meta.env.VITE_JELLYFIN_PC_DOMAIN, 'VITE_JELLYFIN_PC_DOMAIN') },
        { label: 'Torrent', url: toHttpsUrl(import.meta.env.VITE_TORRENT_PC_DOMAIN, 'VITE_TORRENT_PC_DOMAIN') },
    ],
    rpi: [{ label: 'Torrent', url: toHttpsUrl(import.meta.env.VITE_TORRENT_RPI_DOMAIN, 'VITE_TORRENT_RPI_DOMAIN') }],
	vps: [
		{ label: 'Letterboxd', url: 'https://letterboxd.com/kobayashi82/diary' },
	    { label: 'Navidrome', url: toHttpsUrl(import.meta.env.VITE_NAVIDROME_DOMAIN, 'VITE_NAVIDROME_DOMAIN') },
	    { label: 'Kavita', url: toHttpsUrl(import.meta.env.VITE_KAVITA_DOMAIN, 'VITE_KAVITA_DOMAIN') },
	],
}

const WEB_LINKS_BY_MACHINE: Record<string, LinkItem[]> = {
    vps: [
        { label: 'SearXNG', url: toHttpsUrl(import.meta.env.VITE_SEARXNG_DOMAIN, 'VITE_SEARXNG_DOMAIN') },
		{ label: 'GitHub', url: 'https://github.com/Kobayashi82' },
		{ label: '42 Intra', url: 'https://profile.intra.42.fr' },
    ],
}

const GAMING_LINKS_BY_MACHINE: Record<string, LinkItem[]> = {
    pc: [
        { label: 'Sunshine', url: toHttpsUrl(import.meta.env.VITE_SUNSHINE_PC_DOMAIN, 'VITE_SUNSHINE_PC_DOMAIN') },
        { label: 'Moonlight', url: toHttpsUrl(import.meta.env.VITE_MOONLIGHT_PC_DOMAIN, 'VITE_MOONLIGHT_PC_DOMAIN') },
    ],
	vps: [
		{ label: 'Backloggd', url: 'https://backloggd.com/u/Kobayashi82/games' },
		{ label: 'RomM', url: toHttpsUrl(import.meta.env.VITE_ROMM_DOMAIN, 'VITE_ROMM_DOMAIN') },
	],
}

const AI_LINKS_BY_MACHINE: Record<string, LinkItem[]> = {
    pc: [
        { label: 'ACE Step', url: toHttpsUrl(import.meta.env.VITE_ACESTEP_DOMAIN, 'VITE_ACESTEP_DOMAIN') },
        { label: 'ComfyUI', url: toHttpsUrl(import.meta.env.VITE_COMFYUI_DOMAIN, 'VITE_COMFYUI_DOMAIN') },
        { label: 'Open WebUI', url: toHttpsUrl(import.meta.env.VITE_OPENWEBUI_DOMAIN, 'VITE_OPENWEBUI_DOMAIN') },
    ],
}

const MONITOR_LINKS_BY_MACHINE: Record<string, LinkItem[]> = {
    vps: [
		{ label: 'Portainer', url: toHttpsUrl(import.meta.env.VITE_PORTAINER_DOMAIN, 'VITE_PORTAINER_DOMAIN') },
		{ label: 'Uptime Kuma', url: toHttpsUrl(import.meta.env.VITE_UPTIME_KUMA_DOMAIN, 'VITE_UPTIME_KUMA_DOMAIN') },
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
    globalToggle,
}: MachineCardProps) {
    const [confirmAction, setConfirmAction]   = useState<ConfirmAction>(null)
    const [showCommands, setShowCommands]     = useState(false)
    const [showPower, setShowPower]           = useState(false)
    const [showAccess, setShowAccess]         = useState(false)
    const [showDevelopment, setShowDevelopment] = useState(false)
    const [showMultimedia, setShowMultimedia] = useState(false)
    const [showWeb, setShowWeb]               = useState(false)
    const [showGaming, setShowGaming]         = useState(false)
    const [showAi, setShowAi]                 = useState(false)
    const [showMonitor, setShowMonitor]       = useState(false)
    const [commands, setCommands]             = useState<string[]>([])
    const [cmdLoading, setCmdLoading]         = useState(false)
    const [executingCmd, setExecutingCmd]     = useState<string | null>(null)
    const [accessLinks, setAccessLinks]       = useState<GuacConnection[]>([])

    const wake     = useAction(`/api/${id}/wake`)
    const shutdown = useAction(`/api/${id}/shutdown`)
    const reboot   = useAction(`/api/${id}/reboot`)

    const { data: tel } = useTelemetry(telemetry as 'pc' | 'rpi', !!telemetry && online)

    const accessLinkByType = (type: string) => accessLinks.find((connection) => connection.type.toLowerCase() === type)
    const telemetryTiles = telemetry && online && tel ? buildTelemetryTiles(tel) : []

    const accessSectionLinks = [
        ...(FILE_LINKS_BY_MACHINE[id] ?? []),
        ...(accessLinkByType('ssh') ? [{ label: 'SSH', url: accessLinkByType('ssh')!.url }] : []),
        ...(accessLinkByType('vnc') ? [{ label: 'VNC', url: accessLinkByType('vnc')!.url }] : []),
        ...(accessLinkByType('rdp') ? [{ label: 'RDP', url: accessLinkByType('rdp')!.url }] : []),
    ]
    const developmentLinks = DEVELOPMENT_LINKS_BY_MACHINE[id] ?? []
    const multimediaLinks = MULTIMEDIA_LINKS_BY_MACHINE[id] ?? []
    const webLinks = WEB_LINKS_BY_MACHINE[id] ?? []
    const gamingLinks = GAMING_LINKS_BY_MACHINE[id] ?? []
    const aiLinks = AI_LINKS_BY_MACHINE[id] ?? []
    const monitorLinks = MONITOR_LINKS_BY_MACHINE[id] ?? []

    const sections = [
        {
            key: 'access',
            title: 'Access',
            icon: '🗝️',
            open: showAccess,
            setOpen: setShowAccess,
            links: accessSectionLinks,
            buttonClass: 'btn-service-access',
        },
        {
            key: 'development',
            title: 'Development',
            icon: '🛠️',
            open: showDevelopment,
            setOpen: setShowDevelopment,
            links: developmentLinks,
            buttonClass: 'btn-service-development',
        },
        {
            key: 'web',
            title: 'Web',
            icon: '🌐',
            open: showWeb,
            setOpen: setShowWeb,
            links: webLinks,
            buttonClass: 'btn-service-development',
        },
        {
            key: 'multimedia',
            title: 'Multimedia',
            icon: '🎬',
            open: showMultimedia,
            setOpen: setShowMultimedia,
            links: multimediaLinks,
            buttonClass: 'btn-service-services',
        },
        {
            key: 'gaming',
            title: 'Gaming',
            icon: '🎮',
            open: showGaming,
            setOpen: setShowGaming,
            links: gamingLinks,
            buttonClass: 'btn-service-gaming',
        },
        {
            key: 'ai',
            title: 'AI',
            icon: '✨',
            open: showAi,
            setOpen: setShowAi,
            links: aiLinks,
            buttonClass: 'btn-service-ai',
        },
        {
            key: 'monitor',
            title: 'Monitor',
            icon: '📈',
            open: showMonitor,
            setOpen: setShowMonitor,
            links: monitorLinks,
            buttonClass: 'btn-service-monitor',
        },
    ]

    // ─── Cargar conexiones Guacamole ──────────────────────────────────────────
    useEffect(() => {
        fetchGuacConnections()
            .then(all => setAccessLinks(all.filter(c => c.machine === id)))
            .catch(err => console.error('Error fetching Guacamole connections', err))
    }, [id])

    // ─── Responder a cambios en globalToggle ───────────────────────────────────
    useEffect(() => {
        if (globalToggle !== undefined) {
            setShowPower(globalToggle)
            setShowAccess(globalToggle)
            setShowDevelopment(globalToggle)
            setShowMultimedia(globalToggle)
            setShowWeb(globalToggle)
            setShowMonitor(globalToggle)
            setShowGaming(globalToggle)
            setShowAi(globalToggle)
            if (globalToggle && id === 'pc' && online && commands.length === 0) {
                fetchCommands()
            }
            setShowCommands(globalToggle)
        }
    }, [globalToggle])

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

    const toggleAllSections = () => {
        const hasPower = Boolean(canWake || canShutdown || canReboot)
        const hasCommands = id === 'pc' && online

        const allExpanded =
            (!hasPower || showPower) &&
            sections.every((section) => section.links.length === 0 || section.open) &&
            (!hasCommands || showCommands)

        const nextState = !allExpanded

        if (hasPower) setShowPower(nextState)
        sections.forEach((section) => {
            if (section.links.length > 0) section.setOpen(nextState)
        })
        if (hasCommands) {
            if (nextState && commands.length === 0) fetchCommands()
            setShowCommands(nextState)
        }
    }

    return (
        <div className={`machine-card group flex flex-col gap-4 ${online ? 'machine-card-online' : 'machine-card-offline'}`}>
            {/* <div
                className="h-28 w-full rounded-xl overflow-hidden border border-surface-border/50 bg-cover bg-center"
                style={{ backgroundImage: `url(${coverImage})` }}
            /> */}
            {/* Header con Icono */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-start pl-0.5">
                    <StatusBadge online={online} loading={statusLoading} />
                </div>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300 scale-90 -mr-3">
                        <MachineIcon machine={id as 'pc' | 'rpi' | 'vps'} size="md" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
                        <div className="text-[10px] text-accent/35 tracking-[0.18em] uppercase font-semibold mb-0.5 select-none">{subtitle}</div>
                        <button
                            type="button"
                            onClick={toggleAllSections}
							className="flex-none text-left text-[1.45rem] font-black tracking-wider uppercase truncate text-accent/70 hover:text-accent/90 transition-colors select-none touch-manipulation"
                            aria-label={`Toggle all sections for ${label}`}
                        >
                            {label}
                        </button>
                    </div>
                </div>
            </div>

            {telemetryTiles.length > 0 && (
                <div className="-mt-4 flex flex-wrap items-start gap-1">
                    {telemetryTiles.map((tile) => (
                        <TelemetryTileCard key={tile.id} {...tile} />
                    ))}
                </div>
            )}

            {/* Power Controls */}
            {(canWake || canShutdown || canReboot) && (
                <>
                    <div className="border-t border-surface-border/50" />
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setShowPower(!showPower)}
                            className="w-full text-sm font-semibold text-accent/70 tracking-widest uppercase mb-3 flex items-center gap-2 transition-colors duration-200"
                        >
                            <span className="text-accent text-lg">⚡</span>
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

            {sections.map((section) => section.links.length > 0 && (
                <Fragment key={section.key}>
                    <div className="border-t border-surface-border/50" />
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => section.setOpen(!section.open)}
                            className="w-full text-sm font-semibold text-accent/70 tracking-widest uppercase mb-3 flex items-center gap-2 transition-colors duration-200"
                        >
                            <span className="text-accent text-lg">{section.icon}</span>
                            <span>{section.title}</span>
                        </button>
                        {section.open && (
                            <div className="flex flex-wrap gap-2">
                                {section.links.map((link) => (
                                    <ServiceButton
                                        key={link.url}
                                        label={link.label}
                                        url={link.url}
                                        disabled={!online}
                                        className={section.buttonClass}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </Fragment>
            ))}

            {/* Remote Commands */}
			{id === 'pc' && online && (
				<>
					<div className="border-t border-surface-border/50" />
                    <div className="pt-2">
						<div className="flex items-center justify-between mb-3">
							<button
								type="button"
								onClick={toggleCommands}
                            className="w-full text-sm font-semibold text-accent/70 tracking-widest uppercase flex items-center gap-2 transition-colors duration-200"
							>
								<span className="text-accent text-lg">📲</span>
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
                                            disabled={executingCmd === cmd}
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
                        <p className="text-xs text-accent/50 font-sans leading-relaxed">
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