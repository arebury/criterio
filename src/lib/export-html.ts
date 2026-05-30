import type { Issue } from '../schema/issue';
import { formatSpanishDate } from './dates';
import { CLAUDE_NEW_CHAT_URL } from './debate';

/**
 * Generate a self-contained, dependency-free HTML snapshot of an issue: a single
 * file that reads offline forever, with the same editorial look, the accordion,
 * and the debate flow (inline correction + "copy prompt for Claude"). This is the
 * artifact written to the user's chosen export folder. It is intentionally
 * independent of the React app so a downloaded file never breaks.
 */
export function exportFilename(issue: Issue): string {
  return `criterio-${issue.date}.html`;
}

export function buildExportHtml(issue: Issue): string {
  const data = JSON.stringify(issue).replace(/<\//g, '<\\/');
  const meta = `Análisis de ${issue.summaries.length} artículos · ${formatSpanishDate(issue.date)}`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Criterio — ${escapeHtml(formatSpanishDate(issue.date))}</title>
<style>
:root { color-scheme: light; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Georgia, 'Times New Roman', serif; background: #f9f8f6; color: #1a1a1a; }
nav { background: #fff; border-bottom: 1px solid #e0ddd8; padding: 0 20px; display: flex; align-items: center; position: sticky; top: 0; z-index: 100; flex-wrap: wrap; }
nav button { background: none; border: none; border-bottom: 3px solid transparent; padding: 16px 18px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 600; color: #666; cursor: pointer; letter-spacing: 0.05em; text-transform: uppercase; transition: color 0.2s, border-color 0.2s; }
nav button:hover { color: #1a3a5c; }
nav button.active { color: #1a3a5c; border-bottom-color: #1a3a5c; }
.brand { font-family: -apple-system, sans-serif; font-weight: 800; letter-spacing: 0.04em; color: #1a3a5c; padding: 16px 14px 16px 0; font-size: 15px; }
.section { display: none; max-width: 720px; margin: 0 auto; padding: 40px 24px 100px; }
.section.active { display: block; }
.synth-meta { font-family: -apple-system, sans-serif; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 18px; }
.synth-title { font-size: 26px; font-weight: 700; color: #1a1a1a; margin-bottom: 28px; line-height: 1.3; }
.synth-body { font-size: 17px; line-height: 1.82; color: #2a2a2a; }
.synth-body p { margin-bottom: 22px; }
.resume-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 640px) { .resume-grid { grid-template-columns: 1fr; } }
.resume-card { background: #fff; border: 1px solid #e8e5e0; border-radius: 10px; padding: 20px 20px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.resume-num { font-family: -apple-system, sans-serif; font-size: 11px; color: #bbb; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 5px; }
.resume-title { font-size: 13px; font-weight: 700; color: #1a3a5c; margin-bottom: 10px; line-height: 1.4; font-family: -apple-system, sans-serif; }
.resume-text { font-size: 13px; line-height: 1.74; color: #333; }
.accordion-item { border-bottom: 1px solid #e0ddd8; }
.accordion-btn { width: 100%; background: none; border: none; text-align: left; padding: 18px 4px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600; color: #1a1a1a; gap: 12px; }
.accordion-btn:hover { color: #1a3a5c; }
.accordion-arrow { font-size: 10px; color: #aaa; transition: transform 0.2s; flex-shrink: 0; }
.accordion-btn.open .accordion-arrow { transform: rotate(90deg); }
.accordion-content { display: none; padding: 0 4px 20px; font-size: 14px; line-height: 1.75; color: #444; }
.accordion-content.open { display: block; }
.debate-progress-label { font-family: -apple-system, sans-serif; font-size: 12px; color: #888; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
.question-text { font-size: 18px; font-weight: 700; line-height: 1.5; margin: 16px 0 22px; color: #1a1a1a; }
.option-btn { display: block; width: 100%; text-align: left; background: #fff; border: 1.5px solid #ddd; border-radius: 8px; padding: 13px 16px; margin-bottom: 10px; font-family: -apple-system, sans-serif; font-size: 14px; color: #1a1a1a; cursor: pointer; line-height: 1.5; }
.option-btn:hover:not(:disabled) { border-color: #1a3a5c; background: #f0f4f8; }
.option-btn.selected { border-color: #1a3a5c; background: #edf2f8; font-weight: 600; }
.option-btn.correct-opt { border-color: #2a7a4a !important; background: #e8f5ee !important; color: #2a7a4a; font-weight: 700; }
.option-btn.wrong-opt { border-color: #c0392b !important; background: #fdf0ee !important; color: #c0392b; font-weight: 700; }
.correction-box { margin-top: 20px; border-radius: 10px; padding: 18px 22px; font-family: -apple-system, sans-serif; font-size: 14px; line-height: 1.65; display: none; }
.correction-box.visible { display: block; }
.correction-box.correct-ans { background: #f0faf4; border: 1.5px solid #2a7a4a; }
.correction-box.wrong-ans { background: #fdf0ee; border: 1.5px solid #c0392b; }
.correction-verdict { font-size: 16px; font-weight: 800; margin-bottom: 10px; }
.correction-verdict.ok { color: #2a7a4a; }
.correction-verdict.bad { color: #c0392b; }
.correction-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; color: #666; }
.correction-text { color: #333; font-size: 14px; line-height: 1.7; }
.debate-actions { margin-top: 18px; display: flex; gap: 12px; flex-wrap: wrap; }
.btn { border-radius: 8px; padding: 12px 22px; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-primary { background: #1a3a5c; color: #fff; border: none; }
.btn-primary:disabled { background: #bbb; cursor: default; }
.btn-ghost { background: #f9f8f6; color: #1a3a5c; border: 1.5px solid #1a3a5c; }
.claude-row { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.07); display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.claude-hint { font-size: 12px; color: #888; font-style: italic; }
</style>
</head>
<body>
<nav>
  <span class="brand">Criterio</span>
  <button class="active" data-sec="sintesis">Síntesis</button>
  <button data-sec="resumenes">Resúmenes</button>
  <button data-sec="articulos">Artículos</button>
  <button data-sec="debate">Debate</button>
</nav>
<div class="section active" id="sec-sintesis">
  <div class="synth-meta">${escapeHtml(meta)}</div>
  <div class="synth-title" id="synthTitle"></div>
  <div class="synth-body" id="synthBody"></div>
</div>
<div class="section" id="sec-resumenes"><div class="resume-grid" id="resumeGrid"></div></div>
<div class="section" id="sec-articulos"><div id="accordionContainer"></div></div>
<div class="section" id="sec-debate">
  <div class="debate-progress-label" id="debateProgress"></div>
  <div id="questionContainer"></div>
</div>
<script>
const ISSUE = ${data};
const CLAUDE_URL = ${JSON.stringify(CLAUDE_NEW_CHAT_URL)};
const letter = (i) => String.fromCharCode(65 + i);
let currentQ = 0, selectedOpt = null, submitted = false, answered = 0;

function esc(s){ const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function show(sec){
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-' + sec).classList.add('active');
  document.querySelector('nav button[data-sec="' + sec + '"]').classList.add('active');
}
document.querySelectorAll('nav button').forEach(b => b.addEventListener('click', () => show(b.dataset.sec)));

document.getElementById('synthTitle').textContent = ISSUE.title;
document.getElementById('synthBody').innerHTML = ISSUE.synthesis.map(p => '<p>' + esc(p) + '</p>').join('');
document.getElementById('resumeGrid').innerHTML = ISSUE.summaries.map(r =>
  '<div class="resume-card"><div class="resume-num">Artículo ' + esc(r.num) + '</div><div class="resume-title">' + esc(r.title) + '</div><div class="resume-text">' + esc(r.text) + '</div></div>'
).join('');
document.getElementById('accordionContainer').innerHTML = ISSUE.articles.map((a, i) =>
  '<div class="accordion-item"><button class="accordion-btn" data-i="' + i + '"><span>' + String(i+1).padStart(2,'0') + '. ' + esc(a.title) + '</span><span class="accordion-arrow">▶</span></button><div class="accordion-content" id="acc-' + i + '">' + esc(a.content) + '</div></div>'
).join('');
document.querySelectorAll('.accordion-btn').forEach(btn => btn.addEventListener('click', () => {
  const c = document.getElementById('acc-' + btn.dataset.i);
  btn.classList.toggle('open', c.classList.toggle('open'));
}));

function buildPrompt(qi, sel){
  const q = ISSUE.questions[qi];
  const correct = sel === q.correct;
  const refs = (q.articleRefs || []).filter(i => i < ISSUE.articles.length);
  const ctx = refs.length
    ? refs.map(i => '- ' + ISSUE.articles[i].title + ': ' + ISSUE.articles[i].content).join('\\n')
    : '- Síntesis del día: ' + ISSUE.synthesis[0];
  const stance = correct
    ? 'Acerté esta pregunta. No te limites a felicitarme: tensa mi respuesta y muéstrame el mejor contraargumento contra la opción correcta.'
    : 'Fallé esta pregunta. Contraargumenta por qué mi elección es atractiva pero insuficiente, y defiende la mejor opción con un argumento que la corrección base no daba. Sé exigente.';
  return '[CRITERIO · Debate socrático — Pregunta ' + (qi+1) + '/' + ISSUE.questions.length + ']\\n\\n'
    + 'Actúa como un sparring intelectual socrático, no como un validador. Tono directo y sin condescendencia. NO repitas la corrección que ya he leído: ve más allá y abre una tensión que me obligue a pensar.\\n'
    + stance + '\\n\\n'
    + 'PREGUNTA: ' + q.q + '\\n\\nOPCIONES:\\n'
    + q.options.map((o,i) => letter(i) + ') ' + o).join('\\n') + '\\n\\n'
    + 'MI RESPUESTA: ' + letter(sel) + ') ' + q.options[sel] + ' (' + (correct ? '✓ correcta' : '✗ incorrecta') + ')\\n'
    + 'MEJOR OPCIÓN: ' + letter(q.correct) + ') ' + q.options[q.correct] + '\\n\\n'
    + 'CORRECCIÓN QUE YA HE LEÍDO (no la repitas): ' + q.explanation + '\\n\\n'
    + 'CONTEXTO (extractos de los artículos del día):\\n' + ctx + '\\n\\n'
    + 'Cierra invitándome a pasar a la siguiente pregunta cuando quiera.';
}

function renderQuestion(){
  const cont = document.getElementById('questionContainer');
  if (currentQ >= ISSUE.questions.length){
    document.getElementById('debateProgress').textContent = 'Debate completado';
    cont.innerHTML = '<div style="text-align:center;padding:60px 20px"><h2 style="font-size:26px;margin-bottom:14px">Debate completado</h2><p style="color:#555;font-family:-apple-system,sans-serif">' + answered + ' de ' + ISSUE.questions.length + ' preguntas respondidas.</p></div>';
    return;
  }
  const q = ISSUE.questions[currentQ];
  selectedOpt = null; submitted = false;
  document.getElementById('debateProgress').textContent = 'Pregunta ' + (currentQ+1) + ' de ' + ISSUE.questions.length;
  cont.innerHTML = '<div class="question-text">' + esc(q.q) + '</div>'
    + q.options.map((o,i) => '<button class="option-btn" data-i="' + i + '">' + letter(i) + ') ' + esc(o) + '</button>').join('')
    + '<div class="correction-box" id="correctionBox"></div>'
    + '<div class="debate-actions"><button class="btn btn-primary" id="submitBtn" disabled>Enviar respuesta</button><button class="btn btn-ghost" id="nextBtn" style="display:none">Siguiente pregunta →</button></div>';
  cont.querySelectorAll('.option-btn').forEach(b => b.addEventListener('click', () => selectOpt(Number(b.dataset.i))));
  document.getElementById('submitBtn').addEventListener('click', submitAnswer);
  document.getElementById('nextBtn').addEventListener('click', () => { currentQ++; renderQuestion(); });
}
function selectOpt(i){
  if (submitted) return;
  selectedOpt = i;
  document.querySelectorAll('.option-btn').forEach((b,j) => b.classList.toggle('selected', j === i));
  document.getElementById('submitBtn').disabled = false;
}
function submitAnswer(){
  if (selectedOpt === null || submitted) return;
  submitted = true; answered++;
  const q = ISSUE.questions[currentQ];
  const correct = selectedOpt === q.correct;
  document.querySelectorAll('.option-btn').forEach((b,i) => {
    if (i === q.correct) b.classList.add('correct-opt');
    else if (i === selectedOpt && !correct) b.classList.add('wrong-opt');
    b.disabled = true;
  });
  document.getElementById('submitBtn').style.display = 'none';
  const box = document.getElementById('correctionBox');
  box.className = 'correction-box visible ' + (correct ? 'correct-ans' : 'wrong-ans');
  box.innerHTML = '<div class="correction-verdict ' + (correct ? 'ok' : 'bad') + '">' + (correct ? '✓ Correcto' : '✗ Incorrecto — la respuesta era ' + letter(q.correct) + ')') + '</div>'
    + '<div class="correction-label">Por qué</div><div class="correction-text">' + esc(q.explanation) + '</div>'
    + '<div class="claude-row"><button class="btn btn-ghost" id="copyBtn">Copiar debate para Claude</button><a class="btn btn-ghost" href="' + CLAUDE_URL + '" target="_blank" rel="noopener">Abrir Claude ↗</a><span class="claude-hint" id="copyHint">' + (correct ? 'Tensa tu acierto en un chat real.' : 'Lleva tu error a debate en un chat real.') + '</span></div>';
  const prompt = buildPrompt(currentQ, selectedOpt);
  document.getElementById('copyBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(prompt); document.getElementById('copyHint').textContent = '✓ Copiado. Pégalo en Claude.'; }
    catch { document.getElementById('copyHint').textContent = 'Copia manual: ' + prompt.slice(0, 40) + '…'; }
  });
  document.getElementById('nextBtn').style.display = 'inline-block';
}
renderQuestion();
</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
