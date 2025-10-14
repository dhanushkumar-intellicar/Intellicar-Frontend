<script>
  import { createEventDispatcher } from 'svelte';
  import { writable, derived } from 'svelte/store';

  export let vehicles = {}; // { VEH001: "active", VEH002: "inactive" }
  export let isOpen = false;

  const dispatch = createEventDispatcher();
  const search = writable('');
  const sort = writable('asc');

  const filteredVehicles = derived([search, sort], ([$search, $sort]) => {
    let list = Object.entries(vehicles);

    if ($search) {
      const q = $search.toLowerCase();
      list = list.filter(([id]) => id.toLowerCase().includes(q));
    }

    list.sort(([a], [b]) =>
      $sort === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    );

    return list;
  });

  function toggleSort() {
    sort.update((s) => (s === 'asc' ? 'desc' : 'asc'));
  }

  function handleSelect(id) {
    dispatch('select', id);
  }
</script>

<!-- Drawer -->
<div
  class="fixed top-0 left-0 h-full w-72 bg-gray-50 shadow-2xl border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
  class:translate-x-0={isOpen}
  class:-translate-x-full={!isOpen}
>
  <!-- Header -->
  <div class="flex justify-between items-center px-4 py-3 border-b bg-gray-100">
    <h2 class="font-semibold text-gray-800 text-sm tracking-wide">Device List</h2>
    <button
      on:click={() => dispatch('close')}
      class="text-gray-500 hover:text-gray-700 text-lg font-semibold"
    >
      ✕
    </button>
  </div>

  <!-- Search + Sort Row -->
  <div class="px-3 py-2.5 border-b bg-gray-50 sticky top-0 z-10">
    <div class="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search ID..."
        on:input={(e) => search.set(e.target.value)}
        aria-label="Search devices"
        class="w-40 px-2 py-1 text-xs border rounded-md bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
      />
      <button
        on:click={toggleSort}
        class="flex items-center gap-1 px-2 py-1 text-xs border rounded-md bg-white hover:bg-gray-100 shadow-sm transition"
        title="Toggle sort order"
      >
        <span>Sort</span>
        {#if $sort === 'asc'}
          <span>↑</span>
        {:else}
          <span>↓</span>
        {/if}
      </button>
    </div>
  </div>

  <!-- Scrollable Device List -->
  <div
    class="flex-1 overflow-y-auto px-3 py-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
  >
    {#if $filteredVehicles.length > 0}
      <div class="space-y-1 pr-2">
        {#each $filteredVehicles as [id, status]}
          <button
            on:click={() => handleSelect(id)}
            class="w-full flex justify-between items-center px-3 py-2 text-xs bg-white border border-gray-200 rounded-md hover:bg-blue-50 transition shadow-sm"
          >
            <span class="truncate text-gray-700 font-medium">{id}</span>
            <span
              class="flex items-center gap-1"
              class:text-green-600={status === 'active'}
              class:text-red-600={status === 'inactive'}
            >
              <span
                class="w-2 h-2 rounded-full"
                class:bg-green-500={status === 'active'}
                class:bg-red-500={status === 'inactive'}
              ></span>
              {status}
            </span>
          </button>
        {/each}
      </div>
    {:else}
      <p class="text-gray-400 text-xs text-center mt-4">No devices found</p>
    {/if}
  </div>
</div>

<style>
  .translate-x-0 {
    transform: translateX(0);
  }
  .-translate-x-full {
    transform: translateX(-100%);
  }

  .scrollbar-thin {
    scrollbar-width: thin;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background-color: #f3f4f6;
  }
</style>
