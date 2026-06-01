import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import type { Issue } from '../schema/issue';
import { optionLetter } from '../lib/letters';
import { buildDebateBundle, CLAUDE_NEW_CHAT_URL } from '../lib/debate';
import { loadDebateProgress, saveDebateProgress } from '../lib/storage';
import { CheckCircleIcon, ClipboardIcon } from './icons';

export function Debate({ issue }: { issue: Issue }) {
  // Resume where the reader left off — progress is persisted per edition so an
  // elderly reader can work through the 8 questions across several sittings.
  const saved = useMemo(() => loadDebateProgress(issue.date), [issue.date]);
  const [currentQ, setCurrentQ] = useState(saved?.currentQ ?? 0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(saved?.selectedOpt ?? null);
  const [submitted, setSubmitted] = useState(saved?.submitted ?? false);
  const [answered, setAnswered] = useState(saved?.answered ?? 0);
  const [copied, setCopied] = useState(false);

  const total = issue.questions.length;
  const done = currentQ >= total;
  const question = done ? null : issue.questions[currentQ];

  const bundle = useMemo(
    () =>
      submitted && question && selectedOpt !== null
        ? buildDebateBundle(issue, currentQ, selectedOpt)
        : null,
    [submitted, question, selectedOpt, issue, currentQ],
  );

  // Persist progress on every change (cheap localStorage write).
  useEffect(() => {
    saveDebateProgress(issue.date, { currentQ, selectedOpt, submitted, answered });
  }, [issue.date, currentQ, selectedOpt, submitted, answered]);

  const next = () => {
    setCurrentQ((q) => q + 1);
    setSelectedOpt(null);
    setSubmitted(false);
    setCopied(false);
  };

  const submit = () => {
    if (selectedOpt === null || submitted) return;
    setSubmitted(true);
    setAnswered((n) => n + 1);
  };

  const coarsePointer =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;

  const copyText = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for browsers without the async clipboard API.
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  };

  const copyPrompt = async () => {
    if (!bundle) return;
    setCopied(await copyText(bundle.prompt));
  };

  // On phones, copy the prompt and then navigate in the same tab so the Claude
  // app (if installed) opens via its universal link. On desktop, let the anchor
  // open a new tab and copy in the background.
  const openClaude = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!bundle) return;
    if (coarsePointer) {
      e.preventDefault();
      void copyText(bundle.prompt).then((ok) => {
        setCopied(ok);
        window.location.href = CLAUDE_NEW_CHAT_URL;
      });
    } else {
      void copyText(bundle.prompt).then(setCopied);
    }
  };

  if (done) {
    return (
      <div className="debate-complete">
        <span className="debate-complete-mark" aria-hidden="true">
          <CheckCircleIcon size={40} />
        </span>
        <h2>Debate completado</h2>
        <p>
          {answered} de {total} preguntas respondidas.
        </p>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setCurrentQ(0);
            setSelectedOpt(null);
            setSubmitted(false);
            setAnswered(0);
          }}
        >
          Reiniciar debate
        </button>
      </div>
    );
  }

  const q = question!;

  return (
    <>
      <div className="debate-progress-label">
        Pregunta {currentQ + 1} de {total}
      </div>
      <div className="progress-dots">
        {issue.questions.map((_, i) => (
          <span
            key={i}
            className={`dot${i < currentQ ? ' done' : i === currentQ ? ' current' : ''}`}
          />
        ))}
      </div>

      <p className="question-text">{q.q}</p>

      {q.options.map((opt, i) => {
        const classes = ['option-btn'];
        if (!submitted && selectedOpt === i) classes.push('selected');
        if (submitted && i === q.correct) classes.push('correct-opt');
        else if (submitted && i === selectedOpt) classes.push('wrong-opt');
        return (
          <button
            key={i}
            className={classes.join(' ')}
            disabled={submitted}
            onClick={() => setSelectedOpt(i)}
          >
            {optionLetter(i)}) {opt}
          </button>
        );
      })}

      {submitted && bundle && (
        <div
          className={`correction-box visible ${bundle.isCorrect ? 'correct-ans' : 'wrong-ans'}`}
          aria-live="polite"
        >
          <div className={`correction-verdict ${bundle.isCorrect ? 'ok' : 'bad'}`}>
            {bundle.isCorrect
              ? '✓ Correcto'
              : `✗ Incorrecto — la respuesta era ${bundle.correctLetter})`}
          </div>
          <div className="correction-label">Por qué</div>
          <p className="correction-text">{q.explanation}</p>

          <div className="claude-row">
            <button className="btn btn-ghost" onClick={copyPrompt}>
              <ClipboardIcon size={16} />
              <span>Copiar debate para Claude</span>
            </button>
            <a
              className="btn btn-ghost"
              href={CLAUDE_NEW_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={openClaude}
            >
              Abrir Claude ↗
            </a>
            <span className="claude-hint">
              {copied
                ? '✓ Copiado. Pégalo en un chat de Claude.'
                : bundle.isCorrect
                  ? 'Pon a prueba tu respuesta en un chat real.'
                  : 'Lleva tu error a debate: el prompt es más exigente.'}
            </span>
          </div>

          <details className="prompt-details">
            <summary>Ver / editar el prompt</summary>
            <textarea className="prompt-textarea" readOnly value={bundle.prompt} rows={10} />
          </details>
        </div>
      )}

      <div className="debate-actions">
        {!submitted ? (
          <button className="btn btn-primary" disabled={selectedOpt === null} onClick={submit}>
            Enviar respuesta
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={next}>
            {currentQ + 1 < total ? 'Siguiente pregunta →' : 'Ver resumen →'}
          </button>
        )}
      </div>
    </>
  );
}
