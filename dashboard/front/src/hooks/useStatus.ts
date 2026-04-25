import { useState, useEffect } from 'react'

interface MachineStatus {
	online: boolean
}

interface Status {
	pc: MachineStatus
	rpi: MachineStatus
}

interface UseStatusResult {
	status: Status | null
	loading: boolean
	error: boolean
}

const POLL_INTERVAL_MS = 1_000
// -- Number of consecutive failures before marking a machine as offline
const OFFLINE_THRESHOLD = 3

export function useStatus(): UseStatusResult {
	const [status, setStatus] = useState<Status | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)
	const [failCount, setFailCount] = useState(0)

	useEffect(() => {
		let cancelled = false

		const fetchStatus = async () => {
			try {
				const res = await fetch('/api/status')
				if (!res.ok) throw new Error('Bad response')
				const data: Status = await res.json()
				if (!cancelled) {
					setStatus(data)
					setError(false)
					setFailCount(0)
				}
			} catch {
				if (!cancelled) {
					setFailCount((prev) => {
						const next = prev + 1
						// -- Only mark as error after threshold consecutive failures
						if (next >= OFFLINE_THRESHOLD) setError(true)
						return next
					})
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		fetchStatus()
		const interval = setInterval(fetchStatus, POLL_INTERVAL_MS)

		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [])

	return { status, loading, error }
}