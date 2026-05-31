# Criterio

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img alt="Zod" src="https://img.shields.io/badge/Zod-3-3E67B1?logo=zod&logoColor=white" />
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-2-6E9F18?logo=vitest&logoColor=white" />
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white" />
  <img alt="Netlify" src="https://img.shields.io/badge/Netlify-deploy-00C7B7?logo=netlify&logoColor=white" />
  <img alt="CI" src="https://github.com/arebury/criterio/actions/workflows/ci.yml/badge.svg" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue" />
</p>

**Demo en vivo → [criterio-areses.netlify.app](https://criterio-areses.netlify.app)**

Lectura editorial profunda sobre un lote diario de artículos: resúmenes de 150 palabras,
una síntesis agregada y un **debate socrático** que entrena el juicio en lugar de limitarse
a informar.

Criterio es una aplicación web cliente (sin backend) que renderiza una "edición" —el contenido
de un día— y la convierte en una sesión de lectura y debate. El contenido lo genera un modelo
de lenguaje (la skill de Claude incluida, o cualquier fuente que cumpla el contrato de datos);
la app se encarga de leerlo, debatirlo, exportarlo y guardarlo.

- **Stack:** React 18 · TypeScript · Vite · Zod. Sin servidor, sin base de datos.
- **Estado:** cliente puro. Las ediciones importadas viven en `localStorage`; la carpeta de
  exportación, en `IndexedDB`.
- **Despliegue:** estático en Netlify (ver [Despliegue](#despliegue)).

---

## Por qué existe

El producto parte de una tesis del propio contenido que analiza: _la IA reduce el coste de
producir, no el de equivocarse; el juicio es la habilidad escasa._ Criterio materializa esa
idea en cuatro vistas:

| Vista         | Qué hace                                                                        |
| ------------- | ------------------------------------------------------------------------------- |
| **Síntesis**  | El editorial del día en tipografía de lectura larga.                            |
| **Resúmenes** | Una tarjeta por artículo con el resumen de 150 palabras.                        |
| **Artículos** | Acordeón con las notas fuente condensadas.                                      |
| **Debate**    | 8 preguntas socráticas, una a una, con corrección inmediata y debate en Claude. |

---

## Cómo funciona (pipeline)

```
Artículos del día ──▶ Generador (skill de Claude) ──▶ edición JSON ──▶ Importar en Criterio ──▶ Leer · Debatir · Exportar
```

El acoplamiento entre "quién genera el contenido" y "cómo se muestra" es **un solo contrato
JSON** (ver [El contrato de datos](docs/ARCHITECTURE.md#4-el-contrato-de-datos-la-edición)).
Cualquier fuente que emita ese JSON —la skill de Claude, un GPT de ChatGPT adaptado, una futura
ingesta automática o un humano— funciona con la app sin tocar el código.

### El debate, sin coste de API

El debate no llama a ninguna API de pago. Cuando respondes una pregunta:

1. La app valida tu respuesta **al instante** (panel de corrección inline, aciertes o falles).
2. Pulsas **"Copiar debate para Claude"**: la app arma un prompt autocontenido (pregunta,
   tu respuesta, la corrección, extractos de los artículos) y lo copia al portapapeles.
3. Lo pegas en un chat normal de Claude. Si fallaste, el prompt es deliberadamente más
   exigente y contraargumenta tu elección.

Así reutilizas una suscripción a Claude en lugar de pagar tokens de API aparte.

---

## Inicio rápido

Requisitos: Node ≥ 18.18 y npm.

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
```

La app arranca con una edición de ejemplo (`public/issues/2026-05-29.json`). Para añadir la
tuya, pulsa **Importar** y pega el JSON, o súbelo como archivo.

### Scripts

| Script              | Acción                                     |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo con HMR.            |
| `npm run build`     | Typecheck + build de producción a `dist/`. |
| `npm run preview`   | Sirve el build de producción localmente.   |
| `npm run typecheck` | `tsc` en modo proyecto, sin emitir.        |
| `npm run lint`      | ESLint (flat config).                      |
| `npm test`          | Tests unitarios con Vitest.                |
| `npm run test:e2e`  | Tests end-to-end con Playwright.           |
| `npm run format`    | Prettier sobre todo el repo.               |

---

## Desarrollo

Todo cambio debe pasar la misma verificación que ejecuta la CI:

```bash
npm run typecheck   # tipos
npm run lint        # ESLint (flat config)
npm test            # unitarias (Vitest)
npm run build       # build de producción
```

Para los flujos de UI, además: `npm run test:e2e` (requiere navegadores: `npx playwright install`).

**Convenciones:**

- **Formato:** Prettier (`npm run format`); configuración en `.prettierrc.json`.
- **Código:** TypeScript estricto. Comentarios en inglés; UI y documentación en español.
- **El contrato manda:** cualquier cambio en la forma de una edición se hace primero en
  [`src/schema/issue.ts`](src/schema/issue.ts) y se documenta en
  [el contrato de datos](docs/ARCHITECTURE.md#4-el-contrato-de-datos-la-edición). Si rompe
  compatibilidad, incrementa `version` y añade migración en la lectura.

---

## Exportar a una carpeta fija (estilo "Export location")

Cada edición se puede descargar como un **HTML autocontenido** (lector offline, con su debate
incluido) cuyo nombre lleva la fecha: `criterio-AAAA-MM-DD.html`.

En **Chrome, Edge, Brave o Arc** sobre HTTPS, Ajustes → _Carpeta de exportación_ te deja elegir
una carpeta una vez (vía [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_API));
la app recuerda el permiso y guarda siempre ahí, igual que la "Export location" de una app
nativa. En **Safari** —que no implementa esa API— la descarga cae a la carpeta _Descargas_ del
sistema, con el mismo nombre fechado.

---

## Despliegue

Ya está desplegado en [criterio-areses.netlify.app](https://criterio-areses.netlify.app). El
repositorio incluye [`netlify.toml`](netlify.toml) con build (`npm run build`), carpeta de
publicación (`dist`), redirección SPA y cabeceras de seguridad.

**Despliegue continuo (recomendado).** Para que cada `push` a `main` redespliegue solo, conecta
el repo una vez en Netlify: **Site → Build & deploy → Link repository → GitHub → arebury/criterio**.
Netlify lee `netlify.toml` y no hay que configurar nada más.

**Despliegue manual por CLI** (lo usado para la primera publicación):

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## Estructura del proyecto

```
criterio/
├─ src/
│  ├─ schema/issue.ts        # contrato de datos (Zod) — fuente de verdad
│  ├─ lib/                   # download, debate, tts, export-html, issues, storage
│  ├─ state/store.tsx        # store (React Context): biblioteca + ajustes
│  ├─ components/            # Nav, Synthesis, Summaries, Articles, Debate, modales…
│  └─ styles/app.css         # sistema de diseño editorial
├─ public/issues/            # ediciones de ejemplo + index.json
├─ skill/                    # la skill de Claude (genera el JSON) + .skill empaquetada
├─ reference/                # el artifact HTML original, preservado
└─ docs/ARCHITECTURE.md      # arquitectura + contrato de datos + roadmap
```

---

## La skill de Claude

[`skill/criterio/SKILL.md`](skill/criterio/SKILL.md) (empaquetada en `skill/criterio.skill`)
toma 6–20 artículos y emite el JSON de la edición. Es el generador de referencia, pero no el
único posible: el contrato está documentado para que cualquier fuente lo alimente.

---

## Documentación

Toda la referencia técnica vive en un único documento, [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md):
[arquitectura y decisiones](docs/ARCHITECTURE.md#2-decisiones-de-diseño) ·
[contrato de datos](docs/ARCHITECTURE.md#4-el-contrato-de-datos-la-edición) ·
[roadmap](docs/ARCHITECTURE.md#6-roadmap).

## Licencia

[MIT](LICENSE).
