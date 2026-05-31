import { useState } from 'react';
import { useStore } from '../state/store';
import { validateIssue } from '../schema/issue';
import { Modal } from './Modal';

/**
 * Extracts the edition JSON from whatever the user pasted. Tolerant on purpose:
 * Claude (or ChatGPT) usually prints the JSON inside a ```json code fence and
 * sometimes with a line of prose before or after. We strip the fence and pull
 * out the first balanced { … } object so the reader can just paste and import.
 */
function extractIssueJson(raw: string): string {
  let text = raw.trim();

  // 1) Unwrap a markdown code fence: ```json … ``` or ``` … ```
  const fence = text.match(/```[a-zA-Z]*\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();

  // 2) Already a clean object → use as-is
  if (text.startsWith('{')) return text;

  // 3) Otherwise pull the first balanced { … } block out of surrounding prose
  const start = text.indexOf('{');
  if (start === -1) return text;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
    } else if (c === '{') {
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}

export function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { importIssue } = useStore();
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  if (!open) return null;

  const tryImport = (raw: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(extractIssueJson(raw));
    } catch {
      setErrors([
        'No he reconocido el texto pegado. Copia de nuevo todo lo que generó Claude e inténtalo otra vez.',
      ]);
      return;
    }
    const result = validateIssue(parsed);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    setText('');
    importIssue(result.issue);
    onClose();
  };

  return (
    <Modal title="Importar edición" onClose={onClose}>
      <p className="modal-desc">
        Pega aquí el texto que copiaste de Claude y pulsa <strong>«Importar»</strong>. No te
        preocupes por el formato: yo me encargo del resto.
      </p>

      <textarea
        className="import-textarea"
        placeholder="Pega aquí el texto que copiaste…"
        value={text}
        rows={12}
        autoFocus
        onChange={(e) => setText(e.target.value)}
      />

      {errors.length > 0 && (
        <div className="import-errors">
          <strong>No se pudo importar:</strong>
          <ul>
            {errors.slice(0, 8).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="modal-foot">
        <button className="btn btn-primary" disabled={!text.trim()} onClick={() => tryImport(text)}>
          Importar
        </button>
      </div>
    </Modal>
  );
}
