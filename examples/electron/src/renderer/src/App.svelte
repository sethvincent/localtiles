<script>
  import Sidebar from './components/Sidebar.svelte'
  import Map from './components/Map.svelte'
</script>

<style>
  .container {
    display: flex;
    flex-direction: row;
    height: 100vh;
  }
</style>

<div class="container">
  <Sidebar />
  <Map />
</div>
