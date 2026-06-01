import { useState } from 'react';
import type { Issue } from '../schema/issue';
import { useStore } from '../state/store';
import { shareIssue } from '../lib/share';
import { ShareIcon } from './icons';

/**
 * Shares the day's synthesis: native share sheet on mobile, clipboard copy on
 * desktop. A quiet ghost action so it never competes with reading.
 */
export function ShareButton({ issue }: { issue: Issue }) {
  const { notify } = useStore();
  const [busy, setBusy] = useState(false);

  const onShare = async () => {
    setBusy(true);
    const result = await shareIssue(issue);
    setBusy(false);
    if (result === 'copied') notify('Resumen copiado. Pégalo donde quieras compartirlo.');
    else if (result === 'failed') notify('No se pudo compartir.', 'error');
    // 'shared' / 'cancelled' → the system sheet handled it; stay quiet.
  };

  return (
    <button className="btn btn-ghost share-btn" onClick={() => void onShare()} disabled={busy}>
      <ShareIcon size={16} />
      <span>Compartir</span>
    </button>
  );
}
