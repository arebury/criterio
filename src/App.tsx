import { useEffect, useRef, useState } from 'react';
import { useStore } from './state/store';
import { Nav } from './components/Nav';
import { SECTIONS, type Section } from './components/sections';
import { Synthesis } from './components/Synthesis';
import { Summaries } from './components/Summaries';
import { Articles } from './components/Articles';
import { Debate } from './components/Debate';
import { ReadingControls } from './components/ReadingControls';
import { ImportModal } from './components/ImportModal';
import { SettingsModal } from './components/SettingsModal';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';
import { TtsController, type TtsState } from './lib/tts';

export function App() {
  const { loading, current, currentDate } = useStore();
  const [active, setActive] = useState<Section>('sintesis');
  const [readingMode, setReadingMode] = useState(false);
  const [ttsState, setTtsState] = useState<TtsState>('idle');
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const contentRef = useRef<HTMLElement>(null);
  const ttsRef = useRef<TtsController | null>(null);
  if (!ttsRef.current) ttsRef.current = new TtsController(setTtsState);
  const tts = ttsRef.current;

  // Reset to the opening view whenever the selected issue changes.
  useEffect(() => {
    setActive('sintesis');
    tts.stop();
  }, [currentDate, tts]);

  // Reflect reading mode on <body> so the editorial styles can respond.
  useEffect(() => {
    document.body.classList.toggle('reading', readingMode);
    return () => document.body.classList.remove('reading');
  }, [readingMode]);

  const goTo = (section: Section) => {
    tts.stop();
    setActive(section);
  };

  const toggleReading = () => {
    setReadingMode((prev) => {
      if (prev) tts.stop();
      return !prev;
    });
  };

  const playTts = () => {
    const pane = contentRef.current?.querySelector<HTMLElement>('.section-pane.active');
    tts.play(pane?.innerText ?? '');
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <Nav
        active={active}
        onSelect={goTo}
        onOpenImport={() => setImportOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        hasIssue={!!current}
      />

      {loading ? (
        <div className="empty-state">
          <p>Cargando…</p>
        </div>
      ) : !current ? (
        <EmptyState onImport={() => setImportOpen(true)} />
      ) : (
        <main className="content" id="main" ref={contentRef}>
          <div className={`section-pane${active === 'sintesis' ? ' active' : ''}`}>
            <Synthesis issue={current} />
          </div>
          <div className={`section-pane${active === 'resumenes' ? ' active' : ''}`}>
            <Summaries issue={current} />
          </div>
          <div className={`section-pane${active === 'articulos' ? ' active' : ''}`}>
            <Articles issue={current} />
          </div>
          <div className={`section-pane${active === 'debate' ? ' active' : ''}`}>
            <Debate key={current.date} issue={current} />
          </div>
        </main>
      )}

      {current && (
        <ReadingControls
          readingMode={readingMode}
          ttsState={ttsState}
          onToggleReading={toggleReading}
          onPlay={playTts}
          onPause={() => tts.pause()}
          onStop={() => tts.stop()}
        />
      )}

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toast />

      {/* Reading-mode tabs are hidden via CSS; expose them here for context. */}
      {readingMode && current && (
        <div className="reading-tabs">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={active === s.id ? 'active' : ''}
              onClick={() => goTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
