<script>
import {
    onMount
} from "svelte";
import ResponseBox from "./ResponseBox.svelte";
import {
    snackbar
} from "$lib/stores/snackbar";

export let onVideoSelect = (videoInfo) => {};

let selectedChannel = -1;
let startTime = "";
let endTime = "";
let fileType = 3; // 1: Audio, 2: Video, 3: Both
let streamType = 0;
let loading = false;
let disabled = false;
let availableFiles = [];
let responseData = null;

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

async function handleSubmit() {
    if (selectedChannel === -1) {
        snackbar.set({
            show: true,
            message: "Please select a channel before sending request.",
            type: "error",
        });
        return;
    }

    loading = true;
    disabled = true;
    availableFiles = [];
    responseData = null;

    snackbar.set({
        show: true,
        message: "Fetching available files from dashcam...",
        type: "info",
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const files = [];

    if (fileType === 1 || fileType === 3) {
        files.push({
            id: 1,
            name: `CH${selectedChannel + 1}_audio_001.mp3`,
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            size: "3 MB",
            duration: "2m 10s",
            start: formatDate(startTime),
            end: formatDate(endTime),
        });
    }

    if (fileType === 2 || fileType === 3) {
        files.push({
            id: 2,
            name: `CH${selectedChannel + 1}_front_001.mp4`,
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            size: "25 MB",
            duration: "2m 30s",
            start: formatDate(startTime),
            end: formatDate(endTime),
        });
    }

    availableFiles = files;

    snackbar.set({
        show: true,
        message: `${files.length} files ready to view`,
        type: "success",
    });

    loading = false;
    disabled = false;
}

function handleFileSelect(file) {
    responseData = {
        message: `Now playing ${file.name}`,
        data: {
            file: file.name,
            channel: selectedChannel + 1,
            duration: file.duration,
            size: file.size,
            start: file.start,
            end: file.end,
        },
    };

    snackbar.set({
        show: true,
        message: `Now playing ${file.name}`,
        type: "success",
    });

    onVideoSelect({
        channel: selectedChannel,
        url: file.url,
    });
}

onMount(() => {
    const now = new Date().toISOString().slice(0, 16);
    startTime = now;
    endTime = now;
});
</script>

<!-- 🧠 UI -->
<div class="max-w-md mx-auto h-full flex flex-col bg-gray-50 shadow-md rounded-xl overflow-hidden">
    <!-- Scrollable form content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <fieldset class={disabled ? 'opacity-50 pointer-events-none' : ''}>
            <!-- Channels -->
            <div>
                <span class="block text-sm font-medium text-gray-700 mb-1">Channels</span>
                <div class="flex flex-wrap gap-2">
                    {#each [0, 1, 2, 3] as ch}
                        <label class="flex items-center gap-1 px-2 py-1 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition">
                            <input
                                type="radio"
                                name="channel"
                                bind:group={selectedChannel}
                                value={ch}
                                class="accent-blue-600 scale-105"
                                disabled={disabled}
                            />
                            <span class="text-sm">CH{ch + 1}</span>
                        </label>
                    {/each}
                </div>
            </div>

            <!-- Date & Time -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                    <label class="text-sm font-medium" for="startTime">Start Time</label>
                    <input
                        id="startTime"
                        type="datetime-local"
                        bind:value={startTime}
                        class="w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-blue-400 outline-none text-sm"
                        disabled={disabled}
                    />
                </div>
                <div>
                    <label class="text-sm font-medium" for="endTime">End Time</label>
                    <input
                        id="endTime"
                        type="datetime-local"
                        bind:value={endTime}
                        class="w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-blue-400 outline-none text-sm"
                        disabled={disabled}
                    />
                </div>
            </div>

            <!-- File & Stream -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                    <label class="text-sm font-medium" for="fileType">File Type</label>
                    <select
                        id="fileType"
                        bind:value={fileType}
                        class="w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-blue-400 outline-none text-sm"
                        disabled={disabled}
                    >
                        <option value={1}>Audio</option>
                        <option value={2}>Video</option>
                        <option value={3}>Audio & Video</option>
                    </select>
                </div>
                <div>
                    <label class="text-sm font-medium" for="streamType">Stream Type</label>
                    <select
                        id="streamType"
                        bind:value={streamType}
                        class="w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-blue-400 outline-none text-sm"
                        disabled={disabled}
                    >
                        <option value={0}>All Stream</option>
                        <option value={1}>Main Stream</option>
                        <option value={2}>Sub Stream</option>
                    </select>
                </div>
            </div>
        </fieldset>

        <!-- Send Button -->
        <div class="flex flex-col items-center pt-3">
            <button
                on:click={handleSubmit}
                class="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold flex items-center gap-2 hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {#if loading}
                    <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Fetching...</span>
                {:else}
                    <span>Send Request</span>
                {/if}
            </button>

            <!-- Available Files -->
            {#if availableFiles.length > 0}
                <div class="mt-3 w-full bg-white border rounded-md p-3 shadow-sm">
                    <p class="text-sm font-medium text-gray-700 mb-2">Available Files:</p>
                    <div class="space-y-2">
                        {#each availableFiles as file}
                            <button
                                class="block w-full text-left p-2 rounded-md border hover:bg-blue-50 transition text-sm"
                                on:click={() => handleFileSelect(file)}
                            >
                                🎞️ {file.name} — <span class="text-gray-500">{file.size}</span>
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- 🧩 Fixed Response Panel at Bottom -->
    <div class="border-t border-gray-300 p-3 bg-white/80 backdrop-blur-sm">
        {#if responseData}
            <ResponseBox {responseData} />
        {:else}
            <p class="text-center text-gray-500 text-sm">No files selected yet.</p>
        {/if}
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
