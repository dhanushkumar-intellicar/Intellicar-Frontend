<script>
  import ResponseBox from "./ResponseBox.svelte";
  import { snackbar } from "$lib/stores/snackbar";

  let selectedCommand = "";
  let responseData = null;
  let availableData = [];
  let showAvailableData = false;
  let loading = false;

  // ✅ Dummy fallback (works locally)
  const commandResponses = {
    "0x9101 - Real Time Data 1": {
      message: "Real-time position data received",
      data: {
        type: "Position Update",
        latitude: "13.0827",
        longitude: "80.2707",
        speed: "55 km/h",
        timestamp: "2025-10-22T14:30:00Z",
      },
    },
    "0x9102 - Real Time Data 2": {
      message: "Vehicle status data received",
      data: {
        engine: "ON",
        fuel: "72%",
        temp: "89°C",
        rpm: 2100,
      },
    },
    "0x9205 - Audio/Video": {
      message: "Audio/Video stream command executed",
      data: {
        stream: "Audio + Video",
        bitrate: "2 Mbps",
        resolution: "720p",
        status: "Streaming Active",
      },
    },
    "0x8001 - Header data acknowledged": {
      message: "Header data acknowledged",
      data: {
        messageId: "0x9101",
        result: "Success",
        session: "A32XF-2025",
      },
    },
    "0x8100 - Authentication command": {
      message: "Authentication command executed",
      data: {
        deviceId: "DEV-1012",
        authCode: "VALIDATED",
        timestamp: "2025-10-22T14:32:00Z",
      },
    },
  };

  // ✅ Main handler (works now with dummy, ready for real API)
  async function handleSend() {
    if (!selectedCommand) {
      snackbar.set({
        show: true,
        message: "Please select a command first.",
        type: "error",
      });
      return;
    }

    showAvailableData = false;
    responseData = null;
    loading = true;

    snackbar.set({
      show: true,
      message: `Sending command ${selectedCommand}...`,
      type: "info",
    });

    try {
      // -------------------------------
      // 🔸 FUTURE REAL API CALL
      // Uncomment when backend ready
      // const res = await fetch(`/api/commands/${selectedCommand}`);
      // if (!res.ok) throw new Error("Failed to fetch");
      // const response = await res.json();
      // -------------------------------

      // ✅ Dummy fallback (remove later)
      await new Promise((r) => setTimeout(r, 800));
      const response = commandResponses[selectedCommand];

      // ✅ Handle & display response
      responseData = response.data;
      showAvailableData = true;
      availableData = Object.entries(response.data).map(([key, value]) => ({
        key,
        value,
      }));

      snackbar.set({
        show: true,
        message: response.message,
        type: "success",
      });
    } catch (err) {
      snackbar.set({
        show: true,
        message: `Error: ${err.message}`,
        type: "error",
      });
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col h-full p-4 space-y-4">
  <!-- Command Dropdown -->
  <div class="flex flex-col gap-2">
    <label class="text-sm font-semibold text-gray-700" for="commandSelect">
      Commands:
    </label>

    <select
      id="commandSelect"
      bind:value={selectedCommand}
      class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none text-sm bg-white shadow-sm"
    >
      <option value="" disabled selected>Select a command</option>
      {#each Object.keys(commandResponses) as cmd}
        <option value={cmd}>{cmd}</option>
      {/each}
    </select>

    <!-- Send Button -->
    <div class="flex flex-col items-center">
      <button
        on:click={handleSend}
        class="mt-3 w-fit px-4 py-1.5 rounded-full bg-[#8B4513] hover:bg-[#6F3A10] text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {#if loading}
          <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          Sending...
        {:else}
          Send
        {/if}
      </button>
    </div>
  </div>

  <!-- Available Data -->
  {#if showAvailableData}
    <div class="mt-3 bg-white border rounded-lg shadow-sm p-3">
      <p class="text-sm font-semibold text-gray-700 mb-2">Available Data:</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {#each availableData as item}
          <div class="p-2 bg-gray-50 rounded-md border hover:bg-gray-100 transition">
            <span class="font-medium text-gray-700">{item.key}</span>:
            <span class="text-gray-600">{item.value}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- JSON Response Box -->
  <div class="border-t border-gray-300 pt-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-inner p-3">
    {#if responseData}
      <ResponseBox {responseData} />
    {:else}
      <p class="text-center text-gray-500 text-sm">No command executed yet.</p>
    {/if}
  </div>
</div>
