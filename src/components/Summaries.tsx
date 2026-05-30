import type { Issue } from '../schema/issue';

export function Summaries({ issue }: { issue: Issue }) {
  return (
    <div className="resume-grid">
      {issue.summaries.map((summary, i) => (
        <article className="resume-card" key={i}>
          <div className="resume-num">Artículo {summary.num}</div>
          <h2 className="resume-title">{summary.title}</h2>
          <p className="resume-text">{summary.text}</p>
        </article>
      ))}
    </div>
  );
}
