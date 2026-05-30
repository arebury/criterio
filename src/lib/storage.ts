import type { Issue } from '../schema/issue';
import { validateIssue } from '../schema/issue';

/**
 * Local persistence for user-imported issues, kept in localStorage so the app
 * works fully client-side with no backend. Bundled sample issues live in
 * /public/issues and are loaded separately (see lib/issues.ts).
 */

const ISSUES_KEY = 'criterio:issues';

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
  return issues;
}
