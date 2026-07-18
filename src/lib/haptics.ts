// Centralized haptic feedback for consistent device interactions
// Safe to call on any platform, gracefully falls back if not supported

export function vibrateSuccess() {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(30);
    } catch (e) {
      // Ignore
    }
  }
}

export function vibrateLight() {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(10);
    } catch (e) {
      // Ignore
    }
  }
}

export function vibrateError() {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate([20, 50, 20]);
    } catch (e) {
      // Ignore
    }
  }
}
