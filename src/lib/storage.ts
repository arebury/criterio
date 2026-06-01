import type { Issue } from '../schema/issue';
import { validateIssue } from '../schema/issue';

/**
 * Local persistence for user-imported issues, kept in localStorage so the app
 * works fully client-side with no backend. Bundled sample issues live in
 * /public/issues and are loaded separately (see lib/issues.ts).
 */

const ISSUES_KEY = 'criterio:issues';
const DEBATE_KEY_PREFIX = 'criterio:debate:';

export function loadImportedIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(ISSUES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Re-validate on read: storage could have been written by an older version.
    return parsed
      .map((item) => validateIssue(item))
      .filter((r): r is { ok: true; issue: Issue } => r.ok)
      .map((r) => r.issue);
  } catch {
    return [];
  }
}

/** Insert or replace an issue (keyed by date) and return the updated list. */
export function upsertImportedIssue(issue: Issue): Issue[] {
  const issues = loadImportedIssues().filter((i) => i.date !== issue.date);
  issues.push(issue);
  issues.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  return issues;
}

export function removeImportedIssue(date: string): Issue[] {
  const issues = loadImportedIssues().filter((i) => i.date !== date);
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  clearDebateProgress(date);
  return issues;
}

/**
 * Socratic-debate progress, persisted per edition so the reader can resume the
 * 8 questions across several sittings instead of losing them on reload.
 */
export type DebateProgress = {
  currentQ: number;
  selectedOpt: number | null;
  submitted: boolean;
  answered: number;
};

export function loadDebateProgress(date: string): DebateProgress | null {
  try {
    const raw = localStorage.getItem(DEBATE_KEY_PREFIX + date);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<DebateProgress>;
    if (typeof p?.currentQ !== 'number') return null;
    return {
      currentQ: p.currentQ,
      selectedOpt: typeof p.selectedOpt === 'number' ? p.selectedOpt : null,
      submitted: p.submitted === true,
      answered: typeof p.answered === 'number' ? p.answered : 0,
    };
  } catch {
    return null;
  }
}

export function saveDebateProgress(date: string, progress: DebateProgress): void {
  try {
    localStorage.setItem(DEBATE_KEY_PREFIX + date, JSON.stringify(progress));
  } catch {
    /* localStorage may be unavailable (private mode, quota) */
  }
}

export function clearDebateProgress(date: string): void {
  try {
    localStorage.removeItem(DEBATE_KEY_PREFIX + date);
  } catch {
    /* ignore */
  }
}
