import { describe, it, expect } from 'vitest';
import { validateIssue } from './issue';
import { validIssue } from '../test/fixture';

describe('validateIssue', () => {
  it('accepts a valid issue', () => {
    const result = validateIssue(validIssue);
    expect(result.ok).toBe(true);
  });

  it('defaults the version when omitted', () => {
    const { version: _version, ...withoutVersion } = validIssue;
    void _version;
    const result = validateIssue(withoutVersion);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.issue.version).toBe(1);
  });

  it('rejects a missing required field', () => {
    const { title: _title, ...withoutTitle } = validIssue;
    void _title;
    const result = validateIssue(withoutTitle);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes('title'))).toBe(true);
  });

  it('rejects a correct index out of range', () => {
    const bad = {
      ...validIssue,
      questions: [{ ...validIssue.questions[0], correct: 9 }],
    };
    const result = validateIssue(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects a trap equal to the correct index', () => {
    const bad = {
      ...validIssue,
      questions: [{ ...validIssue.questions[0], trap: validIssue.questions[0].correct }],
    };
    expect(validateIssue(bad).ok).toBe(false);
  });

  it('rejects articleRefs pointing past the articles array', () => {
    const bad = {
      ...validIssue,
      questions: [{ ...validIssue.questions[0], articleRefs: [99] }],
    };
    const result = validateIssue(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes('articleRefs'))).toBe(true);
  });
});
