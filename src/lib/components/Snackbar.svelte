<script>
  import { fade } from 'svelte/transition';
  import { snackbar } from '$lib/stores/snackbar';

  // Auto-hide duration in milliseconds
  const DURATION = 3000;
  let timeoutId;

  // Handle closing the snackbar
  function close() {
    $snackbar = { show: false, message: '', type: 'info' };
  }

  // Auto-hide the snackbar after duration
  $: if ($snackbar.show) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(close, DURATION);
  }
</script>

{#if $snackbar.show}
  <div
    transition:fade={{ duration: 300 }}
    class="fixed bottom-6 right-6 z-[9999] min-w-[320px] max-w-[420px]"
  >
    <div
      class="flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-sm border 
      {$snackbar.type === 'error'
        ? 'bg-red-50/90 border-red-200 text-red-800'
        : $snackbar.type === 'success'
        ? 'bg-green-50/90 border-green-200 text-green-800'
        : 'bg-blue-50/90 border-blue-200 text-blue-800'}"
    >
      <!-- Modern Icon -->
      <div class="flex-shrink-0 mt-0.5">
        {#if $snackbar.type === 'error'}
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {:else if $snackbar.type === 'success'}
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {:else}
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {/if}
      </div>

      <!-- Message with optional title -->
      <div class="flex-1 relative">
        <p class="font-medium">
          {#if $snackbar.type === 'error'}
            Error
          {:else if $snackbar.type === 'success'}
            Success
          {:else}
            Information
          {/if}
        </p>
        <p class="text-sm opacity-90 mt-0.5">{$snackbar.message}</p>
      </div>

      <!-- Modern Close button -->
      <button
        on:click={close}
        class="flex-shrink-0 -mt-1 -mr-1 p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
{/if}