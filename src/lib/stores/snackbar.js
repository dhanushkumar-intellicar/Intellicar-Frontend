import { writable } from 'svelte/store';

// Initial state
const initialState = {
  show: false,
  message: '',
  type: 'info' // 'info', 'success', or 'error'
};

// Create the store
export const snackbar = writable(initialState);

// Helper functions to show different types of messages
export function showSnackbar(message, type = 'info') {
  snackbar.set({
    show: true,
    message,
    type
  });
}

export function showSuccess(message) {
  showSnackbar(message, 'success');
}

export function showError(message) {
  showSnackbar(message, 'error');
}

export function hideSnackbar() {
  snackbar.set(initialState);
}