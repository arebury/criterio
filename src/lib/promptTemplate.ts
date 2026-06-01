/**
 * A self-contained prompt the reader copies into Claude or ChatGPT. It embeds
 * the whole edition contract, so it works even in a plain chat with no Criterio
 * skill installed: the reader pastes their articles right after it and gets back
 * a valid JSON edition ready to import. Plain-spoken on purpose (the reader is
 * not technical) yet precise enough for the model to obey the schema.
 */
export const CRITERIO_PROMPT = `Actúa como el editor de Criterio, una herramienta de lectura editorial profunda. Voy a pegarte varios artículos al final de este mensaje. A partir de ellos, genera UNA edición.

Tu única salida es UN objeto JSON con esta forma exacta:

\`\`\`json
{
  "version": 1,
  "date": "AAAA-MM-DD",
  "title": "Título editorial de la síntesis del día",
  "synthesis": ["Párrafo 1 de la síntesis.", "Párrafo 2.", "..."],
  "summaries": [
    { "num": "01", "title": "Titular inferido del artículo", "text": "Resumen de 150 palabras." }
  ],
  "articles": [
    { "title": "Título del artículo", "content": "Notas fuente condensadas." }
  ],
  "questions": [
    {
      "q": "Texto de la pregunta",
      "options": ["Opción", "Otra", "Otra", "Otra", "Otra"],
      "correct": 1,
      "trap": 0,
      "articleRefs": [0, 2],
      "explanation": "Por qué la correcta es la mejor y por qué la trampa es atractiva pero insuficiente."
    }
  ]
}
\`\`\`

Reglas:
- "date": usa la fecha de hoy en formato AAAA-MM-DD.
- "summaries": un resumen narrativo de unas 150 palabras por artículo. Empieza por el dato o la tesis central, sin "Este artículo trata de...".
- "synthesis": 2 a 4 párrafos que conecten todos los artículos, como el editorial de apertura de una revista de análisis. Es un array de párrafos, no un solo texto.
- "summaries" y "articles" deben tener el mismo número de elementos y el mismo orden.
- "questions": exactamente 8 preguntas socráticas, de menor a mayor dificultad, con 5 opciones cada una. Las opciones van en texto plano, SIN "A)" ni "B)".
- "correct": índice (empezando en 0) de la mejor opción. "trap": índice de la opción incorrecta más atractiva (distinta de la correcta).
- "articleRefs": índices (empezando en 0) de los artículos que fundamentan la pregunta.
- No escribas nada fuera del JSON: ni introducción, ni comentarios, ni despedida.

Cuando termines, dámelo como UN archivo .json descargable. Si no puedes generar un archivo, dámelo dentro de un único bloque de código.

Pega tus artículos justo debajo de esta línea:
`;
