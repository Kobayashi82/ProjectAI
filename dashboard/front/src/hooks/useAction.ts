import { useState } from 'react'

interface UseActionResult {
	execute: () => Promise<void>
	loading: boolean
	error: string | null
}

// -- Generic hook for one-shot API actions (wake, shutdown, reboot, etc.)
// -- Manages loading and error state so components stay clean
export function useAction(endpoint: string): UseActionResult {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const execute = async () => {
		setLoading(true)
		setError(null)

		try {
			const res = await fetch(endpoint, { method: 'POST' })
			if (!res.ok) {
				const body = await res.json().catch(() => ({}))
				throw new Error(body.error ?? 'Command failed')
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error')
		} finally {
			setLoading(false)
		}
	}

	return { execute, loading, error }
}
