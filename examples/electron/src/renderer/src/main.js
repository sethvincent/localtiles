import './assets/style.css'
import App from './App.svelte'

import { pointToTile } from '@mapbox/tilebelt'

const olympia = pointToTile(-122.8, 47, 10)

// const tile = await window.api.tile({
//   tile: olympia
// })

const app = new App({
	target: document.getElementById('app')
})

export default app
