import { heroui } from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
	content: [
		'./layouts/**/*.{js,ts,jsx,tsx,mdx}',
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)"]
			},
			animation: {
				'scroll': 'scroll 20s linear infinite',
			},
			keyframes: {
				scroll: {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-50%)' },
				}
			}
		},
	},
	darkMode: "class",
	plugins: [heroui()],
}

export default config;