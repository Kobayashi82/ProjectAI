import { useEffect, useState } from "react";
import { useStatus } from "../hooks/useStatus";
import MachineCard from "../components/MachineCard";

function DashboardClock() {
	const [timestamp, setTimestamp] = useState({ date: '', time: '' })

	useEffect(() => {
		const updateTime = () => {
			const now = new Date()
			const date = now.toLocaleDateString('es-ES', {
				timeZone: 'Europe/Madrid',
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			})
			const time = now.toLocaleTimeString('es-ES', {
				timeZone: 'Europe/Madrid',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false,
			})
			setTimestamp({ date, time })
		}

		updateTime()
		const intervalId = setInterval(updateTime, 1000)
		return () => clearInterval(intervalId)
	}, [])

	return (
		<div className="text-right space-y-1 text-xs">
			<div className="text-accent/40 tracking-widest font-sans font-semibold">{timestamp.date}</div>
			<div className="text-accent/40 tracking-widest font-sans font-semibold">{timestamp.time}</div>
		</div>
	)
}

export default function Dashboard() {
	const { status, loading } = useStatus()
	const [allExpanded, setAllExpanded] = useState(false)

	const handleDashboardToggle = () => {
		setAllExpanded(!allExpanded)
	}

	return (
		<div className="min-h-screen p-8 flex flex-col gap-8 bg-[#101010] bg-gradient-to-b from-[#101010] via-[#141414] to-[#101010]">
			{/* -- Header */}
			<header className="mb-4">
				<div className="flex items-start justify-between gap-4">
					<button
						type="button"
						onClick={handleDashboardToggle}
						className="text-3xl md:text-4xl font-black tracking-tighter uppercase glow bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent/60 hover:text-accent/80 transition-colors select-none text-left"
						aria-label="Toggle all sections"
					>
						Dashboard
					</button>
					<DashboardClock />
				</div>
				<div className="h-px bg-gradient-to-r from-accent/20 via-accent/10 to-transparent mt-6" />
			</header>

			{/* -- Main Content */}
			<main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<MachineCard
					id="pc"
					label="PADRE"
					subtitle="windows // x86_64"
					online={status?.pc.online ?? false}
					statusLoading={loading}
					canWake
					canShutdown
					canReboot
					telemetry="pc"
					globalToggle={allExpanded}
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
					globalToggle={allExpanded}
				/>
				<MachineCard
					id="vps"
					label="VPS"
					subtitle="linux // x86_64"
					online={true}
					statusLoading={false}
					telemetry="vps"
					globalToggle={allExpanded}
				/>
			</main>

			{/* -- Footer */}
			<footer className="border-t border-surface-border/50 pt-6 flex items-center justify-between mt-auto">
				<div className="space-y-1">
					<span className="text-xs text-accent/40 tracking-widest font-sans block">
						Kobayashi Corp. 2026
					</span>
				</div>
				<div className="text-right text-xs text-accent/30 font-sans tracking-wider">
					Project AI • v1.0
				</div>
			</footer>
		</div>
	)
}