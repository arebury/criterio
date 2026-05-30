import { useStore } from '../state/store';

export function Toast() {
  const { toast, dismissToast } = useStore();
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.kind}`} role="status" onClick={dismissToast}>
      {toast.message}
    </div>
  );
}
