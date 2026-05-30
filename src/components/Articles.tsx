import { useState } from 'react';
import type { Issue } from '../schema/issue';
import { ChevronIcon } from './icons';

export function Articles({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div>
      {issue.articles.map((article, i) => {
        const isOpen = open.has(i);
        return (
          <div className="accordion-item" key={i}>
            <button
              className={`accordion-btn${isOpen ? ' open' : ''}`}
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
            >
              <span>
                {String(i + 1).padStart(2, '0')}. {article.title}
              </span>
              <span className="accordion-arrow" aria-hidden="true">
                <ChevronIcon size={15} />
              </span>
            </button>
            <div className={`accordion-content${isOpen ? ' open' : ''}`}>{article.content}</div>
          </div>
        );
      })}
    </div>
  );
}
