import { CopyPromptButton } from './CopyPromptButton';

export function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <div className="empty-state">
      <h1>Criterio</h1>
      <p>
        Lectura editorial profunda: resúmenes, síntesis y debate socrático sobre tu lote diario de
        artículos.
      </p>
      <button className="btn btn-primary" onClick={onImport}>
        Importar una edición
      </button>
      <p className="empty-hint">¿Aún no tienes una? Pídesela a Claude o ChatGPT:</p>
      <CopyPromptButton variant="ghost" />
    </div>
  );
}
