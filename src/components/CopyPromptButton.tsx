import { useState } from 'react';
import { useStore } from '../state/store';
import { copyText } from '../lib/clipboard';
import { CRITERIO_PROMPT } from '../lib/promptTemplate';
import { CheckCircleIcon, ClipboardIcon } from './icons';

/**
 * Copies the self-contained Criterio prompt so the reader can paste it into
 * Claude or ChatGPT and just add their articles. Used in the empty state and in
 * the import dialog's "Pedir a la IA" tab.
 */
export function CopyPromptButton({ variant = 'primary' }: { variant?: 'primary' | 'ghost' }) {
  const { notify } = useStore();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const ok = await copyText(CRITERIO_PROMPT);
    setCopied(ok);
    notify(
      ok
        ? 'Instrucciones copiadas. Pégalas en Claude o ChatGPT y añade tus artículos.'
        : 'No se pudo copiar. Inténtalo de nuevo.',
      ok ? 'ok' : 'error',
    );
  };

  return (
    <button className={`btn btn-${variant}`} onClick={onCopy}>
      {copied ? <CheckCircleIcon size={16} /> : <ClipboardIcon size={16} />}
      <span>{copied ? 'Instrucciones copiadas' : 'Copiar instrucciones'}</span>
    </button>
  );
}
