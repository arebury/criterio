import { useStore } from '../state/store';
import { formatSpanishDate } from '../lib/dates';
import { SECTIONS, type Section } from './sections';
import { DownloadIcon, ImportIcon, SettingsIcon } from './icons';

interface NavProps {
  active: Section;
  onSelect: (section: Section) => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  hasIssue: boolean;
}

export function Nav({ active, onSelect, onOpenImport, onOpenSettings, hasIssue }: NavProps) {
  const { issues, currentDate, selectIssue, exportCurrent } = useStore();

  return (
    <nav>
      <span className="brand">Criterio</span>

      {hasIssue &&
        SECTIONS.map((section) => (
          <button
            key={section.id}
            className={`nav-tab${active === section.id ? ' active' : ''}`}
            aria-current={active === section.id ? 'page' : undefined}
            onClick={() => onSelect(section.id)}
          >
            {section.label}
          </button>
        ))}

      <div className="nav-actions">
        {issues.length > 1 && currentDate && (
          <select
            className="issue-select"
            value={currentDate}
            onChange={(e) => selectIssue(e.target.value)}
            aria-label="Elegir edición"
          >
            {issues.map((issue) => (
              <option key={issue.date} value={issue.date}>
                {formatSpanishDate(issue.date)}
              </option>
            ))}
          </select>
        )}
        <button className="nav-icon" onClick={onOpenImport} title="Importar edición">
          <ImportIcon size={16} />
          <span>Importar</span>
        </button>
        <button className="nav-icon" onClick={onOpenSettings} title="Ajustes" aria-label="Ajustes">
          <SettingsIcon size={17} />
        </button>
        {hasIssue && (
          <button
            className="nav-icon dl-btn"
            onClick={() => void exportCurrent()}
            title="Descargar"
          >
            <DownloadIcon size={16} />
            <span>Descargar</span>
          </button>
        )}
      </div>
    </nav>
  );
}
