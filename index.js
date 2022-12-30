import Hyperdrive from 'hyperdrive'
import Localdrive from 'localdrive'
import * as path from 'path'
import * as pm from 'pmtiles'
import toArraybuffer from 'to-arraybuffer'

// something about the difference between vite and node makes this wacky
if (pm.default) {
	var { PMTiles } = pm.default
} else {
	var { PMTiles } = pm
}

export class Localtiles {
	#tilesets = new Map()

	constructor (options) {
		this.corestore = options.corestore
		this.hyperdrive = options.hyperdrive
		this.prefix = options.prefix || '/tiles/'
	}

	tilesets () {
		return [...this.#tilesets.values()]
	}

	async tileset (options = {}) {
		if (this.#tilesets.has(options.name)) {
			return this.#tilesets.get(options.name)
		}

		const tileset = await Tileset.create({
			name: options.name,
			type: options.type,
			key: options.key,
			filepath: options.filepath,
			corestore: this.corestore.namespace(options.name)
		})

		this.#tilesets.set(options.name, tileset)
		return tileset
	}

	async destroy (tilesetName) {
		this.#tilesets.delete(tilesetName)
	}

	replicate (isInitiator, options) {
		return this.corestore.replicate(isInitiator, options)
	}
}

export class Tileset {
	constructor (options) {
		this.name = options.name
		this.type = options.type || 'pmtiles'
		this.filepath = options.filepath
		if (this.filepath) {
			this.directory = path.dirname(this.filepath)
			this.filename = path.basename(this.filepath)
		}
		this.key = options.key
		this.corestore = options.corestore
		this.hyperdrive = new Hyperdrive(this.corestore, options.key)
	}

	async ready () {
		await this.hyperdrive.ready()
		this.key = this.hyperdrive.key
		this.discoveryKey = this.hyperdrive.discoveryKey
	}

	static async create (options) {
		const tileset = new Tileset(options)

		if (!options.key) {
			await tileset.import({
				type: 'pmtiles',
				filepath: tileset.directory
			})
		}

		if (options.type === 'pmtiles') {
			tileset.pmtiles = new PMTiles(
				new HyperdrivePmtilesSource({
					key: tileset.filename,
					hyperdrive: tileset.hyperdrive
				})
			)
		}

		return tileset
	}

	/**
	 * @param {Object} options
	 * @param {String} options.type - type of source: only `pmtiles` or `files` accepted
	 * @param {String} options.filepath - path to either pmtiles file or directory of tiles
	 */
	async import ({ type = 'pmtiles', filepath }) {
		if (type === 'pmtiles') {
			const drive = new Localdrive(filepath)
			const mirror = drive.mirror(this.hyperdrive, {
				filter: (key) => {
					return key === `/${this.filename}`
				}
			})

			await mirror.done()
		} else {
			throw new Error(`Invalid source type: ${type} (only 'pmtiles' accepted)`)
		}
	}

	async tile ({ z, x, y }) {
		return this.pmtiles.getZxy(z, x, y)
	}
}

export class HyperdrivePmtilesSource {
	constructor ({ key, hyperdrive }) {
		this.key = key
		this.hyperdrive = hyperdrive
	}

	getKey () {
		return this.key
	}

	async getBytes (start, length) {
		const stream = this.hyperdrive.createReadStream(this.key, { start, length })

		return new Promise((resolve, reject) => {
			const chunks = []
			stream.on('data', (chunk) => {
				chunks.push(chunk)
			})
			stream.on('error', reject)
			stream.on('end', () => {
				const buf = Buffer.concat(chunks)
				const data = toArraybuffer(buf)
				resolve({ data })
			})
		})
	}
}
