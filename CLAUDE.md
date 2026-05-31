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

## Regla de trabajo (IMPORTANTE)

**Si una herramienta devuelve un resultado vacío o ilegible, PARA y dilo. Nunca inventes**
contenido de archivos, APIs, arquitectura ni bugs. Lee el archivo real antes de afirmar nada.
(En este entorno, las lecturas en lote a veces solo muestran la primera; ante la duda, lee un
archivo por turno y verifica que llegó contenido.)

## Estado / dónde lo dejamos

_Actualizar al final de cada sesión._

- **2026-05-31**
  - Import → **solo pegar texto** (quitado "Subir archivo .json"); parser tolerante a bloques
    ` ```json ` y a prosa alrededor; textos simplificados sin la palabra "JSON".
  - Botón **Ajustes** ahora lleva texto (como Importar/Descargar).
  - `.nav-icon` con borde y estados claros (hover / active / focus-visible) para que se vean como
    botones.
  - Verificado: `npm run build` ✅ y `npm test` ✅ (23/23).
  - **Pendiente / ideas:** revisar visualmente en navegador; actualizar `skill/criterio/SKILL.md`
    para que indique "copia y pega el texto" (en vez de guardar archivo); posible control de
    **tamaño de letra** en Ajustes (útil para el lector mayor; hoy no existe).
