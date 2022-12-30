# Localtiles

> 🗺️ Local-first tools for map tiles.

## 👷‍♂️ Caution: this is an experiment

🥔 There is no guarantee at all that this will work for you yet.

## About

Localtiles is built with [Hyperdrive](https://github.com/holepunchto/hyperdrive-next) and [PMTiles](https://github.com/protomaps/PMTiles/) to provide a way to share map tiles without a server.

### Goals of the project:

- **Offline-first** - An internet connection should not be needed once tiles are first downloaded (and there should be support for offline-friendly ways of sharing files).
- **Collaborative** - Users should be able to create tilesets together (this one is very aspirational).
- **Fast** - Using tiles from the local file system should be faster than using a web-based tiler.
- **Lightweight** - Storage usage should be as minimal as possible. Only download tiles as they are needed and use storage formats that are as compact as possible.

### Non-goals:

- **Web** - For now the focus is on creating a nodejs library that can be used in cli tools, desktop apps, and mobile apps. It may be possible to put effort into web support in the future, but that's not a priority. It's easy enough to take a PMTiles file stored in Localtiles and place it in an object storage service like s3. Tada! Web support.
- **mbtiles** - [Convert mbtiles into pmtiles!](https://github.com/protomaps/PMTiles#creating-pmtiles)

## Usage

See the [nodejs](examples/nodejs/index.js) and [electron](examples/electron/) examples.

Beware: the electron example in particular is only a quick and dirty prototype.

These two examples work together to show:

- creating a Localtiles tileset with a nodejs script
- announcing that tileset with [Hyperswarm](https://github.com/holepunchto/hyperswarm)
- finding that tileset with Hyperswarm in an electron app
- rendering tiles that are fetched from the tileset being shared by the nodejs script

These examples could be run on the same computer or from different parts of the world. No servers required. It's peer to peer!

### Try it out

- clone this repo and cd into it
- run `npm i` to install dependencies for the library
- run `node examples/nodejs/index.js` to create a Localtiles tileset
- open a new terminal window and `cd examples/electron`
- run `npm i` to install dependencies for the desktop app
- run `npm run dev` to start the desktop app
- copy the key that was printed by the nodejs example
- paste the key into the input in the desktop app
- there may be a delay in the first connection that's being made over hyperswarm
- after a moment tiles should appear!
- in a real app these tiles would then be available offline any time. for now this is just a demo.

## License

[Apache-2.0](LICENSE.md)
