<script>
import {
    onMount,
    onDestroy
} from 'svelte';
import {
    browser
} from '$app/environment';
import minimize from '../../../../assets/minimize.png'
import maximize from '../../../../assets/maximize.png'



export let width = '500px';
export let height = '280px';
export let isLive = false;

// Debounced hover state for controls
let hoverTimeout;

function setHover(value) {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
        hover = value;
    }, 100);
}

// Separate hover for close button
let hoverClose = false;

// Error handling
function handleVideoError(videoElement, channelId) {
    console.error(`Video playback error for channel ${channelId}`);
    if (videoElement) {
        videoElement.load();
    }
}

let activeChannel = null;
let isFullscreen = false;
let hover = false;
let videoRef;
let playedChannels = {};
let gridVideoRefs = {};
let videoPositions = {};
let videoStates = {};
let progress = 0;
let isPaused = true;
let currentSpeed = 1;
let currentTime = '00:00';
let duration = '00:00';
let tooltipTime = '00:00';
let tooltipVisible = false;
let tooltipLeft = 0;

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function showTooltip(e) {
    if (!videoRef ?.duration) return;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    tooltipLeft = x;
    tooltipTime = formatTime((percentage / 100) * videoRef.duration);
    tooltipVisible = true;
}

function skip(seconds) {
    if (videoRef) {
        videoRef.currentTime = Math.max(
            0,
            Math.min(videoRef.duration, videoRef.currentTime + seconds)
        );
    }
}

function changeSpeed(speed) {
    if (videoRef) {
        videoRef.playbackRate = speed;
        currentSpeed = speed;
    }
}
export function playExternalVideo({
    channel,
    url
}) {
    // Replace the sample URL of the chosen channel and play
    const chId = `CH${channel + 1}`;
    const video = gridVideoRefs[chId];
    if (video) {
        video.src = url;
        video.play();
        playedChannels[chId] = true;
    }
}

const sampleUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const channels = [{
        id: 'CH1',
        label: 'CH1',
        src: sampleUrl
    },
    {
        id: 'CH2',
        label: 'CH2',
        src: sampleUrl
    },
    {
        id: 'CH3',
        label: 'CH3',
        src: sampleUrl
    },
    {
        id: 'CH4',
        label: 'CH4',
        src: sampleUrl
    }
];

function toggleChannel(id) {
    if (activeChannel && videoRef) {
        videoPositions[activeChannel] = videoRef.currentTime;
        videoStates[activeChannel] = {
            paused: videoRef.paused,
            playbackRate: videoRef.playbackRate
        };
    }

    const wasPlayed = playedChannels[id];
    activeChannel = activeChannel === id ? null : id;

    if (activeChannel) {
        document.getElementById('video-preview-container') ?.focus();
    }

    if (activeChannel && wasPlayed) {
        const state = videoStates[activeChannel] || {
            paused: false,
            playbackRate: 1
        };
        setTimeout(() => {
            if (videoRef) {
                videoRef.currentTime = videoPositions[activeChannel] || 0;
                videoRef.playbackRate = state.playbackRate;
                currentSpeed = state.playbackRate;
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
    if (activeChannel && videoRef) {
        videoPositions[activeChannel] = videoRef.currentTime;
        videoStates[activeChannel] = {
            paused: videoRef.paused,
            playbackRate: videoRef.playbackRate
        };
    }

    activeChannel = null;

    setTimeout(() => {
        Object.keys(playedChannels).forEach(channelId => {
            const gridVideo = gridVideoRefs[channelId];
            if (gridVideo && playedChannels[channelId]) {
                const state = videoStates[channelId] || {
                    paused: false,
                    playbackRate: 1
                };
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
    if (!browser) return;
    const container = document.getElementById('video-preview-container');
    if (!document.fullscreenElement) {
        container?.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}


function togglePlay() {
    if (videoRef ?.paused) {
        videoRef.play();
        if (activeChannel) {
            videoStates[activeChannel] = {
                ...videoStates[activeChannel],
                paused: false
            };
        }
    } else {
        videoRef ?.pause();
        if (activeChannel) {
            videoStates[activeChannel] = {
                ...videoStates[activeChannel],
                paused: true
            };
        }
    }
}

function playVideo(chId, event) {
    if (event) event.stopPropagation();
    playedChannels[chId] = true;
    playedChannels = {
        ...playedChannels
    };

    const gridVideo = gridVideoRefs[chId];
    if (gridVideo) gridVideo.play();

    if (activeChannel === chId && videoRef) {
        videoRef.play();
    }
}

function handleKeydown(e) {
    if (!browser) return;

    // 🎥 When expanded (active channel)
    if (activeChannel && videoRef) {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
            return;
        }

        if (!isLive) {
            if (e.code === 'ArrowLeft') {
                e.preventDefault();
                skip(-5); // ⏪ back 5s
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                skip(5); // ⏩ forward 5s
            }
        }
        return;
    }

    // 🧩 Grid mode – only affect the focused video
    const focusedElement = document.activeElement;
    const focusedId = Object.keys(gridVideoRefs).find(
        id => gridVideoRefs[id] && gridVideoRefs[id].contains(focusedElement)
    );
    const gridVideo = gridVideoRefs[focusedId];
    if (!gridVideo) return;

    if (e.code === 'Space') {
        e.preventDefault();
        if (gridVideo.paused) gridVideo.play();
        else gridVideo.pause();
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        gridVideo.currentTime = Math.max(0, gridVideo.currentTime - 5);
    } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        gridVideo.currentTime = Math.min(gridVideo.duration, gridVideo.currentTime + 5);
    }
}

onMount(() => {
    if (!browser) return;

    document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
});


    // ✅ Initialize per-channel states before anything else
    channels.forEach(ch => {
        videoPositions[ch.id] = 0;
        videoStates[ch.id] = {
            paused: true,
            playbackRate: 1
        };
        playedChannels[ch.id] = false;
    });

    // ✅ Keyboard listener setup
    window.addEventListener('keydown', handleKeydown, {
        capture: true
    });

    // ✅ Resume any already played grid videos after mount
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
    window.removeEventListener('keydown', handleKeydown, {
        capture: true
    });

    clearTimeout(hoverTimeout);

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
    tabindex="0"
    role="button"
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
                } else {
                // reset new video position if never played
                gridVideoRefs[ch.id].currentTime = 0;
                }
                }}

                class="w-full h-full object-cover transform-gpu transition-transform duration-300 hover:scale-[1.03]"
                on:error={() => handleVideoError(gridVideoRefs[ch.id], ch.id)}
                ></video>
            <div class="absolute top-0 left-0 bg-black/50 text-white text-xs p-1">{ch.label}</div>
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
    <div
        class="relative w-full h-full"
        tabindex="0"
        role="button"
        aria-label="Expanded video view"
        >
        <video
            bind:this={videoRef}
            src={channels.find(ch => ch.id === activeChannel)?.src}
            loop={isLive}
            playsinline
            on:play={() => {
            isPaused = false;
            if (activeChannel) {
            playedChannels[activeChannel] = true;
            playedChannels = { ...playedChannels };
            }
            }}
            on:pause={() => isPaused = true}
            on:timeupdate={() => {
            if (activeChannel) {
            videoPositions[activeChannel] = videoRef.currentTime;
            progress = (videoRef.currentTime / (videoRef.duration || 1)) * 100;
            currentTime = formatTime(videoRef.currentTime);
            duration = formatTime(videoRef.duration);
            }
            }}
            class="w-full h-full object-cover outline-none"
            on:error={() => handleVideoError(videoRef, activeChannel)}
            >
            <track kind="captions" srclang="en" label="English captions" />
        </video>

        <div class="absolute top-0 left-0 bg-black/50 text-white text-xs p-1">{channels.find(ch => ch.id === activeChannel)?.label}</div>

        {#if !playedChannels[activeChannel]}
        <div class="absolute inset-0 bg-gray-700/70 flex items-center justify-center">
            <button
                type="button"
                class="bg-white/80 rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:bg-white/90 transition text-4xl text-gray-800"
                on:click={togglePlay}
                aria-label="Play video"
                >
                ▶
            </button>
        </div>
        {/if}

        <!-- Hover area for close button (top-right corner only) -->
        <div
            role="presentation"
            class="absolute top-0 right-0 w-6 h-6"
            on:mouseenter={() => hoverClose = true}
            on:mouseleave={() => hoverClose = false}
            >
            <!-- ✕ Close (shown only on hover in this area) -->
            <button
                type="button"
                class="bg-black/30 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                on:click={exitExpanded}
                aria-label="Close"
                >
                ✕
            </button>
        </div>

        <!-- 🎛️ Controls bar (bottom, shown on hover) -->
        {#if hover && playedChannels[activeChannel]}
        <div
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100%] bg-black/60 backdrop-blur-sm text-white flex flex-col items-center transition-opacity duration-100 p-1"
            >
            <!-- Progress bar with tooltip -->
            <div class="relative w-full">
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    bind:value={progress}
                    on:input={(e) => {
                if (videoRef && videoRef.duration) {
                const newTime = (e.target.value / 100) * videoRef.duration;
                videoRef.currentTime = newTime;
                }
                }}
                on:mousemove={showTooltip}
                on:mouseleave={() => tooltipVisible = false}
                on:touchmove={showTooltip}
                on:touchend={() => tooltipVisible = false}
                class="w-full h-1 accent-blue-500 cursor-pointer mb-1"
                />
                {#if tooltipVisible}
                <div class="absolute bg-black/80 text-white px-2 py-1 rounded text-xs -top-8" style="left: {tooltipLeft}px; transform: translateX(-50%);">
                    {tooltipTime}
                </div>
                {/if}
            </div>

            <!-- Time display -->
            <div class="flex justify-between w-full text-xs mt-1">
                <span>{currentTime}</span>
                <span>{duration}</span>
            </div>

            <!-- Buttons row -->
            <div class="flex items-center justify-between w-full py-1 text-lg select-none px-2">
                <div class="flex items-center gap-2 mx-auto">
                    <button
                        on:click={() => skip(-5)}
                        title="Back 5s"
                        class="hover:scale-110 transition"
                        >
                        ⏪
                    </button>

                    <button
                        on:click={togglePlay}
                        title={isPaused ? "Play" : "Pause"}
                        class="hover:scale-125 text-1xl transition"
                        >
                        {isPaused ? "▶" : "⏸"}
                    </button>

                    <button
                        on:click={() => skip(5)}
                        title="Forward 5s"
                        class="hover:scale-110 transition"
                        >
                        ⏩
                    </button>
                </div>

                <!-- Speed selector (rightmost) -->
                <select
                    bind:value={currentSpeed}
                    on:change={(e) => changeSpeed(currentSpeed)}
                    class="bg-black/60 text-white rounded px-1 py-0.5 text-xs hover:bg-black/80 transition mr-10"
                    >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                </select>
            </div>
        </div>
        {/if}

        <!-- Fullscreen Button (bottom-right corner) -->
        <button
    on:click={toggleFullscreen}
    class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition"
    title={isFullscreen ? 'Exit Fullscreen' : 'Full Preview'}
>
    {#if isFullscreen}
    <img src={minimize} alt="Minimize" class="w-4 h-4"/>
    {:else}
        <img src={maximize} alt="Maximize" class="w-4 h-4"/>
    {/if}
</button>

    </div>
    {/if}
</div>

<style>
#video-preview-container {
    transform: translateZ(0);
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

:global(.transform-gpu) {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
    will-change: transform;
}

:global(.hover-controls) {
    transform: translateZ(0);
    backface-visibility: hidden;
    will-change: opacity, transform;
}
</style>
