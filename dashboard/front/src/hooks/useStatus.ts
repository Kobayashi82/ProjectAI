import { useState, useEffect, useRef } from 'react'

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

const POLL_INTERVAL_MS = 3_000
const ONLINE_CONFIRM = 1
const OFFLINE_CONFIRM_PC = 2 // require 2 consecutive failures to mark PC offline
const OFFLINE_CONFIRM_RPI = 1

export function useStatus(): UseStatusResult {
	const [status, setStatus] = useState<Status | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)

	const countsRef = useRef({ pc: 0, rpi: 0 })

	useEffect(() => {
		let cancelled = false
		let controller: AbortController | null = null

		const fetchStatus = async () => {
			try {
				controller?.abort()
				controller = new AbortController()
				const res = await fetch('/api/status', { signal: controller.signal, cache: 'no-store' })
				if (!res.ok) throw new Error('Bad response')
				const data: Status = await res.json()

				if (!cancelled) {
					setStatus((prevStatus) => {
						if (!prevStatus) return data

						let newStatus = { ...prevStatus }
						const counts = countsRef.current

						// PC: require multiple failures to mark offline
						if (prevStatus.pc.online !== data.pc.online) {
							if (data.pc.online) {
								counts.pc += 1
								if (counts.pc >= ONLINE_CONFIRM) {
									newStatus.pc.online = true
									counts.pc = 0
								}
							} else {
								counts.pc += 1
								if (counts.pc >= OFFLINE_CONFIRM_PC) {
									newStatus.pc.online = false
									counts.pc = 0
								}
							}
						} else {
							counts.pc = 0
						}

						// RPi: single confirmation (keep responsive)
						if (prevStatus.rpi.online !== data.rpi.online) {
							if (data.rpi.online) {
								counts.rpi += 1
								if (counts.rpi >= ONLINE_CONFIRM) {
									newStatus.rpi.online = true
									counts.rpi = 0
								}
							} else {
								counts.rpi += 1
								if (counts.rpi >= OFFLINE_CONFIRM_RPI) {
									newStatus.rpi.online = false
									counts.rpi = 0
								}
							}
						} else {
							counts.rpi = 0
						}

						return newStatus
					})

					setError(false)
				}
			} catch {
				if (!cancelled) {
					setError(true)
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		const handleFocus = () => {
			void fetchStatus()
		}

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				void fetchStatus()
			}
		}

		const interval = setInterval(() => {
			void fetchStatus()
		}, POLL_INTERVAL_MS)

		void fetchStatus()
		window.addEventListener('focus', handleFocus)
		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			cancelled = true
			controller?.abort()
			clearInterval(interval)
			window.removeEventListener('focus', handleFocus)
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [])

	return { status, loading, error }
}