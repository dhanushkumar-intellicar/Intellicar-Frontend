<script>
  export let responseData = null;
  export let onlyJson = false;
</script>

{#if responseData}
  {#if onlyJson}
    <!-- Only JSON output -->
    <pre class="text-xs bg-gray-900 text-green-300 p-3 rounded-lg overflow-x-auto">
{JSON.stringify(responseData, null, 2)}
    </pre>
  {:else}
    <!-- Normal box layout -->
    <div class="bg-gray-50 p-3 rounded-lg border shadow-sm">
      <h3 class="text-sm font-semibold mb-1 text-gray-700">Response:</h3>
      <pre class="text-xs rounded-lg overflow-x-auto">
{JSON.stringify(responseData, null, 2)}
      </pre>
    </div>
  {/if}
{:else}
  <p class="text-gray-500 text-sm">No response available.</p>
{/if}
