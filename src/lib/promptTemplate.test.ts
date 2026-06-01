import { describe, it, expect } from 'vitest';
import { CRITERIO_PROMPT } from './promptTemplate';

describe('CRITERIO_PROMPT', () => {
  it('embeds every field of the edition contract so it works in a plain chat', () => {
    for (const key of [
      'version',
      'date',
      'title',
      'synthesis',
      'summaries',
      'articles',
      'questions',
    ]) {
      expect(CRITERIO_PROMPT).toContain(`"${key}"`);
    }
  });

  it('states the hard rules the schema enforces', () => {
    expect(CRITERIO_PROMPT).toContain('8 preguntas');
    expect(CRITERIO_PROMPT).toContain('5 opciones');
    expect(CRITERIO_PROMPT).toMatch(/empezando en 0/);
  });

  it('ends by inviting the articles, so the reader only has to paste', () => {
    expect(CRITERIO_PROMPT.trimEnd().endsWith('debajo de esta línea:')).toBe(true);
  });
});
