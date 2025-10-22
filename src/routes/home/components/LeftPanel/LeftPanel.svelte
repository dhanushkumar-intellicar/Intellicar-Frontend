<script>
  import RecordedSection from "./RecordedSection.svelte";
  import LiveSection from "./LiveSection.svelte";

  export let onVideoSelect = () => {};
  export let onStopAllVideos = () => {};

  let currentView = "recorded";
  let recordedSectionRef;
  let liveSectionRef;

  function handleVideoSelect(videoInfo) {
    recordedSectionRef?.stopAllVideos?.();
    liveSectionRef?.stopAllVideos?.();
    onVideoSelect(videoInfo);
  }

  function handleTabSwitch(newView) {
    currentView = newView;
    recordedSectionRef?.stopAllVideos?.();
    liveSectionRef?.stopAllVideos?.();
    onStopAllVideos();
  }
</script>

<div class="max-w-md mx-auto bg-gray-50 rounded-xl shadow-md overflow-hidden h-full flex flex-col">
  <div class="grid grid-cols-2 border-b bg-white">
    <button
      class="p-3 text-center cursor-pointer font-semibold transition
      {currentView === 'recorded'
        ? 'bg-blue-600 text-white'
        : 'hover:bg-gray-100 text-gray-700'}"
      on:click={() => handleTabSwitch('recorded')}
    >
      Recorded
    </button>
    <button
      class="p-3 text-center cursor-pointer font-semibold transition
      {currentView === 'live'
        ? 'bg-green-600 text-white'
        : 'hover:bg-gray-100 text-gray-700'}"
      on:click={() => handleTabSwitch('live')}
    >
      Live
    </button>
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if currentView === 'recorded'}
      <RecordedSection 
        bind:this={recordedSectionRef} 
        onVideoSelect={handleVideoSelect} 
      />
    {:else}
      <LiveSection 
        bind:this={liveSectionRef} 
        onVideoSelect={handleVideoSelect} 
      />
    {/if}
  </div>
</div>