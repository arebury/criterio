import { describe, it, expect } from 'vitest';
import { formatSpanishDate } from './dates';
import { optionLetter } from './letters';
import { buildExportHtml, exportFilename } from './export-html';
import { validIssue } from '../test/fixture';

describe('formatSpanishDate', () => {
  it('formats an ISO date in Spanish', () => {
    expect(formatSpanishDate('2026-05-29')).toBe('29 de mayo de 2026');
  });
  it('returns the input unchanged when it is not an ISO date', () => {
    expect(formatSpanishDate('not-a-date')).toBe('not-a-date');
  });
});

describe('optionLetter', () => {
  it('maps indices to letters', () => {
    expect(optionLetter(0)).toBe('A');
    expect(optionLetter(4)).toBe('E');
  });
});

describe('export-html', () => {
  it('builds a dated filename', () => {
    expect(exportFilename(validIssue)).toBe('criterio-2026-05-30.html');
  });
  it('embeds the issue title and is a complete HTML document', () => {
    const html = buildExportHtml(validIssue);
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('Edición de prueba');
    expect(html).toContain('</html>');
  });
});
