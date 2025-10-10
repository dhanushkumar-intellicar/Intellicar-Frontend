<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  // Props
  export let latitude = 12.9716;
  export let longitude = 77.5946;
  export let online = true;
  export let width = '600px';
  export let height = '300px';
  export let deviceId = ''; // 👈 identify which vehicle this map belongs to

  let container;
  let map;
  let marker;
  let isFullscreen = false;
  let socket;
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:11007'; // 👈 your real-time WebSocket backend

  // Initialize map when component mounts
  onMount(() => {
    if (!browser) return;

    // 🗺️ Create MapLibre map instance
    map = new maplibregl.Map({
      container,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [longitude, latitude],
      zoom: 15,
    });

    // 🎯 Custom marker (arrow for active, pin for inactive)
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = online
      ? `<div style="width:18px;height:18px;background:green;border-radius:50%;border:2px solid white;"></div>`
      : `<div style="width:18px;height:18px;background:red;border-radius:50%;border:2px solid white;"></div>`;
    el.style.cursor = 'pointer';

    marker = new maplibregl.Marker({ element: el })
      .setLngLat([longitude, latitude])
      .addTo(map);

    // 🌐 Connect to WebSocket (production tracking)
    connectWebSocket();
  });

  function connectWebSocket() {
    if (!browser) return;

    try {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => console.log(`[MapView] ✅ Connected to ${WS_URL}`);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Example format:
          // { deviceid: "VEH001", latitude: 12.9719, longitude: 77.5948, online: true }
          if (data.deviceid === deviceId && data.latitude && data.longitude) {
            updatePosition(data.latitude, data.longitude, data.online);
          }
        } catch (err) {
          console.error('[MapView] JSON parse error', err);
        }
      };

      socket.onclose = () => {
        console.warn('[MapView] 🔌 Connection closed. Reconnecting in 3s...');
        setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (err) => console.error('[MapView] ⚠️ WebSocket error', err);
    } catch (err) {
      console.error('[MapView] ❌ Failed to connect', err);
    }
  }

  // 🧭 Smooth marker + map movement
  function updatePosition(lat, lon, isOnline) {
    if (!map || !marker) return;

    // Update marker color dynamically
    const color = isOnline ? 'green' : 'red';
    marker.getElement().innerHTML = `<div style="width:18px;height:18px;background:${color};border-radius:50%;border:2px solid white;"></div>`;

    // Smooth pan
    map.easeTo({
      center: [lon, lat],
      duration: 1000,
      essential: true,
    });

    // Move marker
    marker.setLngLat([lon, lat]);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      isFullscreen = true;
    } else {
      document.exitFullscreen();
      isFullscreen = false;
    }
  }

  onDestroy(() => {
    if (map) map.remove();
    if (socket) socket.close();
  });
</script>

<!-- 🌍 Map container -->
<div
  bind:this={container}
  class="relative rounded-lg shadow-lg overflow-hidden transition-all duration-500 ease-in-out"
  style="width:{width}; height:{height};"
>
  <button
    on:click={toggleFullscreen}
    class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 z-50 transition"
    title={isFullscreen ? 'Exit Fullscreen' : 'Full Preview'}
  >
    [ ]
  </button>
</div>

<style>
  :global(.maplibregl-canvas) {
    border-radius: 0.5rem;
  }
  :global(.maplibregl-control-container) {
    display: none;
  }
</style>
