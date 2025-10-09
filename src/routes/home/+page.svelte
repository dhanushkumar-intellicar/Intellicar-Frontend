<script>
  import Dashboard from '$lib/components/Dashboard.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.replace('/');
    }
  });
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
  <Dashboard />
</div>
