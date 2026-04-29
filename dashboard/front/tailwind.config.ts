/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				// -- Terminal green accent
				accent: {
					DEFAULT: '#00ff9d',
					dim: '#00cc7a',
					muted: '#00ff9d22',
				},
				// -- Background layers
				surface: {
					base: '#0a0e0f',
					card: '#0f1419',
					border: '#1a2332',
					hover: '#141c26',
				},
				// -- Status colors
				online: '#00ff9d',
				offline: '#ff3b5c',
				warning: '#ffb800',
			},
			fontFamily: {
				mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
			},
			boxShadow: {
				glow: '0 0 20px rgba(0, 255, 157, 0.3), 0 0 40px rgba(0, 255, 157, 0.1)',
				'glow-lg': '0 0 30px rgba(0, 255, 157, 0.4), 0 0 60px rgba(0, 255, 157, 0.2)',
				'glow-red': '0 0 20px rgba(255, 59, 92, 0.3)',
				'glow-yellow': '0 0 20px rgba(255, 184, 0, 0.3)',
			},
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				blink: 'blink 1s step-end infinite',
				'scan': 'scan 4s linear infinite',
				'fade-in': 'fade-in 0.3s ease-in-out',
				'slide-up': 'slide-up 0.4s ease-out',
			},
			keyframes: {
				blink: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' },
				},
				scan: {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100vh)' },
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 255, 157, 0.3)' },
					'50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(0, 255, 157, 0.5)' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
			},
		},
	},
	plugins: [],
}

