<script>
  import { onMount, onDestroy } from 'svelte';
  import { Map, addProtocol } from 'maplibre-gl';

  let map
  let mapElement

  function parseUrl (url) {
		const {pathname} = new URL(url)
		const [name, z, x, y] = pathname.replace('//', "").split('/').map((value) => {
      if (Number.isInteger(parseInt(value))) {
        return parseInt(value)
      }

      return value
    })

		return { name, z, x, y }
	}

  onMount(async () => {
    addProtocol('localtiles', async (params, callback) => {
      const options = parseUrl(params.url)
      const tile = await window.api.tile(options)
      console.log('map tile', tile)

      if (!tile) {
        // pmtiles maplibre protocol passes an empty tile when the tile is not found when the tiletype is mvt
        callback(new Error('no tile found'), null, null, null)
        return { cancel: () => {} }
      } else {
        callback(null, tile?.data, null, null)
        return { cancel: () => {} }
      }
    })

    map = new Map({
      container: mapElement,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [-122.9007, 47.0379],
      zoom: 8
    })

    window.electron.ipcRenderer.on('connected', () => {
        console.log('map connected')
        map.redraw()
        map.addSource('bike-facilities', {
            type: 'vector',
            tiles: ['localtiles://bike-facilities/{z}/{x}/{y}'],
            minzoom: 0,
            maxzoom: 22
        })

        map.addLayer({
          id: 'bike-facilities',
          type: 'line',
          source: 'bike-facilities',
          'source-layer': 'bikefacilities',
          paint: {
            'line-color': '#CC3A8E',
            'line-width': 1,
            'line-opacity': 0.75
          }
        })
      })

    map.on('load', () => {})

    map.on('click', (e) => {
      const point = e.point
      var width = 10;
      var height = 10;
      var features = map.queryRenderedFeatures([
      [point.x - width / 2, point.y - height / 2],
      [point.x + width / 2, point.y + height / 2]
      ], { layers: ['bike-facilities'] });
      console.log('features', features)
    })
  })

  onDestroy(() => {
    map.remove()
  })
</script>

<style>
  .map {
    width: 100%;
    height: 100%;
  }

  .map-container {
    width: 100%;
    height: 100%;
  }
</style>

<div class="map-container">
  <div class="map" bind:this={mapElement}></div>
</div>
