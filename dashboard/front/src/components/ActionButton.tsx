interface ActionButtonProps {
	label: string
	onClick: () => void
	loading?: boolean
	danger?: boolean
	disabled?: boolean
}

export default function ActionButton({ label, onClick, loading, danger, disabled }: ActionButtonProps) {
	return (
		<button
			onClick={onClick}
			disabled={disabled || loading}
			className={`${danger ? 'btn-action-danger' : 'btn-action'} disabled:opacity-50 disabled:cursor-not-allowed`}
		>
			{loading ? (
				// -- Show animated dots while waiting for response
				<span className="flex items-center gap-1">
					<span className="animate-blink">●</span>
					<span className="animate-blink [animation-delay:0.2s]">●</span>
					<span className="animate-blink [animation-delay:0.4s]">●</span>
				</span>
			) : (
				label
			)}
		</button>
	)
}
