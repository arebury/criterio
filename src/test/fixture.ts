import type { Issue } from '../schema/issue';

/** A minimal but fully valid issue, used across unit tests. */
export const validIssue: Issue = {
  version: 1,
  date: '2026-05-30',
  title: 'Edición de prueba',
  synthesis: ['Primer párrafo de la síntesis.', 'Segundo párrafo.'],
  summaries: [{ num: '01', title: 'Resumen uno', text: 'Texto del resumen uno.' }],
  articles: [
    { title: 'Artículo uno', content: 'Notas del artículo uno.' },
    { title: 'Artículo dos', content: 'Notas del artículo dos.' },
  ],
  questions: [
    {
      q: '¿Pregunta de ejemplo?',
      options: ['Opción A', 'Opción B', 'Opción C'],
      correct: 1,
      trap: 0,
      articleRefs: [0, 1],
      explanation: 'Porque B es la mejor opción.',
    },
  ],
};
