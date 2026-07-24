const PIN_STORAGE_KEY = 'cham_prod_manager_pin_v1';
const PIN_ENABLED_KEY = 'cham_prod_pin_enabled_v1';
const DEFAULT_PIN = '1234';

let sessionUnlocked = false;

export function isPinEnabled(): boolean {
  try {
    const val = localStorage.getItem(PIN_ENABLED_KEY);
    if (val !== null) {
      return val === 'true';
    }
  } catch (e) {
    console.error('Failed to get PIN status:', e);
  }
  return true; // Enabled by default
}

export function setPinEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(PIN_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save PIN status:', e);
  }
}

export function getStoredPin(): string {
  try {
    const pin = localStorage.getItem(PIN_STORAGE_KEY);
    if (pin && pin.length >= 4) {
      return pin;
    }
  } catch (e) {
    console.error('Failed to get PIN:', e);
  }
  return DEFAULT_PIN;
}

export function savePin(pin: string): boolean {
  if (!pin || pin.length < 4) return false;
  try {
    localStorage.setItem(PIN_STORAGE_KEY, pin);
    return true;
  } catch (e) {
    console.error('Failed to save PIN:', e);
    return false;
  }
}

export function verifyPin(inputPin: string): boolean {
  const currentPin = getStoredPin();
  if (inputPin === currentPin) {
    sessionUnlocked = true;
    return true;
  }
  return false;
}

export function isSessionUnlocked(): boolean {
  if (!isPinEnabled()) return true;
  return sessionUnlocked;
}

export function setSessionUnlocked(unlocked: boolean): void {
  sessionUnlocked = unlocked;
}

export function isDefaultPin(): boolean {
  return getStoredPin() === DEFAULT_PIN;
}
