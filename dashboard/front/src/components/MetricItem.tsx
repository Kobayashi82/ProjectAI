interface MetricItemProps {
	label: string
	value: number
	max?: number
	unit?: string
	temp?: string
	displayText?: string
	color?: 'success' | 'warning' | 'danger'
}

const getColor = (percent: number): 'success' | 'warning' | 'danger' => {
	if (percent >= 85) return 'danger'
	if (percent >= 60) return 'warning'
	return 'success'
}

const colorMap = {
	success: {
		bg: 'bg-emerald-500/20',
		bar: 'bg-emerald-300/60',
		text: 'text-emerald-300/60',
		border: 'border-emerald-400/30',
	},
	warning: {
		bg: 'bg-amber-500/20',
		bar: 'bg-amber-300/60',
		text: 'text-amber-300/60',
		border: 'border-amber-400/30',
	},
	danger: {
		bg: 'bg-red-500/20',
		bar: 'bg-red-300/60',
		text: 'text-red-300/60',
		border: 'border-red-400/30',
	},
}

export default function MetricItem({
	label,
	value,
	max = 100,
	unit = '%',
	temp,
	displayText,
	color: overrideColor,
}: MetricItemProps) {
	const percent = Math.min((value / max) * 100, 100)
	const colorScheme = colorMap[overrideColor || getColor(percent)]
	const displayValue = displayText ?? `${percent.toFixed(0)}${unit}`

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<span className="text-xs text-accent/60 font-medium uppercase tracking-wide">{label}</span>
				<div className="flex items-center gap-2">
					<span className={`text-sm font-sans font-semibold ${colorScheme.text}`}>
						{displayValue}
					</span>
					{temp && (
						<span className="text-[10px] text-accent/30 font-sans">
							&nbsp; {temp}
						</span>
					)}
				</div>
			</div>
			{/* Animated progress bar */}
			<div className={`h-2 rounded-full overflow-hidden ${colorScheme.bg} border ${colorScheme.border}`}>
				<div
					className={`h-full ${colorScheme.bar} transition-[width] duration-500 rounded-full motion-reduce:transition-none`}
					style={{
						width: `${percent}%`,
						willChange: 'width',
					}}
				/>
			</div>
		</div>
	)
}
