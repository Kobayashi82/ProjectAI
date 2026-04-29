interface StatusBadgeProps {
	online: boolean
	loading?: boolean
}

export default function StatusBadge({ online, loading }: StatusBadgeProps) {
	if (loading) {
		return (
			<span className="flex items-center gap-2 text-xs text-accent/50 tracking-widest uppercase font-semibold">
				<span className="w-2 h-2 rounded-full bg-accent/40 animate-pulse-slow" />
				probing...
			</span>
		)
	}

	return (
		<span className={`flex items-center gap-2 text-xs tracking-widest uppercase font-bold ${online ? 'text-emerald-400' : 'text-red-400'}`}>
			{/* -- Pulsing dot for online state, static for offline */}
			<span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-400 animate-pulse-slow shadow-glow' : 'bg-red-400'}`} />
			{online ? 'Online' : 'Offline'}
		</span>
	)
}
