import { z } from 'zod';

/**
 * The "issue" contract — the single source of truth that decouples *who generates
 * the content* (the Claude skill, a ChatGPT GPT, a future ingestion pipeline, or a
 * human) from *how the app renders it*. Anything that emits JSON matching this
 * schema works with Criterio. See docs/DATA-SCHEMA.md.
 */

export const CURRENT_SCHEMA_VERSION = 1;

const nonEmpty = z.string().trim().min(1);

export const summarySchema = z.object({
  /** Display index, e.g. "01". Free-form; the UI does not parse it. */
  num: nonEmpty,
  /** Short inferred headline for the summary card. */
  title: nonEmpty,
  /** The 150-word narrative summary. */
  text: nonEmpty,
});

export const articleSchema = z.object({
  title: nonEmpty,
  /** Condensed source notes shown in the (collapsed) accordion. */
  content: nonEmpty,
});

export const questionSchema = z
  .object({
    q: nonEmpty,
    /**
     * Answer options as PLAIN text — do NOT prefix with "A)", "B)"… The UI derives
     * the letter from the index. Between 2 and 6 options.
     */
    options: z.array(nonEmpty).min(2).max(6),
    /** 0-based index of the best/correct option. */
    correct: z.number().int().nonnegative(),
    /**
     * Self-contained rationale: positive argument for the correct option +
     * explicit refutation of the most attractive trap.
     */
    explanation: nonEmpty,
    /** 0-based index of the most attractive wrong option (the "trap"). Optional. */
    trap: z.number().int().nonnegative().optional(),
    /** Optional 0-based indices into `articles` that ground this question. */
    articleRefs: z.array(z.number().int().nonnegative()).optional(),
  })
  .refine((q) => q.correct < q.options.length, {
    message: 'correct index is out of range for options',
    path: ['correct'],
  })
  .refine((q) => q.trap === undefined || (q.trap < q.options.length && q.trap !== q.correct), {
    message: 'trap must be a valid wrong-option index (different from correct)',
    path: ['trap'],
  });

export const issueSchema = z.object({
  /** Schema version for forward compatibility. */
  version: z.literal(CURRENT_SCHEMA_VERSION).default(CURRENT_SCHEMA_VERSION),
  /** ISO date of the issue, "YYYY-MM-DD". Used as the stable id. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be ISO format YYYY-MM-DD'),
  /** Editorial title of the aggregate synthesis. */
  title: nonEmpty,
  /** The aggregate synthesis, as an array of paragraphs. */
  synthesis: z.array(nonEmpty).min(1),
  summaries: z.array(summarySchema).min(1),
  articles: z.array(articleSchema).min(1),
  questions: z.array(questionSchema).min(1),
});

export type Summary = z.infer<typeof summarySchema>;
export type Article = z.infer<typeof articleSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Issue = z.infer<typeof issueSchema>;

export type ValidationResult = { ok: true; issue: Issue } | { ok: false; errors: string[] };

/**
 * Validate an unknown value against the issue contract. Returns a discriminated
 * result so callers can surface precise, user-facing import errors.
 */
export function validateIssue(input: unknown): ValidationResult {
  const parsed = issueSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: formatZodErrors(parsed.error) };
  }
  const issue = parsed.data;

  // Cross-field check: every articleRefs index must point at a real article.
  const refErrors: string[] = [];
  issue.questions.forEach((q, qi) => {
    q.articleRefs?.forEach((ref) => {
      if (ref >= issue.articles.length) {
        refErrors.push(`questions[${qi}].articleRefs: índice ${ref} fuera de rango`);
      }
    });
  });
  if (refErrors.length) return { ok: false, errors: refErrors };

  return { ok: true, issue };
}

function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((iss) => {
    const path = iss.path.join('.');
    return path ? `${path}: ${iss.message}` : iss.message;
  });
}
