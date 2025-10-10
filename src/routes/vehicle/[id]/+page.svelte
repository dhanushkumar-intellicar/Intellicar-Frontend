<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { dummyVehicle } from './dummyData.js';
  import VideoPreview from './components/VideoPreview.svelte';

  let vehicleData = {};
  $: id = $page.params.id;

  onMount(() => {
    vehicleData =
      id === 'VEH002'
        ? { ...dummyVehicle, deviceid: 'VEH002', online: false }
        : dummyVehicle;
  });
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
  <!-- Header -->
  <div class="flex items-center justify-between p-4 bg-white shadow">
    <h2 class="text-2xl font-semibold">
      Vehicle: <span class="text-blue-600">{vehicleData.deviceid}</span>
    </h2>
    <button
      on:click={() => goto('/home')}
      class="px-3 py-2 bg-white border rounded shadow-sm hover:bg-red-50"
    >
      ✕ Close
    </button>
  </div>

  <!-- Video Preview Grid -->
  <div class="flex-1 flex items-start justify-center pt-10">
  <VideoPreview width="25%" height="300px" isLive={false}/>
</div>
</div>
