import type { Issue } from '../schema/issue';
import { validateIssue } from '../schema/issue';

/** Metadata for a bundled issue, as listed in /public/issues/index.json. */
export interface BundledIssueRef {
  date: string;
  title: string;
  file: string;
  articleCount: number;
}

const base = import.meta.env.BASE_URL;

export async function fetchBundledIndex(): Promise<BundledIssueRef[]> {
  try {
    const res = await fetch(`${base}issues/index.json`, { cache: 'no-cache' });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (data && typeof data === 'object' && Array.isArray((data as { issues?: unknown }).issues)) {
      return (data as { issues: BundledIssueRef[] }).issues;
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchBundledIssue(file: string): Promise<Issue | null> {
  try {
    const res = await fetch(`${base}issues/${file}`, { cache: 'no-cache' });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const result = validateIssue(data);
    return result.ok ? result.issue : null;
  } catch {
    return null;
  }
}

/** Load every bundled issue, newest first, skipping any that fail validation. */
export async function loadAllBundledIssues(): Promise<Issue[]> {
  const index = await fetchBundledIndex();
  const issues = await Promise.all(index.map((ref) => fetchBundledIssue(ref.file)));
  return issues.filter((i): i is Issue => i !== null).sort((a, b) => b.date.localeCompare(a.date));
}
