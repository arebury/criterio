import { useMemo, useState } from 'react';
import type { Issue } from '../schema/issue';
import { optionLetter } from '../lib/letters';
import { buildDebateBundle, CLAUDE_NEW_CHAT_URL } from '../lib/debate';
import { CheckCircleIcon, ClipboardIcon } from './icons';

export function Debate({ issue }: { issue: Issue }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answered, setAnswered] = useState(0);
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

  const copyPrompt = async () => {
    if (!bundle) return;
    try {
      await navigator.clipboard.writeText(bundle.prompt);
      setCopied(true);
    } catch {
      setCopied(false);
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
        <div className={`correction-box visible ${bundle.isCorrect ? 'correct-ans' : 'wrong-ans'}`}>
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
            >
              Abrir Claude ↗
            </a>
            <span className="claude-hint">
              {copied
                ? '✓ Copiado. Pégalo en un chat de Claude.'
                : bundle.isCorrect
                  ? 'Tensa tu acierto en un chat real.'
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
