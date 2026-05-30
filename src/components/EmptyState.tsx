export function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <div className="empty-state">
      <h1>Criterio</h1>
      <p>
        Lectura editorial profunda: resúmenes, síntesis y debate socrático sobre tu lote diario de
        artículos. Importa una edición para empezar.
      </p>
      <button className="btn btn-primary" onClick={onImport}>
        Importar una edición
      </button>
    </div>
  );
}
