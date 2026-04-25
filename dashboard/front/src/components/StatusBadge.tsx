interface StatusBadgeProps {
	online: boolean
	loading?: boolean
}

export default function StatusBadge({ online, loading }: StatusBadgeProps) {
	if (loading) {
		return (
			<span className="flex items-center gap-2 text-xs text-accent/40 tracking-widest uppercase">
				<span className="w-1.5 h-1.5 rounded-full bg-accent/30 animate-pulse-slow" />
				probing...
			</span>
		)
	}

	return (
		<span className={`flex items-center gap-2 text-xs tracking-widest uppercase ${online ? 'text-online' : 'text-offline'}`}>
			{/* -- Pulsing dot for online state, static for offline */}
			<span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-online animate-pulse-slow' : 'bg-offline'}`} />
			{online ? 'online' : 'offline'}
		</span>
	)
}
