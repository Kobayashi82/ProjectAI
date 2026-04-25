import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// -- Caddy handles all routing in both dev and production.
// -- Vite only serves the React app, API calls never go directly from browser to Fastify.
export default defineConfig({
	plugins: [react()],
	server: {
		host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['kobayashi82.net']
	},
})
