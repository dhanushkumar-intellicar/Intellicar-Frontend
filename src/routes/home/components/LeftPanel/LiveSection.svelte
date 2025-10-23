<script>
  import ResponseBox from "./ResponseBox.svelte";
  import { snackbar } from "$lib/stores/snackbar";

  export let onVideoSelect = () => {};

  let selectedChannel = -1;
  let fileType = 3;
  let streamType = 0;
  let loading = false;
  let disabled = false;
  let responseData = null;

  async function handleSubmit() {
  if (selectedChannel === -1) {
    snackbar.set({
      show: true,
      message: "Please select a channel before starting live stream.",
      type: "error",
    });
    return;
  }

  loading = true;
  disabled = true;
  responseData = null;

  snackbar.set({
    show: true,
    message: "Connecting to live stream...",
    type: "info",
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Live stream info
  const file = {
    id: 1,
    name: `CH${selectedChannel + 1}_LiveStream.mp4`,
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    size: "Live Stream",
    duration: "Ongoing",
    start: "Now",
    end: "Live",
  };

  // Set response data for UI
  responseData = {
    message: `Now streaming ${file.name}`,
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
    message: responseData.message,
    type: "success",
  });

  // Automatically tell parent to start video playback
  onVideoSelect({ channel: selectedChannel, url: file.url, section: 'live' });

  loading = false;
  disabled = false;
}


  export function playExternalVideo(videoInfo) {
    const videoEl = document.querySelector(`video[src="${videoInfo.url}"]`);
    if (videoEl) {
      videoEl.play();
    }
  }


  // This will be called from parent to stop all videos in this section
export function stopAllVideos() {
    // pause all videos
    document.querySelectorAll("video").forEach(v => v.pause());
  }

</script>

<div class="flex flex-col h-full">
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
                name="liveChannel"
                bind:group={selectedChannel}
                value={ch}
                class="accent-green-600 scale-105"
                disabled={disabled}
              />
              <span class="text-sm">CH{ch + 1}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- File & Stream -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label class="text-sm font-medium" for="fileType">File Type</label>
          <select
            id="fileType"
            bind:value={fileType}
            class="w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-green-400 outline-none text-sm"
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
            class="w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-green-400 outline-none text-sm"
            disabled={disabled}
          >
            <option value={0}>All Stream</option>
            <option value={1}>Main Stream</option>
            <option value={2}>Sub Stream</option>
          </select>
        </div>
      </div>
    </fieldset>

    <!-- Connect Button -->
    <div class="flex flex-col items-center pt-3">
      <button
        on:click={handleSubmit}
        class="px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold flex items-center gap-2 hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {#if loading}
          <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          <span>Connecting...</span>
        {:else}
          <span>Start Live Stream</span>
        {/if}
      </button>

      
    </div>
  </div>

  <div class="border-t border-gray-300 p-3 bg-white/80 backdrop-blur-sm">
    {#if responseData}
      <ResponseBox {responseData} />
    {:else}
      <p class="text-center text-gray-500 text-sm">No stream selected yet.</p>
    {/if}
  </div>
</div>
