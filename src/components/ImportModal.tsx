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

type Tab = 'text' | 'file';

export function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { importIssue } = useStore();
  const [tab, setTab] = useState<Tab>('text');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  if (!open) return null;

  const tryImport = (raw: string) => {
    // Fallo más común del lector no técnico: copia la tarjeta del adjunto
    // ("Pegado text.txt · Documento") en vez del contenido del documento, así
    // que no hay JSON en absoluto. Si no aparece ninguna "{", apúntale al
    // arreglo real en vez de dar el mensaje genérico.
    if (!raw.includes('{')) {
      setErrors([
        'Parece que pegaste el nombre de un archivo, no su contenido. Abre el documento que generó Claude y copia el texto que empieza por «{».',
      ]);
      return;
    }
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

  // La ruta de archivo lee el contenido y lo pasa por el mismo parser tolerante,
  // así da igual que el archivo sea .json descargado de ChatGPT o un .txt.
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      tryImport(await file.text());
    } catch {
      setErrors(['No pude leer el archivo. Inténtalo otra vez o usa «Pegar texto».']);
    }
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setErrors([]);
  };

  return (
    <Modal title="Importar edición" onClose={onClose}>
      <div className="import-tabs" role="tablist">
        <button
          className={`import-tab ${tab === 'text' ? 'active' : ''}`}
          role="tab"
          aria-selected={tab === 'text'}
          onClick={() => switchTab('text')}
        >
          Pegar texto
        </button>
        <button
          className={`import-tab ${tab === 'file' ? 'active' : ''}`}
          role="tab"
          aria-selected={tab === 'file'}
          onClick={() => switchTab('file')}
        >
          Subir archivo
        </button>
      </div>

      {tab === 'text' ? (
        <>
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
        </>
      ) : (
        <>
          <p className="modal-desc">
            Pídele a Claude que te lo dé como <strong>archivo para descargar</strong>. Descárgalo y
            arrástralo aquí (o pulsa para elegirlo).
          </p>
          <label
            className={`import-dropzone ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files[0]);
            }}
          >
            <span className="import-dropzone-text">
              Arrastra aquí el archivo
              <br />o pulsa para elegirlo
            </span>
            <input
              type="file"
              accept=".json,.txt,application/json,text/plain"
              onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
            />
          </label>
        </>
      )}

      {errors.length > 0 && (
        <div className="import-errors" role="alert">
          <strong>No se pudo importar:</strong>
          <ul>
            {errors.slice(0, 8).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'text' && (
        <div className="modal-foot">
          <button
            className="btn btn-primary"
            disabled={!text.trim()}
            onClick={() => tryImport(text)}
          >
            Importar
          </button>
        </div>
      )}
    </Modal>
  );
}
