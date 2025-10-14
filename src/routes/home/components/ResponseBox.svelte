<script>
  export let responseData = {};
</script>

{#if Object.keys(responseData).length > 0}
  <div class="font-mono text-xs bg-white rounded-lg p-2 shadow-inner border border-gray-300">
    <pre>{JSON.stringify(responseData, null, 2)}</pre>
  </div>
{:else}
  <div class="text-gray-500 text-center text-sm">No response yet</div>
{/if}
