interface StatusBadgeProps {
	online: boolean
	loading?: boolean
}

export default function StatusBadge({ online, loading }: StatusBadgeProps) {
	if (loading) {
		return (
			<span className="inline-flex items-center select-none" aria-label="probing">
				<span className="w-2 h-2 rounded-full bg-yellow-500/60 animate-pulse-slow motion-reduce:animate-none" />
			</span>
		)
	}

	return (
		<span className="inline-flex items-center select-none" aria-label={online ? 'online' : 'offline'}>
			<span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500/70 animate-pulse-slow motion-reduce:animate-none shadow-glow' : 'bg-red-800'}`} />
		</span>
	)
}
