import { useEffect, useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu with the Escape key.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav>
      <span className="brand">Criterio</span>

      {hasIssue && (
        <div className="nav-tabs">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`nav-tab${active === section.id ? ' active' : ''}`}
              aria-current={active === section.id ? 'page' : undefined}
              onClick={() => onSelect(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
      )}

      {/* Mobile-only trigger that collapses the actions below into a menu. */}
      <button
        className="nav-burger"
        aria-label="Menú"
        aria-expanded={menuOpen}
        aria-controls="nav-actions"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
        <span>Menú</span>
      </button>

      <div className={`nav-actions${menuOpen ? ' open' : ''}`} id="nav-actions">
        {issues.length > 1 && currentDate && (
          <select
            className="issue-select"
            value={currentDate}
            onChange={(e) => {
              selectIssue(e.target.value);
              closeMenu();
            }}
            aria-label="Elegir edición"
          >
            {issues.map((issue) => (
              <option key={issue.date} value={issue.date}>
                {formatSpanishDate(issue.date)}
              </option>
            ))}
          </select>
        )}
        <button
          className="nav-icon"
          onClick={() => {
            onOpenImport();
            closeMenu();
          }}
          title="Importar edición"
        >
          <ImportIcon size={16} />
          <span>Importar</span>
        </button>
        <button
          className="nav-icon"
          onClick={() => {
            onOpenSettings();
            closeMenu();
          }}
          title="Ajustes"
        >
          <SettingsIcon size={17} />
          <span>Ajustes</span>
        </button>
        {hasIssue && (
          <button
            className="nav-icon dl-btn"
            onClick={() => {
              void exportCurrent();
              closeMenu();
            }}
            title="Descargar"
          >
            <DownloadIcon size={16} />
            <span>Descargar</span>
          </button>
        )}
      </div>

      {menuOpen && (
        <button
          className="nav-menu-backdrop"
          aria-hidden="true"
          tabIndex={-1}
          onClick={closeMenu}
        />
      )}
    </nav>
  );
}
