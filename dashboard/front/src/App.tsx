import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.js'
import ServiceFrame from './pages/ServiceFrame.js'

// -- Service URLs - in production these are subdomains proxied by Caddy
// -- In dev, swap these for localhost ports if needed
const SERVICES = {
    // Usamos la variable inyectada por Vite
    ssh_pc: `https://${import.meta.env.VITE_GUACAMOLE_DOMAIN}/#/client/ssh-pc`,
    ssh_rpi: `https://${import.meta.env.VITE_GUACAMOLE_DOMAIN}/#/client/ssh-rpi`,
    rdp: `https://${import.meta.env.VITE_GUACAMOLE_DOMAIN}/#/client/pc-rdp`,
    vnc: `https://${import.meta.env.VITE_GUACAMOLE_DOMAIN}/#/client/pc-vnc`,
    openwebui: `https://${import.meta.env.VITE_OPENWEBUI_DOMAIN}`,
    comfyui: `https://${import.meta.env.VITE_COMFYUI_DOMAIN}`,
}

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Dashboard />} />
			<Route path="/ssh/pc" element={<ServiceFrame url={SERVICES.ssh_pc} title="SSH // PC" />} />
			<Route path="/ssh/rpi" element={<ServiceFrame url={SERVICES.ssh_rpi} title="SSH // RPi" />} />
			<Route path="/rdp" element={<ServiceFrame url={SERVICES.rdp} title="RDP // PC" />} />
			<Route path="/vnc" element={<ServiceFrame url={SERVICES.vnc} title="VNC // PC" />} />
			<Route path="/openwebui" element={<ServiceFrame url={SERVICES.openwebui} title="Open WebUI" />} />
			<Route
				path="/comfyui"
				element={<ServiceFrame url={SERVICES.comfyui} title="ComfyUI" waitForService />}
			/>
		</Routes>
	)
}
