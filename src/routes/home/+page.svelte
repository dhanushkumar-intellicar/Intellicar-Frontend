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
  import Hamburger from './components/Hamburger.svelte';
  import LeftPanel from './components/LeftPanel.svelte';

  let vehicleData = {};
  let isHamburgerOpen = false;

  // Example list of vehicles
  let vehicles = {
    VEH001: 'active',
    VEH002: 'inactive',
    VEH003: 'active',
  };

  $: id = $page.params.id;

  onMount(() => {
    if (id && vehicles[id]) {
      vehicleData = {
        ...dummyVehicle,
        deviceid: id,
        online: vehicles[id] === 'active',
        latitude: 13.0827,
        longitude: 80.2707
      };
    } else {
      vehicleData = dummyVehicle;
    }
  });

  function handleVehicleSelect(selectedId) {
  if (vehicles[selectedId]) {
    vehicleData = {
      ...dummyVehicle,
      deviceid: selectedId,
      online: vehicles[selectedId] === 'active',
      latitude: 13.0827,
      longitude: 80.2707
    };
  }
  isHamburgerOpen = false; // auto-close sidebar
}

</script>

<!-- 🧭 Main Layout -->
<div class="h-screen bg-gray-100 flex flex-col overflow-hidden relative">
  <!-- Header -->
  <div class="flex items-center justify-between p-4 bg-white shadow-md">
    <div class="flex items-center gap-3">
      <!-- ☰ Hamburger button -->
      <button
        on:click={() => (isHamburgerOpen = !isHamburgerOpen)}
        class="text-2xl px-2 text-gray-700 hover:text-blue-600"
      >
        ☰
      </button>

      <h2 class="text-2xl font-semibold">
        Telematic:
        <span class="text-blue-600">{vehicleData.deviceid ?? 'Select Camera'}</span>
      </h2>
    </div>
  </div>

  <!-- Content Layout (3-column) -->
  <div class="flex flex-1 overflow-hidden p-4 gap-4">
    <!-- 🧭 Hamburger Sidebar -->
    <Hamburger
      {vehicles}
      bind:isOpen={isHamburgerOpen}
      on:close={() => (isHamburgerOpen = false)}
      on:select={(e) => handleVehicleSelect(e.detail)}
    />

    <!-- 🧱 Left Section (optional/future use) -->
    <div class="w-[600px] bg-white rounded-lg shadow-inner">
      <LeftPanel/>
    </div>

    <!-- 🎥 Middle Section -->
    <div class="flex flex-col flex-shrink-0 items-center gap-4 overflow-hidden">
      <VideoPreview width="600px" height="340px" isLive={vehicleData.online} />

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
