import Corestore from 'corestore'
import * as dirname from 'desm'
import Hyperswarm from 'hyperswarm'

import { Localtiles } from '../../index.js'

const filepath = dirname.join(import.meta.url, '../../tests/fixtures/bike-facilities.pmtiles')

const corestore = new Corestore('./data')
const tiles = new Localtiles({
	corestore
})

const tileset = await tiles.tileset({
	name: 'bike-facilities',
	type: 'pmtiles',
	filepath
})

await tileset.ready()

const swarm = new Hyperswarm()

swarm.on('connection', (socket) => {
	console.log('connection')
	corestore.replicate(socket)
})

const discovery = swarm.join(tileset.discoveryKey)
await discovery.flushed()

console.log('key', tileset.key.toString('hex'))

// console.log('db info', (await tileset.hyperdrive.core.info()))
// console.log('blobs info', (await tileset.hyperdrive.blobs.feed.info()))
//     for await (const entry of tileset.hyperdrive.list()) {
//       console.log('entry', entry)
//     }

// const olympia = pointToTile(-122.4194, 47.6167, 8)
// const [x, y, z] = olympia
// const tile = await tileset.tile({z, x, y})
// console.log('tile', tile)
