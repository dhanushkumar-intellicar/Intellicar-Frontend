<script>
  import { onMount, onDestroy } from 'svelte';

  export let width = '500px';
  export let height = '280px';
  export let isLive = false; // true → live/WebRTC mode

  let activeChannel = null;
  let isFullscreen = false;
  let hover = false;
  let hoverTopRight = false;
  let videoRef;

  const sampleUrl =
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const channels = [
    { id: 'CH1', label: 'CH1', src: sampleUrl },
    { id: 'CH2', label: 'CH2', src: sampleUrl },
    { id: 'CH3', label: 'CH3', src: sampleUrl },
    { id: 'CH4', label: 'CH4', src: sampleUrl }
  ];

  function toggleChannel(id) {
    activeChannel = activeChannel === id ? null : id;
  }

  function exitExpanded() {
    activeChannel = null;
  }

  function toggleFullscreen() {
    const container = document.getElementById('video-preview-container');
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      isFullscreen = true;
    } else {
      document.exitFullscreen();
      isFullscreen = false;
    }
  }

  function togglePlay() {
    if (videoRef?.paused) videoRef.play();
    else videoRef?.pause();
  }

  function skip(seconds) {
    if (videoRef) videoRef.currentTime += seconds;
  }

  function changeSpeed(rate) {
    if (videoRef) videoRef.playbackRate = rate;
  }

  function handleKeydown(e) {
    if (!activeChannel || isLive) return;
    if (e.code === 'ArrowLeft') skip(-5);
    else if (e.code === 'ArrowRight') skip(5);
    else if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<!-- 📺 Container -->
<div
  id="video-preview-container"
  role="region"
  aria-label="Video preview grid"
  class="relative bg-black rounded-xl overflow-hidden shadow-xl flex items-center justify-center transition-all duration-300"
  style="width: {width}; height: {height};"
  on:mouseenter={() => (hover = true)}
  on:mouseleave={() => {
    hover = false;
    hoverTopRight = false;
  }}
>
  {#if !activeChannel}
    <!-- 🧩 4-channel grid -->
    <div class="grid grid-cols-2 grid-rows-2 gap-[2px] w-full h-full">
      {#each channels as ch}
        <button
          type="button"
          class="relative bg-black cursor-pointer focus:outline-none overflow-hidden"
          on:click={() => toggleChannel(ch.id)}
        >
          <video
            src={ch.src}
            autoplay
            muted
            loop
            playsinline
            class="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          ></video>
          <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
            {ch.label}
          </div>
        </button>
      {/each}
    </div>
  {:else}
    <!-- 🎥 Expanded Channel -->
    <div
  class="relative w-full h-full"
>

      <video
        bind:this={videoRef}
        src={channels.find(ch => ch.id === activeChannel)?.src}
        autoplay
        muted={isLive}
        loop={isLive}
        playsinline
        class="w-full h-full object-cover"
      ></video>

      <!-- ✕ Close -->
<button
  type="button"
  aria-label="Close video area"
  class="absolute top-0 right-0 w-16 h-16 z-40 bg-transparent cursor-pointer focus:outline-none"
  on:mouseenter={() => (hoverTopRight = true)}
  on:mouseleave={() => (hoverTopRight = false)}
  on:click={exitExpanded}
>
  {#if hoverTopRight}
    <span
      class="absolute top-2 right-2 bg-black/70 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/90 transition z-50"
    >
      ✕
    </span>
  {/if}
</button>


      <!-- 🎛️ YouTube-style controls at top-center -->
      {#if !isLive && hover}
        <div
          class="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black/40 rounded-full px-4 py-1 flex items-center gap-5 text-white text-lg backdrop-blur-sm transition"
        >
          <button on:click={() => skip(-5)} title="Back 5s" class="hover:scale-125 transition">
            ⏪
          </button>
          <button on:click={togglePlay} title="Play/Pause" class="hover:scale-150 text-2xl transition">
            ⏯
          </button>
          <button on:click={() => skip(5)} title="Forward 5s" class="hover:scale-125 transition">
            ⏩
          </button>
        </div>
      {/if}

      <!-- Bottom-right: speed + fullscreen -->
      {#if hover}
        <div class="absolute bottom-3 right-3 flex items-center gap-2 text-xs">
          {#if !isLive}
            <select
              on:change={(e) => changeSpeed(parseFloat(e.target.value))}
              class="bg-black/60 text-white rounded px-1 py-[2px] w-14 hover:bg-black/80 transition text-center"
            >
              <option value="0.5">0.5x</option>
              <option value="1" selected>1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          {/if}
          <button
            on:click={toggleFullscreen}
            class="bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Full Preview'}
          >
            [ ]
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  #video-preview-container {
    transition: all 0.3s ease-in-out;
  }

  :global(video) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
