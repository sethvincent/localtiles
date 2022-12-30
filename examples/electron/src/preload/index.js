import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

const api = {
	tile: async (options) => {
		console.log('preload tile')
		return ipcRenderer.invoke('tile', options)
	},
	tilejson: async (options) => {
		return ipcRenderer.invoke('tilejson', options)
	}
}

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', electronAPI)
		contextBridge.exposeInMainWorld('api', api)
	} catch (error) {
		console.error(error)
	}
} else {
	window.electron = electronAPI
	window.api = api
}
