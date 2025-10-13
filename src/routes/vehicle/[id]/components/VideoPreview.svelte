<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment'; // ✅ import this to guard browser APIs

  export let width = '500px';
  export let height = '280px';
  export let isLive = false;

  // Debounced hover state
  let hoverTimeout;
  function setHover(value) {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      hover = value;
      if (!value) hoverTopRight = false;
    }, 100);
  }

  // Error handling
  function handleVideoError(videoElement, channelId) {
    console.error(`Video playback error for channel ${channelId}`);
    // Attempt to recover by reloading the video
    if (videoElement) {
      videoElement.load();
    }
  }

  let activeChannel = null;
  let isFullscreen = false;
  let hover = false;
  let hoverTopRight = false;
  let videoRef;
  let playedChannels = {};
  let gridVideoRefs = {};
  let videoPositions = {}; // Store current time for each video
  let videoStates = {}; // Store playback state and speed for each video

  const sampleUrl =
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const channels = [
    { id: 'CH1', label: 'CH1', src: sampleUrl },
    { id: 'CH2', label: 'CH2', src: sampleUrl },
    { id: 'CH3', label: 'CH3', src: sampleUrl },
    { id: 'CH4', label: 'CH4', src: sampleUrl }
  ];

  function toggleChannel(id) {
    // Save current time and state of the active channel before switching
    if (activeChannel && videoRef) {
      videoPositions[activeChannel] = videoRef.currentTime;
      videoStates[activeChannel] = {
        paused: videoRef.paused,
        playbackRate: videoRef.playbackRate
      };
    }

    // If this channel was already played, ensure it stays in correct state in expanded view
    const wasPlayed = playedChannels[id];
    activeChannel = activeChannel === id ? null : id;
    
    if (activeChannel && wasPlayed) {
      const state = videoStates[activeChannel] || { paused: false, playbackRate: 1 };
      setTimeout(() => {
        if (videoRef) {
          videoRef.currentTime = videoPositions[activeChannel] || 0;
          videoRef.playbackRate = state.playbackRate;
          if (state.paused) {
            videoRef.pause();
          } else {
            videoRef.play();
          }
        }
      }, 0);
    }
  }

  function exitExpanded() {
    // Save position and state of the expanded video before closing
    if (activeChannel && videoRef) {
      videoPositions[activeChannel] = videoRef.currentTime;
      videoStates[activeChannel] = {
        paused: videoRef.paused,
        playbackRate: videoRef.playbackRate
      };
    }
    
    const currentChannel = activeChannel;
    activeChannel = null;
    
    // Resume videos in grid view with their saved states
    setTimeout(() => {
      Object.keys(playedChannels).forEach(channelId => {
        const gridVideo = gridVideoRefs[channelId];
        if (gridVideo && playedChannels[channelId]) {
          const state = videoStates[channelId] || { paused: false, playbackRate: 1 };
          gridVideo.currentTime = videoPositions[channelId] || 0;
          gridVideo.playbackRate = state.playbackRate;
          if (state.paused) {
            gridVideo.pause();
          } else {
            gridVideo.play();
          }
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
    if (videoRef?.paused) {
      videoRef.play();
      if (activeChannel) {
        videoStates[activeChannel] = { ...videoStates[activeChannel], paused: false };
      }
    } else {
      videoRef?.pause();
      if (activeChannel) {
        videoStates[activeChannel] = { ...videoStates[activeChannel], paused: true };
      }
    }
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
    if (videoRef) {
      videoRef.playbackRate = rate;
      if (activeChannel) {
        videoStates[activeChannel] = { ...videoStates[activeChannel], playbackRate: rate };
      }
    }
  }

  function handleKeydown(e) {
    if (!browser) return; // ✅
    if (!activeChannel) return;
    
    // Allow only space (play/pause) for live videos
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
      return;
    }
    
    // Skip controls only for non-live videos
    if (!isLive) {
      if (e.code === 'ArrowLeft') skip(-5);
      else if (e.code === 'ArrowRight') skip(5);
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
    
    // Clean up timeouts and video states
    clearTimeout(hoverTimeout);
    
    // Stop and clean up all videos
    Object.values(gridVideoRefs).forEach(videoRef => {
      if (videoRef) {
        videoRef.pause();
        videoRef.removeAttribute('src');
        videoRef.load();
      }
    });
    
    if (videoRef) {
      videoRef.pause();
      videoRef.removeAttribute('src');
      videoRef.load();
    }
  });
</script>

<!-- 📺 Container -->
<div
  id="video-preview-container"
  role="region"
  aria-label="Video preview grid"
  class="relative bg-black rounded-xl overflow-hidden shadow-xl flex items-center justify-center transition-all duration-300"
  style="width: {width}; height: {height};"
  on:mouseenter={() => setHover(true)}
  on:mouseleave={() => setHover(false)}
>
  {#if !activeChannel}
    <!-- 🧩 4-channel grid -->
    <div class="grid grid-cols-2 grid-rows-2 gap-0.5 bg-white p-1 w-full h-full rounded-lg">
      {#each channels as ch}
        <div
          role="button"
          tabindex="0"
          class="relative bg-black cursor-pointer focus:outline-none overflow-hidden rounded-lg transform-gpu"
          on:click={() => toggleChannel(ch.id)}
          on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleChannel(ch.id); }}
        >
          <video  
            bind:this={gridVideoRefs[ch.id]}
            src={ch.src}
            muted
            loop
            playsinline
            on:timeupdate={() => {
              if (playedChannels[ch.id]) {
                videoPositions[ch.id] = gridVideoRefs[ch.id].currentTime;
              }
            }}
            on:loadeddata={() => {
              if (playedChannels[ch.id]) {
                const state = videoStates[ch.id] || { paused: false, playbackRate: 1 };
                gridVideoRefs[ch.id].currentTime = videoPositions[ch.id] || 0;
                gridVideoRefs[ch.id].playbackRate = state.playbackRate;
                if (state.paused) {
                  gridVideoRefs[ch.id].pause();
                } else {
                  gridVideoRefs[ch.id].play();
                }
              }
            }}
            class="w-full h-full object-cover transform-gpu transition-transform duration-300 hover:scale-[1.03]"
            on:error={() => handleVideoError(gridVideoRefs[ch.id], ch.id)}
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
        on:timeupdate={() => {
          if (activeChannel) {
            videoPositions[activeChannel] = videoRef.currentTime;
          }
        }}
        muted={isLive}
        loop={isLive}
        playsinline
        class="w-full h-full object-cover transform-gpu"
        on:error={() => handleVideoError(videoRef, activeChannel)}
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
          class="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black/40 rounded-full px-4 py-1 flex items-center gap-5 text-white text-lg backdrop-blur-sm transition-opacity duration-200 hover-controls"
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
    transform: translateZ(0); /* Force GPU acceleration */
    backface-visibility: hidden;
    perspective: 1000px;
    will-change: transform;
  }
  :global(video) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    transform: translateZ(0);
    will-change: transform;
  }
  /* Optimize transitions */
  :global(.transform-gpu) {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
    will-change: transform;
  }
  /* Prevent wobble on hover controls */
  :global(.hover-controls) {
    transform: translateZ(0);
    backface-visibility: hidden;
    will-change: opacity, transform;
  }
</style>
