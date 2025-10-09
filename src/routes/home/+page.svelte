<script>
  import { onMount } from 'svelte';

  // Dummy data (we'll make it dynamic later)
  let vehicles = [
    { id: 1, name: 'Vehicle A', status: 'active' },
    { id: 2, name: 'Vehicle B', status: 'inactive' },
    { id: 3, name: 'Vehicle C', status: 'active' },
    { id: 4, name: 'Vehicle D', status: 'inactive' },
    { id: 5, name: 'Vehicle E', status: 'active' }
  ];

  let selectedVehicle = null;

  const selectVehicle = (vehicle) => {
    selectedVehicle = vehicle;
  };

  onMount(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Protect route if user not logged in
      window.location.replace('/login');
    }
  });
</script>

<!-- Dashboard layout -->
<div class="min-h-screen bg-gray-50 flex flex-col">
  <!-- Header -->
  <header class="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
    <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
        DK
      </div>
    </div>
  </header>

  <!-- Main content -->
  <main class="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left section: Status Cards -->
    <div class="lg:col-span-2 flex flex-col gap-6">
      <!-- Status cards row -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
          <p class="text-gray-500 text-sm">Total Vehicles</p>
          <p class="text-2xl font-semibold text-gray-800 mt-1">{vehicles.length}</p>
        </div>
        <div class="bg-green-100 p-4 rounded-xl shadow hover:shadow-md transition">
          <p class="text-gray-600 text-sm">Active</p>
          <p class="text-2xl font-semibold text-green-600 mt-1">
            {vehicles.filter(v => v.status === 'active').length}
          </p>
        </div>
        <div class="bg-red-100 p-4 rounded-xl shadow hover:shadow-md transition">
          <p class="text-gray-600 text-sm">Inactive</p>
          <p class="text-2xl font-semibold text-red-600 mt-1">
            {vehicles.filter(v => v.status === 'inactive').length}
          </p>
        </div>
      </div>

      <!-- Placeholder for charts -->
      <div class="bg-white rounded-xl shadow p-6 min-h-[200px] flex items-center justify-center text-gray-400 italic">
        [ Charts coming soon... ]
      </div>
    </div>

    <!-- Right section: Vehicle list -->
    <div class="bg-white rounded-xl shadow p-6 flex flex-col">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Vehicle List</h2>

      <ul class="flex-1 overflow-y-auto divide-y divide-gray-100">
  {#each vehicles as vehicle}
    <li>
      <button
        type="button"
        on:click={() => selectVehicle(vehicle)}
        class="w-full text-left p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center transition rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        class:bg-blue-50={selectedVehicle?.id === vehicle.id}
      >
        <span class="font-medium text-gray-700">{vehicle.name}</span>
        <span
          class="flex items-center gap-2 text-sm"
          class:text-green-600={vehicle.status === 'active'}
          class:text-red-600={vehicle.status === 'inactive'}
        >
          <span
            class="w-2.5 h-2.5 rounded-full"
            class:bg-green-500={vehicle.status === 'active'}
            class:bg-red-500={vehicle.status === 'inactive'}
          ></span>
          {vehicle.status}
        </span>
      </button>
    </li>
  {/each}
</ul>


      {#if selectedVehicle}
        <div class="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">
          <p><strong>Selected:</strong> {selectedVehicle.name}</p>
          <p>
            <strong>Status:</strong>
            <span
              class="inline-flex items-center gap-2"
              class:text-green-600={selectedVehicle.status === 'active'}
              class:text-red-600={selectedVehicle.status === 'inactive'}
            >
              <span
                class="w-2.5 h-2.5 rounded-full"
                class:bg-green-500={selectedVehicle.status === 'active'}
                class:bg-red-500={selectedVehicle.status === 'inactive'}
              ></span>
              {selectedVehicle.status}
            </span>
          </p>
        </div>
      {/if}
    </div>
  </main>
</div>

<style>
 
</style>

