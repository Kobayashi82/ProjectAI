import { useStatus } from "../hooks/useStatus";
import MachineCard from "../components/MachineCard";

export default function Dashboard() {
	const { status, loading } = useStatus()

	const now = new Date()
	const timestamp = now.toLocaleString('es-ES', {
		timeZone: 'Europe/Madrid',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).replace(',', '')

	return (
		<div className="min-h-screen p-6 flex flex-col gap-6">
			{/* -- Header */}
			<header className="flex items-center justify-between border-b border-surface-border pb-4">
				<div>
					<div className="text-accent/40 text-xs tracking-[0.4em] uppercase mb-1">system</div>
					<h1 className="text-2xl font-bold tracking-[0.3em] uppercase glow">Dashboard<span className="text-accent/40"></span></h1>
				</div>
				<div className="text-right">
					<div className="text-xs text-accent/30 tracking-widest">{timestamp}</div>
					<div className="text-xs text-accent/20 tracking-widest mt-0.5">Project AI</div>
				</div>
			</header>

			{/* -- Machine cards */}
			<main className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
				<MachineCard
					id="pc"
					label="Padre"
					subtitle="windows // x86_64"
					online={status?.pc.online ?? false}
					statusLoading={loading}
					canWake
					canShutdown
					canReboot
					telemetry="pc"
				/>
				<MachineCard
					id="rpi"
					label="Raspberry"
					subtitle="linux // arm64"
					online={status?.rpi.online ?? false}
					statusLoading={loading}
					canShutdown
					canReboot
					telemetry="rpi"
				/>
				<MachineCard
					id="vps"
					label="VPS"
					subtitle="linux // x86_64"
					online={true}
					statusLoading={false}
					telemetry="vps"
				/>
			</main>

			{/* -- Footer */}
			<footer className="border-t border-surface-border pt-3 flex items-center justify-between">
				<span className="text-xs text-accent/20 tracking-widest">
					Kobayashi Corp. 2026
				</span>
				<span className="text-xs text-accent/20 tracking-widest">
					v1.0
				</span>
			</footer>
		</div>
	)
}