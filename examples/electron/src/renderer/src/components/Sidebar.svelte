<script>
  let key
  let connecting
  let connected = false

    function connect() {
        connecting = true
        window.electron.ipcRenderer.send('connect', key)
    }

    window.electron.ipcRenderer.on('connected', () => {
        console.log('connected')
        connecting = false
        connected = true
    })
</script>

<style>
.sidebar {
    width: 350px;
    padding: 20px;
    height: 100vh;
    background-color: #eee;
}

.key-input {
    width: 100%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 2px;
    margin-bottom: 2px;
}

.help {
    margin-top: 2px;
    font-size: 0.7em;
}

.button {
    width: 100%;
    margin-top: 1px;
    background-color: rgb(7, 121, 150);
    padding: 5px;
    border: 1px solid rgb(7, 121, 150);
    color: white;
    border-radius: 2px;
}
</style>

<div class="sidebar">
    <h1>Localtiles tileset key:</h1>
    <form on:submit|preventDefault={connect}>
        <input type="text" class="key-input" bind:value={key} />

        {#if connected}
            <p>Connected!</p>
        {:else}
        <button type="submit" class="button">
                {#if connecting}
                    Connecting...
                {:else}
                    Connect
                {/if}
        </button>
        {/if}
    </form>

    {#if !connected}
    <p class="help">First-time connections can take a moment.</p>
    {/if}
</div>
