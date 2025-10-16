<script>
import {
    onMount
} from "svelte";
import ResponseBox from "./ResponseBox.svelte";
import {
    snackbar
} from "$lib/stores/snackbar";

// Form state
let selectedChannel = -1;
let startTime = "";
let endTime = "";
let fileType = 3;
let streamType = 0;

// Response data
let responseData = {
    message: "Waiting for request...",
    data: {
        channels: ["CH1", "CH2"],
        start: "250101120000",
        end: "250101123000",
        fileType: 1,
        streamType: 0,
    },
};

// Format datetime
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const yy = String(d.getFullYear()).slice(-2);
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const DD = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yy}${MM}${DD}${hh}${mm}${ss}`;
}

// Send request (dummy here, replace with fetch for production)
async function handleSubmit() {
    responseData = {
        success: true,
        data: {
            channels: [`CH${selectedChannel + 1}`],
            start: formatDate(startTime),
            end: formatDate(endTime),
            fileType,
            streamType,
        },
    };

    // Show snackbar
    snackbar.set({
        show: true,
        message: "Request sent successfully!",
        type: "success"
    });

    // ✅ Production example:
    // const res = await fetch(`${import.meta.env.VITE_API_URL}/endpoint`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}` },
    //   body: JSON.stringify({ selectedChannels, startTime, endTime, fileType, streamType })
    // });
    // responseData = await res.json();
}

onMount(() => {
    const now = new Date().toISOString().slice(0, 16);
    startTime = now;
    endTime = now;
});
</script>

<div class="max-w-md mx-auto h-full flex flex-col bg-gray-50 shadow-md rounded-xl overflow-hidden">
    <!-- Form -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Channels -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="channel-0">Channels</label>
            <div class="flex flex-wrap gap-2">
                {#each [0,1,2,3] as ch}
                <label class="flex items-center gap-1 px-2 py-1 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition" for={"channel-" + ch}>
                    <input
                        id={"channel-" + ch}
                        type="radio"
                        name="channel"
                        bind:group={selectedChannel}
                        value={ch}
                        class="accent-blue-600 scale-105"
                        />
                    <span class="text-sm">CH{ch + 1}</span>
                </label>
                {/each}
            </div>
        </div>

        <!-- Date & Time -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
                <label class="text-sm font-medium" for="start-time-input">Start Time</label>
                <input id="start-time-input" type="datetime-local" bind:value={startTime} class="w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-blue-400 outline-none text-sm"/>
            </div>
            <div>
                <label class="text-sm font-medium" for="end-time-input">End Time</label>
                <input id="end-time-input" type="datetime-local" bind:value={endTime} class="w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-blue-400 outline-none text-sm"/>
            </div>
        </div>

        <!-- File & Stream -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
                <label class="text-sm font-medium" for="file-type-input">File Type</label>
                <select bind:value={fileType} class="w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-blue-400 outline-none text-sm">
                    <option value={1}>Audio</option>
                    <option value={2}>Video</option>
                    <option value={3}>Audio & Video</option>
                </select>
            </div>
            <div>
                <label class="text-sm font-medium" for="stream-type-input">Stream Type</label>
                <select bind:value={streamType} class="w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-blue-400 outline-none text-sm">
                    <option value={0}>All Stream</option>
                    <option value={1}>Main Stream</option>
                    <option value={2}>Sub Stream</option>
                </select>
            </div>
        </div>

        <!-- Send Button -->
        <div class="flex justify-center pt-2">
            <button on:click={handleSubmit} class="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-md transition">
                Send Request
            </button>
        </div>
    </div>

    <!-- Response -->
    <div class="border-t border-gray-300 h-[40%] p-2 bg-white/70 backdrop-blur-sm overflow-y-auto">
        <ResponseBox {responseData}/>
            </div>
            </div>

<style>
.overflow-y-auto::-webkit-scrollbar {
    width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #a1a1aa;
    border-radius: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #71717a;
}
</style>
