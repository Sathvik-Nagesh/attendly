/**
 * Attendex — Institutional Haptic Engine
 * 
 * Provides tactile feedback for critical UI interactions
 * following high-fidelity mobile standards.
 */

export const haptics = {
  // Light vibration for simple toggle/button clicks
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Stronger pulse for successful transactions (e.g. Finalize Sync)
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20, 30, 20]);
    }
  },
  
  // Sharp vibration for errors or blocked actions
  error: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  },
  
  // Medium feedback for mode switches (List/Grid)
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }
  }
};


