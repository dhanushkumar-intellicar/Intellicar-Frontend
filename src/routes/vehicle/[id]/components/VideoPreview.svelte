<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment'; // ✅ import this to guard browser APIs

  export let width = '500px';
  export let height = '280px';
  export let isLive = false;

  let activeChannel = null;
  let isFullscreen = false;
  let hover = false;
  let hoverTopRight = false;
  let videoRef;
  let playedChannels = {};
  let gridVideoRefs = {};

  const sampleUrl =
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const channels = [
    { id: 'CH1', label: 'CH1', src: sampleUrl },
    { id: 'CH2', label: 'CH2', src: sampleUrl },
    { id: 'CH3', label: 'CH3', src: sampleUrl },
    { id: 'CH4', label: 'CH4', src: sampleUrl }
  ];

  function toggleChannel(id) {
    // If this channel was already played, ensure it stays playing in expanded view
    const wasPlayed = playedChannels[id];
    activeChannel = activeChannel === id ? null : id;
    
    if (activeChannel && wasPlayed) {
      // If expanding a played video, ensure it plays in expanded view
      setTimeout(() => {
        if (videoRef) videoRef.play();
      }, 0);
    }
  }

  function exitExpanded() {
    const currentChannel = activeChannel;
    activeChannel = null;
    // Resume playback of all played videos in grid view
    setTimeout(() => {
      Object.keys(playedChannels).forEach(channelId => {
        const gridVideo = gridVideoRefs[channelId];
        if (gridVideo && playedChannels[channelId]) {
          gridVideo.play();
        }
      });
    }, 0);
  }

  function toggleFullscreen() {
    if (!browser) return; // ✅ prevent SSR crash
    const container = document.getElementById('video-preview-container');
    if (!document.fullscreenElement) {
      container?.requestFullscreen();
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

  function playVideo(chId, event) {
    if (event) event.stopPropagation();
    playedChannels[chId] = true;
    playedChannels = { ...playedChannels }; // Trigger reactivity
    
    const gridVideo = gridVideoRefs[chId];
    if (gridVideo) gridVideo.play();
    
    // If this is the active channel, play in expanded view too
    if (activeChannel === chId && videoRef) {
      videoRef.play();
    }
  }

  function skip(seconds) {
    if (videoRef) videoRef.currentTime += seconds;
  }

  function changeSpeed(rate) {
    if (videoRef) videoRef.playbackRate = rate;
  }

  function handleKeydown(e) {
    if (!browser) return; // ✅
    if (!activeChannel || isLive) return;
    if (e.code === 'ArrowLeft') skip(-5);
    else if (e.code === 'ArrowRight') skip(5);
    else if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    }
  }

  onMount(() => {
    if (!browser) return; // ✅ guard again
    window.addEventListener('keydown', handleKeydown);
    
    // Start playing all videos that were previously played
    setTimeout(() => {
      Object.keys(playedChannels).forEach(channelId => {
        const gridVideo = gridVideoRefs[channelId];
        if (gridVideo && playedChannels[channelId]) {
          gridVideo.play();
        }
      });
    }, 0);
  });

  onDestroy(() => {
    if (!browser) return;
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
    <div class="grid grid-cols-2 grid-rows-2 gap-[2px] bg-white p-[2px] w-full h-full rounded-lg">
      {#each channels as ch}
        <div
          role="button"
          tabindex="0"
          class="relative bg-black cursor-pointer focus:outline-none overflow-hidden"
          on:click={() => toggleChannel(ch.id)}
          on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleChannel(ch.id); }}
        >
          <video  
            bind:this={gridVideoRefs[ch.id]}
            src={ch.src}
            muted
            loop
            playsinline
            on:loadeddata={() => {
              if (playedChannels[ch.id]) {
                gridVideoRefs[ch.id].play();
              }
            }}
            class="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          ></video>
          {#if !playedChannels[ch.id]}
            <div class="absolute inset-0 bg-gray-700/70 flex items-center justify-center">
              <button
                type="button"
                class="bg-white/80 rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-white/90 transition text-3xl text-gray-800"
                on:click|stopPropagation={(e) => playVideo(ch.id, e)}
                aria-label="Play video"
              >
                ▶
              </button>
            </div>
          {/if}
          <!-- <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
            {ch.label}
          </div> -->
        </div>
      {/each}
    </div>
  {:else}
    <!-- 🎥 Expanded Channel -->
    <div class="relative w-full h-full">
      <video
        bind:this={videoRef}
        src={channels.find(ch => ch.id === activeChannel)?.src}
        on:play={() => {
          if (activeChannel) {
            playedChannels[activeChannel] = true;
            playedChannels = { ...playedChannels };
          }
        }}
        muted={isLive}
        loop={isLive}
        playsinline
        class="w-full h-full object-cover"
      ></video>
      {#if !playedChannels[activeChannel]}
        <div class="absolute inset-0 bg-gray-700/70 flex items-center justify-center">
          <button
            type="button"
            class="bg-white/80 rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:bg-white/90 transition text-4xl text-gray-800"
            on:click={() => playVideo(activeChannel)}
            aria-label="Play video"
          >
            ▶
          </button>
        </div>
      {/if}

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

      <!-- 🎛️ YouTube-style controls -->
      {#if !isLive && hover}
        <div
          class="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black/40 rounded-full px-4 py-1 flex items-center gap-5 text-white text-lg backdrop-blur-sm transition"
        >
          <button on:click={() => skip(-5)} title="Back 5s" class="hover:scale-125 transition">⏪</button>
          <button on:click={togglePlay} title="Play/Pause" class="hover:scale-150 text-2xl transition">⏯</button>
          <button on:click={() => skip(5)} title="Forward 5s" class="hover:scale-125 transition">⏩</button>
        </div>
      {/if}

      <!-- ⚙️ Bottom-right controls -->
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
