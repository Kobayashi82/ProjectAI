import { useState, useEffect } from 'react'

interface ServiceFrameProps {
	url: string
	title: string
	// -- If true, polls /api/services/comfyui before showing the iframe
	waitForService?: boolean
}

const POLL_INTERVAL_MS = 3_000

export default function ServiceFrame({ url, title, waitForService }: ServiceFrameProps) {
	const [ready, setReady] = useState(!waitForService)
	const [dots, setDots] = useState('')

	useEffect(() => {
		if (!waitForService) return

		let cancelled = false

		// -- Animate the waiting dots independently from the polling
		const dotsInterval = setInterval(() => {
			if (!cancelled) setDots((d) => (d.length >= 3 ? '' : d + '.'))
		}, 400)

		// -- Poll the API until ComfyUI is reachable
		const poll = async () => {
			try {
				const res = await fetch('/api/services/comfyui')
				const data = await res.json()
				if (data.online && !cancelled) {
					setReady(true)
					clearInterval(dotsInterval)
				}
			} catch {
				// -- Keep polling on error
			}
		}

		poll()
		const pollInterval = setInterval(poll, POLL_INTERVAL_MS)

		return () => {
			cancelled = true
			clearInterval(dotsInterval)
			clearInterval(pollInterval)
		}
	}, [waitForService])

	if (!ready) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-6">
				<div className="text-xs text-accent/30 tracking-[0.4em] uppercase">initializing</div>
				<div className="text-2xl font-bold tracking-widest uppercase glow">
					{title}
				</div>
				<div className="flex flex-col items-center gap-3">
					{/* -- Progress bar animation */}
					<div className="w-48 h-px bg-surface-border overflow-hidden">
						<div className="h-full bg-accent animate-[scan_2s_linear_infinite] w-12" />
					</div>
					<div className="text-xs text-accent/40 tracking-widest">
						waiting for service{dots}
					</div>
				</div>
				<div className="text-xs text-accent/20 tracking-widest mt-4">
					polling every {POLL_INTERVAL_MS / 1000}s
				</div>
			</div>
		)
	}

	return (
		<iframe
			src={url}
			title={title}
			className="w-full h-screen border-0"
			allow="fullscreen"
		/>
	)
}
