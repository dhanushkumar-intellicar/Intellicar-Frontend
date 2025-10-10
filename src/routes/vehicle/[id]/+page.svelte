<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { dummyVehicle } from './dummyData.js';
  import VideoPreview from './components/VideoPreview.svelte';
  import MapView from './components/MapView.svelte';
  import RightPanel from './components/RightPanel.svelte';
  import DeviceOverview from './components/DeviceOverview.svelte';
  import DriverVehicleInfo from './components/DriverVehicleInfo.svelte';


  let vehicleData = {};
  $: id = $page.params.id;

  onMount(() => {
    vehicleData =
      id === 'VEH002'
        ? {
            ...dummyVehicle,
            deviceid: 'VEH002',
            online: false,
            latitude: 13.0827,
            longitude: 80.2707
          }
        : dummyVehicle;
  });
</script>

<!-- 🧭 Main Layout -->
<div class="min-h-screen bg-gray-100 flex flex-col overflow-hidden">
  <!-- Header -->
  <div class="flex items-center justify-between p-4 bg-white shadow-md">
    <h2 class="text-2xl font-semibold">
      Telematic: <span class="text-blue-600">{vehicleData.deviceid ?? 'Loading...'}</span>
    </h2>
    <button
      on:click={() => goto('/home')}
      class="px-3 py-2 bg-white border rounded shadow-sm hover:bg-red-50 transition"
    >
      ✕ Close
    </button>
  </div>

  <!-- Content Layout (3-column) -->
  <div class="flex flex-1 overflow-hidden p-4 gap-4">
    <!-- 🧱 Left Section (empty for now / future use) -->
    <div class="w-[600px] bg-white rounded-lg shadow-inner"></div>

    <!-- 🎥 Middle Section -->
    <div class="flex flex-col flex-shrink-0 items-center gap-4 overflow-hidden">
      <!-- Video -->
      <VideoPreview width="600px" height="340px" isLive={false} />

      <!-- Map -->
      <MapView
        latitude={vehicleData.latitude}
        longitude={vehicleData.longitude}
        online={vehicleData.online}
        width="600px"
        height="300px"
      />

      <!-- GPS + Alerts -->
      <div class="flex w-[600px] gap-3 flex-shrink-0">
        <div class="flex-1 bg-white rounded-lg shadow p-3 overflow-y-auto max-h-[220px]">
          <DeviceOverview {vehicleData} />
        </div>

        <div class="flex-1 bg-white rounded-lg shadow p-3 overflow-y-auto max-h-[220px]">
          <DriverVehicleInfo {vehicleData} />
        </div>
      </div>
    </div>

    <!-- 📋 Right Panel -->
    <div class="w-[600px] bg-white rounded-lg shadow-inner overflow-y-auto p-4">
      <RightPanel {vehicleData} />
    </div>
  </div>
</div>
