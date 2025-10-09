<script>
  import { onMount, onDestroy } from 'svelte';
  import { writable, derived } from 'svelte/store';

  // 🔹 Vehicle data (veh_id → status)
  const vehicles = writable({});

  // 🔹 Selected filter ("total" | "active" | "inactive" | null)
  const selectedFilter = writable(null);
  let currentPage = 1;
const itemsPerPage = 50;


  let socket;
  let reconnectTimer;
  let mockInterval;
  let isConnected = false;

  const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws/frontend";

  // ✅ WebSocket Connection
  function connectWebSocket() {
    try {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        isConnected = true;
        clearTimeout(reconnectTimer);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.veh_id && data.veh_status) {
            vehicles.update(v => ({ ...v, [data.veh_id]: data.veh_status }));
          }
        } catch (e) {
          console.error("Invalid JSON:", event.data);
        }
      };

      socket.onerror = () => (isConnected = false);
      socket.onclose = () => {
        isConnected = false;
        reconnectTimer = setTimeout(connectWebSocket, 5000);
      };
    } catch {
      reconnectTimer = setTimeout(connectWebSocket, 5000);
    }
  }

  // 🧪 Mock Data (for UI testing)
  function startMockData() {
    const mockInterval = setInterval(() => {
      const id = "VEH-" + Math.ceil(Math.random() * 1000);
      const status = Math.random() > 0.5 ? "active" : "inactive";
      vehicles.update(v => ({ ...v, [id]: status }));
    }, 500);
    return mockInterval;
  }

  onMount(() => {
    connectWebSocket();
    mockInterval = startMockData(); // remove for production
  });

  onDestroy(() => {
    if (socket) socket.close();
    clearTimeout(reconnectTimer);
    clearInterval(mockInterval);
  });

  // 🧠 Derived stats for counts
  const stats = derived(vehicles, $v => {
    const statuses = Object.values($v);
    const active = statuses.filter(s => s === "active").length;
    const inactive = statuses.filter(s => s === "inactive").length;
    return { total: statuses.length, active, inactive };
  });

 // Filtered and paginated data (reactive)
const filteredVehicles = derived(
  [vehicles, selectedFilter],
  ([$v, $selectedFilter]) => {
    let filtered = [];

    if ($selectedFilter === "active") {
      filtered = Object.entries($v).filter(([_, s]) => s === "active");
    } else if ($selectedFilter === "inactive") {
      filtered = Object.entries($v).filter(([_, s]) => s === "inactive");
    } else if ($selectedFilter === "total") {
      filtered = Object.entries($v);
    }

    // 🧭 Apply pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
  }
);
// 🧮 Total pages calculation
let totalPages = 1;
$: {
  $filteredVehicles; // re-run when filtered changes
  const totalCount =
    $selectedFilter === "active"
      ? Object.values($vehicles).filter((s) => s === "active").length
      : $selectedFilter === "inactive"
      ? Object.values($vehicles).filter((s) => s === "inactive").length
      : $selectedFilter === "total"
      ? Object.keys($vehicles).length
      : 0;

  totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
}




</script>

<!-- ================== UI ================== -->
<div class="p-6 space-y-6 bg-gray-100 min-h-screen">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
      🚘 Telematics System Dashboard
    </h1>

    <div class="flex items-center gap-2 text-xs">
      <span
        class="inline-block w-2.5 h-2.5 rounded-full transition"
        class:bg-green-500={isConnected}
        class:bg-yellow-400={!isConnected}
      ></span>
      <span class="text-gray-500">{isConnected ? 'Live' : 'Offline (mock)'}</span>
    </div>
  </div>

  <!-- Stats Overview -->
  <div class="grid grid-cols-3 gap-4 text-center">
    <button
      type="button"
      class="bg-white rounded-lg p-4 shadow transition hover:scale-105 focus:outline-none"
      class:ring-2={$selectedFilter === "total"}
      class:ring-blue-500={$selectedFilter === "total"}
      on:click={() => selectedFilter.set("total")}
      on:click={() => {
    selectedFilter.set("total");
    currentPage = 1; // reset page
  }}
    >
      <p class="text-gray-500 text-sm">Total Vehicles</p>
      <p class="text-2xl font-bold text-gray-800">{$stats.total}</p>
    </button>

    <button
      type="button"
      class="bg-white rounded-lg p-4 shadow transition hover:scale-105 focus:outline-none"
      class:ring-2={$selectedFilter === "active"}
      class:ring-green-500={$selectedFilter === "active"}
      on:click={() => selectedFilter.set("active")}
      on:click={() => {
    selectedFilter.set("active");
    currentPage = 1; // reset page
  }}
    >
      <p class="text-gray-500 text-sm">Active</p>
      <p class="text-2xl font-bold text-green-600">{$stats.active}</p>
    </button>

    <button
      type="button"
      class="bg-white rounded-lg p-4 shadow transition hover:scale-105 focus:outline-none"
      class:ring-2={$selectedFilter === "inactive"}
      class:ring-red-500={$selectedFilter === "inactive"}
      on:click={() => selectedFilter.set("inactive")}
      on:click={() => {
    selectedFilter.set("inactive");
    currentPage = 1; // reset page
  }}
    >
      <p class="text-gray-500 text-sm">Inactive</p>
      <p class="text-2xl font-bold text-red-600">{$stats.inactive}</p>
    </button>
  </div>

  <!-- Vehicle Grid -->
  <div class="bg-white rounded-xl shadow-lg p-4 md:p-6">
    <h2 class="text-lg font-semibold text-gray-700 mb-4">
      {#if $selectedFilter === 'total'}All Vehicles{/if}
      {#if $selectedFilter === 'active'}Active Vehicles{/if}
      {#if $selectedFilter === 'inactive'}Inactive Vehicles{/if}
    </h2>

    {#if $selectedFilter === null}
      <p class="text-gray-400 italic text-center py-8">
        👆 Click a category to view vehicle data
      </p>
    {:else if $filteredVehicles.length > 0}
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[70vh] overflow-y-auto"
      >
        {#each $filteredVehicles as [id, status]}
          <div
            role="listitem"
            class="flex items-center justify-between p-3 rounded-lg border transition hover:scale-[1.01]"
            class:bg-green-50={status === 'active'}
            class:bg-red-50={status === 'inactive'}
            class:border-green-200={status === 'active'}
            class:border-red-200={status === 'inactive'}
          >
            <span class="font-medium text-gray-700 truncate">{id}</span>
            <span
              class="flex items-center gap-1 text-sm"
              class:text-green-600={status === 'active'}
              class:text-red-600={status === 'inactive'}
            >
              <span
                class="w-2.5 h-2.5 rounded-full"
                class:bg-green-500={status === 'active'}
                class:bg-red-500={status === 'inactive'}
              ></span>
              {status}
            </span>
          </div>
        {/each}
      </div>
      <!-- Modern Pagination -->
{#if totalPages > 1}
  <div class="flex justify-center items-center gap-4 mt-6">
    <button
      on:click={() => (currentPage = Math.max(1, currentPage - 1))}
      class="px-4 py-2 rounded-lg bg-white border shadow-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      disabled={currentPage === 1}
    >
      ⬅ Prev
    </button>

    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600 font-medium">Page</span>
      <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold">
        {currentPage} / {totalPages}
      </span>
    </div>

    <button
      on:click={() => (currentPage = Math.min(totalPages, currentPage + 1))}
      class="px-4 py-2 rounded-lg bg-white border shadow-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      disabled={currentPage === totalPages}
    >
      Next ➡
    </button>
  </div>
{/if}


    {:else}
      <p class="text-gray-400 italic text-center py-6">
        No data available for {$selectedFilter} vehicles.
      </p>
    {/if}
  </div>
</div>

<style>
  [class*="ring-"] {
    transition: all 0.2s ease-in-out;
  }
</style>
