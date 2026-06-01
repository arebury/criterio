import { useStore } from '../state/store';
import { formatSpanishDate } from '../lib/dates';
import { useInstallPrompt } from '../lib/useInstallPrompt';
import { Modal } from './Modal';
import { DownloadIcon, FolderIcon } from './icons';

type TextSize = 'normal' | 'grande' | 'enorme';

export function SettingsModal({
  open,
  onClose,
  textSize,
  onTextSize,
}: {
  open: boolean;
  onClose: () => void;
  textSize: TextSize;
  onTextSize: (size: TextSize) => void;
}) {
  const {
    fsSupported,
    exportDirName,
    chooseExportDir,
    clearExportDir,
    issues,
    isImported,
    removeIssue,
  } = useStore();
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!open) return null;

  const importedIssues = issues.filter((i) => isImported(i.date));

  return (
    <Modal title="Ajustes" onClose={onClose}>
      <section className="settings-block">
        <h3>Tamaño de letra</h3>
        <p className="modal-desc">Elige el tamaño del texto de lectura.</p>
        <div className="text-size-options">
          {(
            [
              ['normal', 'Normal'],
              ['grande', 'Grande'],
              ['enorme', 'Enorme'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              className={`text-size-btn${textSize === value ? ' active' : ''}`}
              aria-pressed={textSize === value}
              onClick={() => onTextSize(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {canInstall && (
        <section className="settings-block">
          <h3>Instalar como app</h3>
          <p className="modal-desc">
            Añade Criterio a tu pantalla de inicio para abrirlo como una app y leerlo sin conexión.
          </p>
          <button className="btn btn-primary" onClick={() => void promptInstall()}>
            <DownloadIcon size={16} />
            <span>Instalar Criterio</span>
          </button>
        </section>
      )}

      <section className="settings-block">
        <h3>Carpeta de exportación</h3>
        {fsSupported ? (
          <>
            <p className="modal-desc">
              Elige una carpeta una vez y cada descarga se guardará ahí con la fecha (
              <code>criterio-AAAA-MM-DD.html</code>), como la «Export location» de una app nativa.
            </p>
            <div className="modal-row">
              <button className="btn btn-primary" onClick={() => void chooseExportDir()}>
                {exportDirName ? 'Cambiar carpeta' : 'Elegir carpeta'}
              </button>
              {exportDirName && (
                <button className="btn btn-ghost" onClick={() => void clearExportDir()}>
                  Quitar
                </button>
              )}
            </div>
            <p className="settings-status">
              {exportDirName ? (
                <span className="folder-pill">
                  <FolderIcon size={15} />
                  Carpeta actual: <strong>{exportDirName}</strong>
                </span>
              ) : (
                <>Sin carpeta fija — las descargas irán a tu carpeta de Descargas.</>
              )}
            </p>
          </>
        ) : (
          <p className="modal-desc">
            Tu navegador no permite elegir carpeta de descarga (es el caso de Safari). Las descargas
            irán a la carpeta <strong>Descargas</strong> con nombre fechado. Para fijar una carpeta,
            usa Chrome, Edge, Brave o Arc.
          </p>
        )}
      </section>

      <section className="settings-block">
        <h3>Ediciones importadas</h3>
        {importedIssues.length === 0 ? (
          <p className="modal-desc">Aún no has importado ninguna edición.</p>
        ) : (
          <ul className="settings-list">
            {importedIssues.map((issue) => (
              <li key={issue.date}>
                <span>{formatSpanishDate(issue.date)}</span>
                <button className="link-danger" onClick={() => removeIssue(issue.date)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Modal>
  );
}
