interface MachineIconProps {
	machine: 'pc' | 'rpi' | 'vps'
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

const sizes = {
	sm: 'w-8 h-8',
	md: 'w-16 h-16',
	lg: 'w-24 h-24',
}

export default function MachineIcon({ machine, size = 'md', className = '' }: MachineIconProps) {
	const baseClass = sizes[size]

	if (machine === 'pc') {
		return (
			<svg className={`${baseClass} ${className}`} viewBox="0 0 200 160" fill="none">
				<defs>
					<linearGradient id="pc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#00ff9d" stopOpacity="0.3" />
						<stop offset="100%" stopColor="#00cc7a" stopOpacity="0.5" />
					</linearGradient>
				</defs>
				{/* Monitor */}
				<rect x="20" y="20" width="160" height="100" rx="8" fill="url(#pc-grad)" stroke="#00ff9d" strokeWidth="2" />
				<rect x="25" y="25" width="150" height="85" fill="#0a0e0f" rx="6" />
				{/* Screen content */}
				<circle cx="100" cy="55" r="12" fill="#00ff9d" opacity="0.6" />
				<rect x="80" y="75" width="40" height="4" fill="#00ff9d" opacity="0.4" rx="2" />
				<rect x="70" y="82" width="60" height="3" fill="#00ff9d" opacity="0.3" rx="1" />
				{/* Stand */}
				<rect x="85" y="130" width="30" height="20" fill="#00ff9d" opacity="0.4" rx="2" />
				<rect x="75" y="148" width="50" height="4" fill="#00ff9d" opacity="0.5" />
			</svg>
		)
	}

	if (machine === 'rpi') {
		return (
			<svg className={`${baseClass} ${className}`} viewBox="0 0 200 200" fill="none">
				<defs>
					<linearGradient id="rpi-grad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
						<stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.5" />
					</linearGradient>
				</defs>
				{/* Board */}
				<rect x="30" y="30" width="140" height="140" rx="8" fill="url(#rpi-grad)" stroke="#38bdf8" strokeWidth="2" />
				{/* Chips/components */}
				<rect x="50" y="50" width="35" height="35" fill="#38bdf8" opacity="0.3" rx="4" />
				<rect x="115" y="50" width="35" height="35" fill="#38bdf8" opacity="0.3" rx="4" />
				<rect x="50" y="115" width="100" height="25" fill="#38bdf8" opacity="0.2" rx="3" />
				{/* Ports */}
				<circle cx="100" cy="100" r="15" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
				<circle cx="100" cy="100" r="8" fill="#38bdf8" opacity="0.2" />
			</svg>
		)
	}

	if (machine === 'vps') {
		return (
			<svg className={`${baseClass} ${className}`} viewBox="0 0 200 200" fill="none">
				<defs>
					<linearGradient id="vps-grad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#4c9aff" stopOpacity="0.3" />
						<stop offset="100%" stopColor="#1971c2" stopOpacity="0.5" />
					</linearGradient>
				</defs>
				{/* Server rack */}
				<rect x="40" y="30" width="120" height="140" rx="6" fill="url(#vps-grad)" stroke="#4c9aff" strokeWidth="2" />
				{/* Rack units */}
				{[0, 1, 2].map((i) => (
					<g key={i}>
						<rect x="50" y={55 + i * 35} width="100" height="28" fill="#4c9aff" opacity="0.2" rx="3" />
						<circle cx="65" cy={70 + i * 35} r="4" fill="#4c9aff" opacity="0.5" />
						<circle cx="130" cy={70 + i * 35} r="4" fill="#4c9aff" opacity="0.5" />
					</g>
				))}
			</svg>
		)
	}

	return null
}
