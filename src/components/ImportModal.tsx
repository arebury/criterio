import { useRef, useState } from 'react';
import { useStore } from '../state/store';
import { validateIssue } from '../schema/issue';
import { Modal } from './Modal';

export function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { importIssue } = useStore();
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const tryImport = (raw: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setErrors(['El texto no es JSON válido.']);
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

  const onFile = async (file: File) => {
    const content = await file.text();
    setText(content);
    tryImport(content);
  };

  return (
    <Modal title="Importar edición" onClose={onClose}>
      <p className="modal-desc">
        Pega el JSON generado por la skill de Claude (o por cualquier fuente que cumpla el contrato
        de datos), o sube el archivo <code>.json</code>.
      </p>

      <div className="modal-row">
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          Subir archivo .json
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
      </div>

      <textarea
        className="import-textarea"
        placeholder='{ "version": 1, "date": "2026-05-30", "title": "…", "synthesis": [...], "summaries": [...], "articles": [...], "questions": [...] }'
        value={text}
        rows={10}
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
