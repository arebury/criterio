import type { Issue } from '../schema/issue';
import { formatSpanishDate } from '../lib/dates';
import { ShareButton } from './ShareButton';

export function Synthesis({ issue }: { issue: Issue }) {
  return (
    <>
      <div className="synth-meta">
        Análisis de {issue.summaries.length} artículos · {formatSpanishDate(issue.date)}
      </div>
      <h1 className="synth-title">{issue.title}</h1>
      <div className="synth-body">
        {issue.synthesis.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      <div className="synth-share">
        <ShareButton issue={issue} />
      </div>
    </>
  );
}
