import { describe, it, expect } from 'vitest';
import { buildDebateBundle } from './debate';
import { validIssue } from '../test/fixture';

describe('buildDebateBundle', () => {
  it('marks a correct answer and derives letters', () => {
    const bundle = buildDebateBundle(validIssue, 0, 1); // correct is index 1 → "B"
    expect(bundle.isCorrect).toBe(true);
    expect(bundle.selectedLetter).toBe('B');
    expect(bundle.correctLetter).toBe('B');
    expect(bundle.prompt).toContain('✓ correcta');
  });

  it('marks a wrong answer and escalates the stance', () => {
    const bundle = buildDebateBundle(validIssue, 0, 0); // chose "A", wrong
    expect(bundle.isCorrect).toBe(false);
    expect(bundle.selectedLetter).toBe('A');
    expect(bundle.prompt).toContain('✗ incorrecta');
    expect(bundle.prompt).toContain('Fallé esta pregunta');
  });

  it('includes referenced article excerpts as context', () => {
    const bundle = buildDebateBundle(validIssue, 0, 1);
    expect(bundle.prompt).toContain('Artículo uno');
    expect(bundle.prompt).toContain('Artículo dos');
  });

  it('does not leak the raw explanation as a repeated instruction', () => {
    const bundle = buildDebateBundle(validIssue, 0, 1);
    // The prompt should explicitly tell Claude NOT to repeat the correction.
    expect(bundle.prompt).toContain('no la repitas');
  });
});
