/**
 * Delete Warning Audio Utility
 * Plays a warning sound when deleting items to draw attention
 * Works across all modules (documents, invoices, deceased, etc.)
 */

let audioContext = null;
let hasWarnedAboutAudio = false;

/**
 * Initialize AudioContext (needs user interaction first)
 */
const getAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not available');
      return null;
    }
  }
  return audioContext;
};

/**
 * Play a warning tone before dangerous operations
 * @param {string} type - 'warning' | 'error' | 'success'
 */
export const playWarningSound = (type = 'warning') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'warning') {
      // Attention-grabbing two-tone warning
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } else if (type === 'error') {
      // Deep error tone
      oscillator.frequency.setValueAtTime(330, ctx.currentTime);
      oscillator.frequency.setValueAtTime(220, ctx.currentTime + 0.2);
      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } else if (type === 'success') {
      // Quick success chime
      oscillator.frequency.setValueAtTime(523, ctx.currentTime);
      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    if (!hasWarnedAboutAudio) {
      console.warn('Audio warning not available:', e.message);
      hasWarnedAboutAudio = true;
    }
  }
};

/**
 * Show a confirmation dialog with audio warning.
 * Plays warning sound BEFORE showing the dialog.
 * @param {string} title - Dialog title
 * @param {string} text - Dialog body text
 * @param {object} swal - SweetAlert2 instance
 * @returns {Promise<boolean>} - true if confirmed
 */
export const confirmWithWarning = async (title, text, swal) => {
  // Play warning sound first
  playWarningSound('warning');
  
  // Small delay to let audio play before dialog appears
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const result = await swal.fire({
    icon: 'warning',
    title: title || 'Are you sure?',
    text: text || 'This action cannot be undone.',
    showCancelButton: true,
    confirmButtonColor: '#DC2626',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    showClass: {
      popup: 'swal2-noanimation',
      backdrop: 'swal2-noanimation'
    }
  });
  
  return result.isConfirmed;
};

/**
 * Get all registered users for the current tenant (for call directory)
 * @param {function} apiCall - API function to get users
 * @returns {Promise<Array>}
 */
export const getOnlineUsersForCallDirectory = async (apiCall) => {
  try {
    const response = await apiCall();
    return response?.data?.data || [];
  } catch (e) {
    console.warn('Failed to fetch online users:', e);
    return [];
  }
};

export default {
  playWarningSound,
  confirmWithWarning,
  getOnlineUsersForCallDirectory
};