import type { Issue } from '../schema/issue';
import { copyText } from './clipboard';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/** A short, plain-text taste of the day's edition to send to family. */
function buildShareText(issue: Issue): string {
  const intro = issue.synthesis[0] ?? '';
  return `Criterio · ${issue.title}\n\n${intro}`;
}

/**
 * Share the day's synthesis: the native share sheet on mobile, a clipboard copy
 * everywhere else. Cancelling the sheet is not an error.
 */
export async function shareIssue(issue: Issue): Promise<ShareResult> {
  const text = buildShareText(issue);
  if (canNativeShare()) {
    try {
      await navigator.share({ title: `Criterio · ${issue.title}`, text });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
      // Anything else: fall through to the clipboard path.
    }
  }
  return (await copyText(text)) ? 'copied' : 'failed';
}
