const required = (key: string): string => {
	const value = process.env[key]
	if (!value) throw new Error(`Missing required env variable: ${key}`)
	return value
}

const optional = (key: string, fallback: string): string => {
	return process.env[key] ?? fallback
}

export const config = {
	NODE_ENV: optional('NODE_ENV', 'development'),
	PORT: parseInt(optional('PORT', '4000')),

	// -- WireGuard tunnel IPs
	PC_IP: required('PC_IP'),
	RPI_IP: required('RPI_IP'),

	// -- SSH config
	SSH_USER_PC: required('SSH_USER_PC'),
	SSH_USER_RPI: required('SSH_USER_RPI'),
	SSH_KEY_PATH: '/app/privatekey',

	// -- Telemetry agent ports running on each machine
	PERFORMANCE_PC_PORT: parseInt(optional('TELEMETRY_PC_PORT', '8000')),
	PERFORMANCE_RPI_PORT: parseInt(optional('TELEMETRY_RPI_PORT', '8000')),
}
