import { useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Captures the browser's install prompt at module load (Chromium fires
 * `beforeinstallprompt` once, early — we must listen before any component
 * mounts) and exposes it through a hook so our own UI can offer "Instalar".
 * iOS never fires the event, so `canInstall` stays false there (the user
 * installs via the Share sheet instead).
 */
let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    emit();
  });
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useInstallPrompt(): { canInstall: boolean; promptInstall: () => Promise<void> } {
  const current = useSyncExternalStore(
    subscribe,
    () => deferred,
    () => null,
  );

  const promptInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    emit();
  };

  return { canInstall: current !== null, promptInstall };
}
