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
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				blink: 'blink 1s step-end infinite',
				'scan': 'scan 4s linear infinite',
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
			},
		},
	},
	plugins: [],
}
