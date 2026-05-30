# Arquitectura y referencia técnica

Documento técnico profundo de Criterio. El [README](../README.md) cubre la orientación y el
arranque; aquí está el _cómo_ y el _porqué_, el contrato de datos y el roadmap.

- [1. Flujo de datos](#1-flujo-de-datos)
- [2. Decisiones de diseño](#2-decisiones-de-diseño)
- [3. Mapa de módulos](#3-mapa-de-módulos)
- [4. El contrato de datos (la "edición")](#4-el-contrato-de-datos-la-edición)
- [5. Pruebas](#5-pruebas)
- [6. Roadmap](#6-roadmap)

Criterio es una **aplicación de cliente sin backend**. Todo ocurre en el navegador: render,
estado, persistencia, exportación y la preparación del debate. No hay servidor propio ni base
de datos, lo que hace el despliegue trivial (un sitio estático) y el coste de operación nulo.

---

## 1. Flujo de datos

```
                 ┌─────────────────────────────┐
  Artículos ───▶ │  Generador (skill de Claude) │ ───▶  edición JSON  (el "contrato")
                 └─────────────────────────────┘                │
                                                                 ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                        Criterio (SPA)                          │
        │                                                                │
        │  validateIssue (Zod) ──▶ store (Context) ──▶ vistas            │
        │        │                      │                                │
        │        │                      ├─ Síntesis / Resúmenes / Artículos
        │        │                      └─ Debate ──▶ buildDebateBundle ─┼─▶ portapapeles ─▶ Claude.ai
        │        ▼                                                        │
        │  localStorage (ediciones importadas)                           │
        │  IndexedDB (handle de la carpeta de exportación)               │
        │        │                                                        │
        │        └─ buildExportHtml ──▶ saveFile ──▶ carpeta elegida / Descargas
        └──────────────────────────────────────────────────────────────┘
```

---

## 2. Decisiones de diseño

### Un contrato JSON como frontera

El acoplamiento entre generación y presentación es un único esquema (`src/schema/issue.ts`,
validado con Zod). Esto permite que el contenido lo produzca cualquier fuente —la skill de
Claude, un GPT de ChatGPT, una ingesta automática futura o un humano— sin tocar la app, y que
la app evolucione sin renegociar con los generadores. La validación se ejecuta tanto al
importar como al releer de `localStorage`, porque los datos persistidos pueden venir de una
versión anterior.

### Cliente puro, sin backend

El producto es de un solo usuario (o una familia). Un backend añadiría coste, superficie de
ataque y operación a cambio de ventajas que aquí no se necesitan. El estado vive en el
dispositivo:

- **`localStorage`** para las ediciones importadas (texto, serializable, pequeño).
- **`IndexedDB`** para el `FileSystemDirectoryHandle` de la carpeta de exportación, porque los
  handles no son serializables a JSON y `localStorage` no puede guardarlos.

### El debate no usa API de pago

Llamar a la API de Claude teniendo ya una suscripción es pagar dos veces. En su lugar, la app
**construye el prompt** del debate (autocontenido: pregunta, respuesta, corrección y extractos
de los artículos referenciados) y lo copia al portapapeles para pegarlo en un chat normal de
Claude. El prompt escala su exigencia cuando la respuesta es incorrecta. Coste marginal: cero.

### Exportación como HTML autocontenido

La descarga genera un HTML independiente y sin dependencias (`src/lib/export-html.ts`), no un
volcado del DOM de React. Así un archivo descargado se lee offline para siempre y nunca se
rompe por un cambio en la app. Reproduce el diseño editorial y el flujo de debate en vanilla JS.

### "Export location" con degradación elegante

La elección de carpeta usa la [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_API),
disponible en navegadores Chromium sobre contexto seguro. Donde no existe (Safari), `saveFile`
cae a una descarga normal con el mismo nombre fechado. La capacidad se detecta en tiempo de
ejecución (`isFsAccessSupported`) y la UI se adapta.

---

## 3. Mapa de módulos

| Módulo                       | Responsabilidad                                               |
| ---------------------------- | ------------------------------------------------------------- |
| `schema/issue.ts`            | Contrato de datos (Zod) + `validateIssue`.                    |
| `lib/issues.ts`              | Carga de ediciones de ejemplo desde `/public/issues`.         |
| `lib/storage.ts`             | Persistencia en `localStorage` de ediciones importadas.       |
| `lib/download.ts`            | File System Access API, handle persistente y fallback.        |
| `lib/export-html.ts`         | Generación del HTML autocontenido.                            |
| `lib/debate.ts`              | Construcción del prompt de debate (coste cero).               |
| `lib/tts.ts`                 | Controlador de síntesis de voz (Web Speech API).              |
| `lib/dates.ts`, `letters.ts` | Utilidades de formato.                                        |
| `state/store.tsx`            | Estado global (Context): biblioteca, edición actual, ajustes. |
| `components/*`               | Vistas y controles de UI.                                     |

---

## 4. El contrato de datos (la "edición")

Una edición es el contenido de un día: el JSON que Criterio importa y renderiza. Es la única
frontera entre quién genera el contenido y la app. La fuente de verdad ejecutable es
[`src/schema/issue.ts`](../src/schema/issue.ts) (Zod); lo que sigue la describe.

La validación se ejecuta al importar y al releer del almacenamiento local. Si algo no cumple,
la importación se rechaza mostrando el campo y el motivo exactos.

### Estructura de alto nivel

```jsonc
{
  "version": 1, // entero, versión del esquema (por defecto 1)
  "date": "2026-05-29", // string ISO "AAAA-MM-DD" — identificador de la edición
  "title": "…", // título editorial de la síntesis
  "synthesis": ["…", "…"], // array de párrafos (≥ 1)
  "summaries": [{ "num": "…", "title": "…", "text": "…" }], // ≥ 1
  "articles": [{ "title": "…", "content": "…" }], // ≥ 1
  "questions": [{ "q": "…", "options": ["…"], "correct": 0, "explanation": "…" }], // ≥ 1
}
```

### Campos de la raíz

| Campo       | Tipo         | Reglas                                                                               |
| ----------- | ------------ | ------------------------------------------------------------------------------------ |
| `version`   | `number`     | Literal `1`. Si se omite, se asume `1`.                                              |
| `date`      | `string`     | ISO `AAAA-MM-DD`. Identifica la edición; al reimportar la misma fecha, se reemplaza. |
| `title`     | `string`     | No vacío.                                                                            |
| `synthesis` | `string[]`   | ≥ 1 párrafo. Cada párrafo no vacío.                                                  |
| `summaries` | `Summary[]`  | ≥ 1.                                                                                 |
| `articles`  | `Article[]`  | ≥ 1.                                                                                 |
| `questions` | `Question[]` | ≥ 1.                                                                                 |

### `Summary`

| Campo   | Tipo     | Reglas                                 |
| ------- | -------- | -------------------------------------- |
| `num`   | `string` | Índice mostrado, p. ej. `"01"`. Libre. |
| `title` | `string` | Titular inferido del artículo.         |
| `text`  | `string` | El resumen narrativo (≈ 150 palabras). |

Convención: `summaries` y `articles` comparten orden y longitud (un resumen por artículo).

### `Article`

| Campo     | Tipo     | Reglas                                        |
| --------- | -------- | --------------------------------------------- |
| `title`   | `string` | Título del artículo.                          |
| `content` | `string` | Notas fuente condensadas (vista de acordeón). |

### `Question`

| Campo         | Tipo        | Reglas                                                                                |
| ------------- | ----------- | ------------------------------------------------------------------------------------- |
| `q`           | `string`    | Enunciado.                                                                            |
| `options`     | `string[]`  | Entre 2 y 6. **Texto plano, sin prefijo de letra.** La UI deriva la letra del índice. |
| `correct`     | `number`    | Índice 0-based de la mejor opción. Dentro de `options`.                               |
| `explanation` | `string`    | Argumento de la correcta + refutación de la trampa. Autocontenida.                    |
| `trap`        | `number?`   | Índice 0-based de la trampa más atractiva. Opcional. Distinto de `correct`.           |
| `articleRefs` | `number[]?` | Índices 0-based dentro de `articles` que fundamentan la pregunta. Deben existir.      |

`articleRefs` enriquece el debate: el prompt que se copia a Claude incluye los extractos de los
artículos referenciados. Si se omite, usa el primer párrafo de la síntesis como contexto.

### Ejemplo mínimo válido

```json
{
  "version": 1,
  "date": "2026-05-30",
  "title": "Edición de ejemplo",
  "synthesis": ["Primer párrafo.", "Segundo párrafo."],
  "summaries": [{ "num": "01", "title": "Resumen uno", "text": "Texto del resumen." }],
  "articles": [{ "title": "Artículo uno", "content": "Notas fuente." }],
  "questions": [
    {
      "q": "¿Pregunta de ejemplo?",
      "options": ["Primera opción", "Segunda opción", "Tercera opción"],
      "correct": 1,
      "trap": 0,
      "articleRefs": [0],
      "explanation": "Por qué la segunda es la mejor y por qué la primera tienta pero falla."
    }
  ]
}
```

Un ejemplo completo y real está en
[`public/issues/2026-05-29.json`](../public/issues/2026-05-29.json). El versionado (`version`)
permite migrar el esquema sin romper ediciones antiguas; hoy solo existe la `1`.

---

## 5. Pruebas

- **Unitarias (Vitest):** lógica pura — validación del contrato, construcción del prompt,
  formato de fechas, generación del HTML de exportación.
- **End-to-end (Playwright):** carga de la edición de ejemplo, navegación, flujo de debate con
  corrección inline y validación de errores en la importación.

---

## 6. Roadmap

La regla que ordena el roadmap: **enviar algo sólido pronto y no bloquear el producto detrás de
la pieza más difícil.**

### Fase 1 — App de lectura y debate (actual) ✅

- Importación de ediciones (archivo o pegado) validada contra el contrato.
- Vistas Síntesis / Resúmenes / Artículos / Debate, modo lectura y TTS.
- Debate de coste cero: corrección inline + prompt autocontenido para pegar en Claude.
- Exportación a HTML autocontenido, con carpeta fija (File System Access API) y nombre fechado.
- Skill de Claude que emite el JSON del contrato.
- Despliegue estático en Netlify.

El contenido entra **manualmente** (lo genera la skill o el GPT y se importa). Es deliberado:
es la pieza que funciona hoy sin infraestructura ni riesgos.

### Fase 2 — Ingesta semiautomática (por vías legales)

Reducir la fricción de meter el contenido del día, **sin scrapear contenido de pago**.

- **Fuentes oficiales:** RSS/Atom y APIs públicas de medios, newsletters o feeds que el usuario
  ya tenga derecho a leer.
- **Asistente de borrador:** una pantalla para pegar varias URLs o textos y formatearlos hacia
  el contrato, en lugar de copiar/pegar el JSON a mano.
- **Conector con el generador:** un punto de entrada estable para depositar la edición sin pasos
  manuales. Puede necesitar una función serverless mínima, que se evaluará solo cuando el ahorro
  lo justifique.

### Fase 3 — Selección y priorización

- Señales de relevancia a partir de fuentes que las publiquen oficialmente.
- Filtros por tema/keyword y deduplicación entre fuentes.
- Histórico navegable y búsqueda.

### Lo que NO haremos (y por qué)

- **Scraping de contenido tras paywall.** Suele violar los Términos de Servicio y el copyright
  del medio. El riesgo legal no compensa en un proyecto personal.
- **Recolectar métricas privadas de terceros** por vías no autorizadas.
- **Infraestructura cara** sin un beneficio claro que la pague.

### Mejoras transversales

- Persistir el progreso del debate por edición.
- Atajos de teclado en el debate y la navegación.
- Auditoría de accesibilidad continua (objetivo WCAG AA).
- PWA instalable para uso offline.
