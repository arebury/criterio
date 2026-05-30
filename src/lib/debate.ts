import type { Issue, Question } from '../schema/issue';
import { optionLetter } from './letters';

/** A fresh Claude.ai conversation. The prompt is copied to the clipboard so the
 *  user can paste it here — no API key, no extra cost on top of a subscription. */
export const CLAUDE_NEW_CHAT_URL = 'https://claude.ai/new';

export interface DebateBundle {
  isCorrect: boolean;
  selectedLetter: string;
  correctLetter: string;
  /** Self-contained prompt to paste into a real Claude chat. */
  prompt: string;
}

/**
 * Build a self-contained Socratic debate prompt. Unlike the original artifact
 * (which relied on a Claude session that already had the skill loaded), this
 * prompt carries all the context it needs, so it works pasted into any fresh
 * Claude conversation. The instruction escalates when the answer is wrong.
 */
export function buildDebateBundle(
  issue: Issue,
  questionIndex: number,
  selectedIndex: number,
): DebateBundle {
  const question: Question = issue.questions[questionIndex];
  const isCorrect = selectedIndex === question.correct;
  const selectedLetter = optionLetter(selectedIndex);
  const correctLetter = optionLetter(question.correct);

  const optionsBlock = question.options.map((opt, i) => `${optionLetter(i)}) ${opt}`).join('\n');

  const refs = (question.articleRefs ?? []).filter((i) => i < issue.articles.length);
  const contextBlock = refs.length
    ? refs.map((i) => `- ${issue.articles[i].title}: ${issue.articles[i].content}`).join('\n')
    : `- Síntesis del día: ${issue.synthesis[0]}`;

  const role =
    'Actúa como un sparring intelectual socrático, no como un validador. Tono directo, ' +
    'estimulante y sin condescendencia. NO repitas la corrección que ya he leído: ve más ' +
    'allá con lo que los artículos no decían explícitamente y abre una tensión o ' +
    'contradicción que me obligue a pensar.';

  const stance = isCorrect
    ? 'Acerté esta pregunta. No te limites a felicitarme: tensa mi respuesta, muéstrame el ' +
      'mejor contraargumento contra la opción correcta y dónde podría fallar en otro contexto.'
    : 'Fallé esta pregunta. Contraargumenta por qué mi elección es atractiva pero ' +
      'insuficiente, y defiende la mejor opción con un argumento que la corrección base no ' +
      'daba. Sé exigente conmigo.';

  const prompt = [
    `[CRITERIO · Debate socrático — Pregunta ${questionIndex + 1}/${issue.questions.length}]`,
    '',
    role,
    stance,
    '',
    `PREGUNTA: ${question.q}`,
    '',
    'OPCIONES:',
    optionsBlock,
    '',
    `MI RESPUESTA: ${selectedLetter}) ${question.options[selectedIndex]} ` +
      `(${isCorrect ? '✓ correcta' : '✗ incorrecta'})`,
    `MEJOR OPCIÓN: ${correctLetter}) ${question.options[question.correct]}`,
    '',
    `CORRECCIÓN QUE YA HE LEÍDO (no la repitas): ${question.explanation}`,
    '',
    'CONTEXTO (extractos de los artículos del día):',
    contextBlock,
    '',
    'Cierra invitándome a pasar a la siguiente pregunta cuando quiera.',
  ].join('\n');

  return { isCorrect, selectedLetter, correctLetter, prompt };
}
