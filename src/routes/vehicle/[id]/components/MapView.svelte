<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  export let latitude = 12.9716;
  export let longitude = 77.5946;
  export let online = true;
  export let width = '600px';
  export let height = '400px';
  export let deviceId = '';
  export let WS_URL = import.meta.env.VITE_WS_URL;

  // Custom icons in static folder
  const greenCarIcon = '/green-car.png';
  const redCarIcon = '/red-car.png';

  let container;
  let map;
  let marker;
  let polyline;
  let L;
  let layers = {};
  let currentSpeed = 0;
  let currentHeading = 0;
  let mapType = 'streets';
  let isFullscreen = false;
  let socket;

  // Add smooth marker animation
  function initMarkerAnimation() {
    L.Marker.prototype.slideTo = function(latlng, options) {
      const start = this.getLatLng();
      const end = L.latLng(latlng);
      const duration = options?.duration || 1000;
      const keepAtCenter = options?.keepAtCenter || false;

      // Animate marker movement
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use easeInOutQuad easing function for smooth movement
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const lat = start.lat + (end.lat - start.lat) * easeProgress;
        const lng = start.lng + (end.lng - start.lng) * easeProgress;
        
        this.setLatLng([lat, lng]);

        if (keepAtCenter && map) {
          map.panTo([lat, lng], { 
            animate: false
          });
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
      return this;
    };
  }

  async function initializeMap() {
    if (!browser) return;

    const leafletModule = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
    await import('leaflet-rotatedmarker/leaflet.rotatedMarker.js');
    L = leafletModule.default;
    
    // Initialize marker animation
    initMarkerAnimation();

    // Initialize map
    map = L.map(container, { zoomControl: false }).setView([latitude, longitude], 15);

    // Tile layers
    layers = {
      streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri'
      }),
      hybrid: L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '© Google'
      })
    };
    layers[mapType].addTo(map);

    // Marker
    marker = L.marker([latitude, longitude], {
      icon: createIcon(online),
      rotationAngle: 0,
      rotationOrigin: 'center'
    }).addTo(map);

    // const popup = L.popup({ closeButton: false }).setContent(createPopupContent());
    // marker.bindPopup(popup).openPopup();

    // Polyline for trail
    polyline = L.polyline([[latitude, longitude]], { color: '#3B82F6', weight: 3, opacity: 0.8 }).addTo(map);

    connectWebSocket();
  }

  function createIcon(isOnline) {
    return L.icon({
      iconUrl: isOnline ? greenCarIcon : redCarIcon,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  // function createPopupContent() {
  //   return `
  //     <div class="font-semibold text-sm">
  //       <div>Speed: ${currentSpeed} km/h</div>
  //       <div>Heading: ${currentHeading}°</div>
  //       <div>Status: ${online ? '🟢 Online' : '🔴 Offline'}</div>
  //     </div>
  //   `;
  // }

  function updateVehicle({ latitude: lat, longitude: lng, heading, speed, online: status }) {
    if (!map || !marker) return;

    const oldPos = marker.getLatLng();
    const newPos = [lat, lng];
    
    // Update vehicle stats
    currentSpeed = speed || 0;
    currentHeading = heading || 0;
    online = status ?? true;

    // Smoothly animate the marker movement
    marker.slideTo(newPos, {
      duration: 1000,
      keepAtCenter: true
    });

    // Update marker properties
    marker.setRotationAngle(currentHeading);
    marker.setIcon(createIcon(online));

    // Update trail with fade effect
    polyline.addLatLng(newPos);
    const points = polyline.getLatLngs();
    if (points.length > 50) {
      // Keep last 50 points for performance
      polyline.setLatLngs(points.slice(points.length - 50));
    }

    // Calculate if we should auto-pan the map
    const bounds = map.getBounds();
    const isInView = bounds.contains(newPos);
    
    if (!isInView) {
      // If vehicle moves out of view, pan to new location
      map.panTo(newPos, {
        animate: true,
        duration: 1,
        easeLinearity: 0.5
      });
    }

    // Emit location update event for parent components
    container.dispatchEvent(new CustomEvent('locationUpdate', {
      detail: {
        latitude: lat,
        longitude: lng,
        heading: currentHeading,
        speed: currentSpeed,
        online
      }
    }));
  }

  function connectWebSocket() {
    if (!browser) return;
    socket = new WebSocket(WS_URL);

    socket.onopen = () => console.log(`[Leaflet] Connected to ${WS_URL}`);
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.deviceid === deviceId) updateVehicle(data);
      } catch (err) {
        console.error('[Leaflet] JSON parse error', err);
      }
    };
    socket.onclose = () => setTimeout(connectWebSocket, 3000);
    socket.onerror = (err) => console.error('[Leaflet] WebSocket error', err);
  }

  function changeMapType(type) {
    if (!map || !layers[type]) return;
    Object.values(layers).forEach(layer => map.removeLayer(layer));
    layers[type].addTo(map);
    mapType = type;
  }

  function toggleFullscreen() {
    if (!browser) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      isFullscreen = true;
    } else {
      document.exitFullscreen();
      isFullscreen = false;
    }
    setTimeout(() => map.invalidateSize(), 100);
  }

  onMount(() => initializeMap());
  onDestroy(() => { if (socket) socket.close(); if (map) map.remove(); });
</script>

<div bind:this={container} class="relative rounded-lg shadow-lg overflow-hidden" style="width:{width}; height:{height};">
  <div class="leaflet-map-container absolute inset-0">
    <!-- Map will be rendered here -->
  </div>

  <!-- Controls container with higher z-index -->
  <div class="absolute inset-0 pointer-events-none">
    <!-- Map type buttons -->
    <div class="absolute top-3 left-3 z-[1000] flex gap-2 bg-white rounded shadow pointer-events-auto">
      <button 
        class="px-2 py-1 rounded text-sm transition-colors duration-200 ease-in-out" 
        class:bg-blue-500={mapType==='streets'} 
        class:text-white={mapType==='streets'} 
        class:hover:bg-gray-100={mapType!=='streets'}
        on:click={()=>changeMapType('streets')}
      >
        Streets
      </button>
      <button 
        class="px-2 py-1 rounded text-sm transition-colors duration-200 ease-in-out" 
        class:bg-blue-500={mapType==='satellite'} 
        class:text-white={mapType==='satellite'}
        class:hover:bg-gray-100={mapType!=='satellite'}
        on:click={()=>changeMapType('satellite')}
      >
        Satellite
      </button>
      <button 
        class="px-2 py-1 rounded text-sm transition-colors duration-200 ease-in-out" 
        class:bg-blue-500={mapType==='hybrid'} 
        class:text-white={mapType==='hybrid'}
        class:hover:bg-gray-100={mapType!=='hybrid'}
        on:click={()=>changeMapType('hybrid')}
      >
        Hybrid
      </button>
    </div>

    <!-- Vehicle info panel -->
    <div class="absolute left-3 bottom-3 z-[1000] bg-white p-3 rounded shadow text-sm pointer-events-auto">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-gray-600">Speed:</span>
          <span class="font-medium">{currentSpeed} km/h</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-600">Heading:</span>
          <span class="font-medium">{currentHeading}°</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-600">Status:</span>
          <span class="font-medium flex items-center gap-1">
            <span class={online ? "text-green-600" : "text-red-600"}>●</span>
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>

    <!-- Right controls container -->
    <div class="absolute right-3 top-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
      <!-- Fullscreen button -->
      <button 
        on:click={toggleFullscreen} 
        class="w-8 h-8 bg-white rounded shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d={isFullscreen 
              ? "M9 9h6v6H9z" 
              : "M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-5 14h4m-4 0v-4m0 0l5 5m5-5v4m0 0h-4m0 0l-5-5"}
          />
        </svg>
      </button>

      <!-- Zoom buttons -->
      <div class="flex flex-col gap-1 bg-white rounded shadow">
        <button 
          class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors border-b border-gray-100" 
          on:click={()=>map?.zoomIn()}
          title="Zoom In"
        >
          +
        </button>
        <button 
          class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors" 
          on:click={()=>map?.zoomOut()}
          title="Zoom Out"
        >
          −
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.leaflet-container) {
    width: 100%;
    height: 100%;
    border-radius: 0.5rem;
  }

  /* Hide default Leaflet controls */
  :global(.leaflet-control-container) {
    display: none;
  }

  /* Ensure our controls are always on top */
  :global(.leaflet-pane) {
    z-index: 400 !important;
  }

  :global(.leaflet-map-pane) {
    z-index: 400 !important;
  }

  button {
    font-family: system-ui, -apple-system, sans-serif;
    user-select: none;
  }

  /* Custom styles for map controls */
  :global(.map-control) {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  :global(.map-button) {
    transition: all 0.2s ease-in-out;
    cursor: pointer;
  }

  :global(.map-button:hover) {
    background-color: #f3f4f6;
  }

  :global(.leaflet-container) {
    width: 100%;
    height: 100%;
    border-radius: 0.5rem;
  }
</style>
