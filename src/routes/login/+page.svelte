<script>
  import { onMount } from 'svelte';

  // Environment variable (from .env)
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  let isAuthenticating = false;
  let errorMessage = '';

  // ✅ Redirect already logged-in users away from login page
  onMount(() => {
    const token = localStorage.getItem('authToken'); // or sessionStorage
    if (token) {
      window.location.replace('/home'); // use replace so no back navigation
    }
  });

  // Handle Google login popup
  const handleGoogleLogin = () => {
    isAuthenticating = true;
    errorMessage = '';

    const popup = window.open(
      `${API_BASE_URL}/auth/google`,
      'googleLogin',
      'width=500,height=600'
    );

    window.addEventListener('message', (event) => {
      if (event.origin !== API_BASE_URL && !event.origin.includes('localhost')) {
        console.warn('Untrusted origin:', event.origin);
        return;
      }

      if (event.data.type === 'google-auth-success') {
        // ✅ Store token if your backend returns it
        localStorage.setItem('authToken', event.data.token);

        popup?.close();

        // ✅ Use replace so user can’t go back to /login
        window.location.replace('/home');
      }
    });
  };
</script>

<!-- Your same UI code below -->
<div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
  <div class="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-sm text-center border border-gray-100 transition-transform hover:scale-[1.02] duration-300">
    <div class="flex flex-col items-center mb-6">
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        class="w-12 h-12 mb-3"
      />
      <h1 class="text-3xl font-bold text-gray-800 tracking-tight">Welcome Back</h1>
      <p class="text-gray-500 mt-1 text-sm">Sign in securely to continue</p>
    </div>

    <button
      on:click={handleGoogleLogin}
      class="w-full bg-white border border-gray-300 hover:border-blue-500 hover:shadow-md text-gray-700 py-2.5 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={isAuthenticating}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        class="w-5 h-5"
      />
      <span class="font-medium text-sm md:text-base">
        {isAuthenticating ? 'Signing in...' : 'Continue with Google'}
      </span>
    </button>

    {#if errorMessage}
      <p class="text-red-500 text-sm mt-4">{errorMessage}</p>
    {/if}

    <p class="mt-6 text-xs text-gray-400">
      By continuing, you agree to our
      <a href="/" class="text-blue-500 hover:underline">Terms</a> &
      <a href="/" class="text-blue-500 hover:underline">Privacy Policy</a>.
    </p>
  </div>
</div>
