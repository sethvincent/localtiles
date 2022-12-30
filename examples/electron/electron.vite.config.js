import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

/**
 * @type {import('electron-vite').UserConfig}
 */
export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()]
	},
	preload: {
		plugins: [externalizeDepsPlugin({
			// include: ['sodium', 'sodium-native', 'sodium-universal', 'node-gyp-build']
		})]
	},
	renderer: {
		plugins: [svelte()]
	}
})
