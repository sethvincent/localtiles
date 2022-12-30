import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import Hyperswarm from 'hyperswarm'
import * as path from 'path'

import Corestore from 'corestore'
import { Localtiles } from '../../../../index.js'

async function createWindow () {
	const mainWindow = new BrowserWindow({
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === 'linux'
			? {
				icon: path.join(__dirname, '../../build/icon.png')
			}
			: {}),
		webPreferences: {
			preload: path.join(__dirname, '../preload/index.js'),
			sandbox: false
		}
	})

	const corestore = new Corestore('./data-client')
	const tiles = new Localtiles({
		corestore
	})

	// TODO: support multiple tilesets
	let tileset = null
	let connected = false
	ipcMain.on('connect', async (event, key) => {
		console.log('connect', key)
		tileset = await tiles.tileset({
			// TODO: some way of getting the filepath from remote tileset, maybe with hyperdrive.entry
			filepath: '/bike-facilities.pmtiles',
			name: 'bike-facilities',
			type: 'pmtiles',
			key: Buffer.from(key, 'hex')
		})

		await tileset.ready()
		console.log('ready')

		const swarm = new Hyperswarm()

		swarm.on('connection', async (socket) => {
			console.log('connection')
			corestore.replicate(socket)
			mainWindow.webContents.send('connected')
		})

		if (!connected) {
			console.log('connecting')
			const foundPeers = corestore.findingPeers()
			swarm.join(tileset.discoveryKey)
			swarm.flush().then(() => foundPeers())
			console.log('huh')
			connected = true
		}
	})

	ipcMain.handle('tile', async (event, options) => {
		if (!tileset) return
		console.log('main tile')
		const { z, x, y } = options
		const tile = await tileset.tile({ z, x, y })
		return tile
	})

	ipcMain.handle('tilejson', async (event, options) => {
		const { name } = options

		const tilejson = await tileset.tilejson()
		return tilejson
	})

	mainWindow.on('ready-to-show', () => {
		mainWindow.show()
	})

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
	} else {
		mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
	}
}

app.whenReady().then(async () => {
	electronApp.setAppUserModelId('com.electron')

	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	createWindow()

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', () => {
	app.quit()
})
