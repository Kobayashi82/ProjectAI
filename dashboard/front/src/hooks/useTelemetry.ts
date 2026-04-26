import { useState, useEffect } from 'react'

// -- Raw shape returned by the telemetry agents
export interface TelemetryData {
	sistema: {
		ip_local: string
		cpu_uso_porcentaje: number
		ram: {
			total_gb: number
			usado_gb: number
			porcentaje: number
		}
		temperatura_cpu?: string
	}
	gpus?: Array<{
		nombre: string
		uso: string
		vram_total: string
		vram_uso: string
		vram_libre: string
		temp: string
	}>
	gpu?: {
		nombre: string
		memoria_total_mb: number
		memoria_asignada_mb: number
	}
	discos: Record<string, {
		total: string
		usado: string
		libre: string
		porcentaje: string
	}>
}

interface UseTelemetryResult {
	data: TelemetryData | null
	loading: boolean
}

const POLL_INTERVAL_MS = 3_000

export function useTelemetry(machine: 'pc' | 'rpi' | 'vps', enabled: boolean): UseTelemetryResult {
	const [data, setData] = useState<TelemetryData | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// -- Don't poll if machine is offline
		if (!enabled) {
			setData(null)
			setLoading(false)
			return
		}

		let cancelled = false

		const fetchTelemetry = async () => {
			try {
				const res = await fetch(`/api/telemetry/${machine}`)
				if (!res.ok) return
				const json = await res.json()
				if (!cancelled && json.online) setData(json.data)
			} catch {
				// -- Silently ignore, data stays stale
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		fetchTelemetry()
		const interval = setInterval(fetchTelemetry, POLL_INTERVAL_MS)

		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [machine, enabled])

	return { data, loading }
}