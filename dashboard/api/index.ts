import Fastify from 'fastify'
import { config } from './config.js'
import { pcRoutes } from './routes/pc.js'
import { rpiRoutes } from './routes/rpi.js'
import { statusRoutes } from './routes/status.js'
import { telemetryRoutes } from './routes/telemetry.js'
import { remoteRoutes } from './routes/remote.js'
import { vpsRoutes } from './routes/vps.js'
import guacamoleRoutes from './routes/guacamole.js'
import { authHook } from './hooks/auth.js'

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err)
    // No re-throw, el proceso sigue vivo
})

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason)
})

const app = Fastify({
	logger: {
		transport: {
			target: 'pino-pretty',
			options: { colorize: true },
		},
	},
})

// Remote-User header injected by Authelia/Caddy
if (config.NODE_ENV === 'production') {
	app.addHook('onRequest', authHook)
}

// -- Routes
app.register(pcRoutes, { prefix: '/api/pc' })
app.register(rpiRoutes, { prefix: '/api/rpi' })
app.register(statusRoutes, { prefix: '/api' })
app.register(telemetryRoutes, { prefix: '/api/telemetry' })
app.register(vpsRoutes, { prefix: '/api/telemetry' })
app.register(guacamoleRoutes, { prefix: '/api' })
app.register(remoteRoutes, { prefix: '/api/remote' })
app.get('/health', async () => ({ status: 'ok' }))

// -- Start
try {
	await app.listen({ port: config.PORT, host: '0.0.0.0' })
} catch (err) {
	app.log.error(err)
	process.exit(1)
}
