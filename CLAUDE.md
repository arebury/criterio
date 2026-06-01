# Criterio — guía para Claude (se carga en cada sesión)

Lectura editorial + debate socrático sobre un lote diario de artículos. App de **cliente puro,
sin backend**: React 18 + TypeScript + Vite, desplegada como sitio estático en Netlify. UI en
español.

## Audiencia y principio rector

El lector objetivo es **un señor mayor**. Toda decisión de UI prioriza **simplicidad y
claridad**: una acción obvia mejor que muchas; botones con **texto y borde visible** (que se vean
como botones); lenguaje llano **sin jerga técnica** (evitar la palabra "JSON" en textos
visibles → "el texto que copiaste"); objetivos de pulsado grandes; accesibilidad WCAG AA.

## Cómo funciona (resumen)

- El contenido es una "edición" (un JSON) que valida `src/schema/issue.ts` (Zod). Lo genera una
  skill de Claude (`skill/criterio/SKILL.md`) y se **importa pegándolo** en la app.
- Ediciones de ejemplo en `public/issues/*.json` (índice en `index.json`); se cargan al arrancar.
- Estado global en `src/state/store.tsx` (React Context). Persistencia en `localStorage`
  (ediciones importadas) e IndexedDB (carpeta de exportación).
- Vistas: Síntesis / Resúmenes / Artículos / Debate (`src/components/*`). El debate **no usa API
  de pago**: construye un prompt y lo copia al portapapeles para pegar en Claude.ai
  (`src/lib/debate.ts`).
- Detalle técnico profundo y roadmap: `docs/ARCHITECTURE.md`.

## Mapa rápido

- `src/App.tsx` — raíz; estado de vista, modales, modo lectura, TTS.
- `src/components/Nav.tsx` — barra superior (tabs + botones Importar / Ajustes / Descargar).
- `src/components/ImportModal.tsx` — importar **pegando texto** (tolerante a `fences` y prosa).
- `src/components/SettingsModal.tsx` — carpeta de exportación + ediciones importadas.
- `src/styles/app.css` — todos los estilos (un único archivo, ~24 KB).

## Comandos

- `npm run dev` — desarrollo
- `npm run build` — `tsc -b && vite build`
- `npm test` — unitarios (Vitest)
- `npm run test:e2e` — Playwright
- `npm run lint` / `npm run format` — el CI ejecuta `lint` y `format:check`

## Despliegue (IMPORTANTE)

Sitio en vivo: **https://criterio-areses.netlify.app** (proyecto Netlify `criterio-areses`,
cuenta Rafa Areses). El despliegue es **manual con la CLI de Netlify**:

    npm run build
    netlify deploy --prod --dir=dist

`git push` a `main` **NO publica**: el workflow de GitHub Actions solo hace
typecheck/lint/test/build, no despliega. Tras desplegar, verifica que la web sirve el hash nuevo
de `dist/assets`. (Ojo: `criterio.netlify.app` sin sufijo da 404; no es este sitio.)

## Regla de trabajo (IMPORTANTE)

**Si una herramienta devuelve un resultado vacío o ilegible, PARA y dilo. Nunca inventes**
contenido de archivos, APIs, arquitectura ni bugs. Lee el archivo real antes de afirmar nada.
(En este entorno, las lecturas en lote a veces solo muestran la primera; ante la duda, lee un
archivo por turno y verifica que llegó contenido.)

## Estado / dónde lo dejamos

_Actualizar al final de cada sesión._

- **2026-06-01**
  - **Import con dos pestañas** (`ImportModal.tsx`): «Pegar texto» (como antes) y «Subir
    archivo», que acepta el `.json` descargable de ChatGPT (arrastrar o elegir). Ambas pasan
    por el mismo `extractIssueJson` tolerante. Motivo: el lector pulsaba «Copiar» sobre una
    respuesta en Canvas/adjunto y solo obtenía el nombre del archivo («text.txt · Documento»),
    no su contenido.
  - **Mensaje de error específico**: si el texto pegado no contiene ninguna `{`, el importador
    explica que se pegó el nombre del archivo, no su contenido.
  - `skill/criterio/SKILL.md`: la entrega admite **dos formas** válidas (bloque ` ```json ` en
    el chat **o** archivo `.json` descargable).
  - Estilos de pestañas/zona de arrastre en `app.css` (`.import-tabs`, `.import-tab`,
    `.import-dropzone`), con tap targets grandes en móvil.
  - Verificado: `build` ✅, `lint` ✅, `test` ✅, e2e del import ✅, y **desplegado en
    producción** (criterio-areses.netlify.app sirve el build nuevo, HTTP 200).

- **2026-05-31 (cont.)**
  - **Menú hamburguesa en móvil:** las acciones (Importar / Ajustes / Descargar + selector de
    edición) se colapsan en un botón "Menú" con desplegable accesible (Escape, toque fuera, o al
    elegir). Desktop intacto. Verificado con Playwright (abrir Menú → Ajustes a 390 px).
  - **Tamaño de letra** en Ajustes (Normal / Grande / Enorme), persistido en `localStorage`
    (`criterio.textSize`) mediante una clase en `<body>`.
  - `skill/criterio/SKILL.md` actualizado: importar es copiar y pegar (no guardar archivo).

- **2026-05-31**
  - Import → **solo pegar texto** (quitado "Subir archivo .json"); parser tolerante a bloques
    ` ```json ` y a prosa alrededor; textos simplificados sin la palabra "JSON".
  - Botón **Ajustes** ahora lleva texto (como Importar/Descargar); `.nav-icon` con borde y
    estados (hover/active/focus) para que se vean como botones.
  - **Responsive móvil:** el nav se reorganiza (marca + acciones arriba, pestañas como barra a lo
    ancho abajo, pulsado ≥44px), tipografía y modales adaptados, acciones del debate a ancho
    completo. Desktop intacto (todo bajo `@media`). Pestañas envueltas en `.nav-tabs` en Nav.tsx.
  - **Debate:** "Abrir Claude" copia el prompt antes de abrir; en móvil navega en la misma
    pestaña para disparar la app de Claude (universal link). Copia con fallback `execCommand`.
  - Verificado: `build` ✅, `lint` ✅, `test` ✅ (15/15) y **desplegado en producción**
    (criterio-areses.netlify.app sirve el build nuevo, HTTP 200).
  - **Pendiente / ideas:** revisar en un móvil real; actualizar `skill/criterio/SKILL.md` para
    que diga "copia y pega el texto"; control de **tamaño de letra** en Ajustes (lector mayor).
