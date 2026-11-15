# Reglas y Pautas del Proyecto (Radar Black Mesa - Half-Life 3 Tracker)

Este archivo define las reglas mandatorias que el asistente de IA debe seguir automáticamente en cada interacción y modificación de código en este repositorio.

---

## 1. Transparencia y Consentimiento Previo (Mandatorio)
- **Nunca modificar, crear ni eliminar archivos sin autorización previa:** Antes de realizar cualquier cambio en el código o estructura del proyecto, explicar claramente:
  1. Qué archivos se van a modificar o crear.
  2. Por qué se realiza el cambio y qué problema resuelve.
  3. Esperar la confirmación y el visto bueno explícito del usuario antes de proceder.

---

## 2. Rendimiento y Buenas Prácticas en Next.js & React
- **App Router y Renderizado:**
  - Mantener la separación estricta entre **Server Components** y **Client Components** (`'use client'`).
  - **Regla crítica de SSG:** Nunca colocar `export const dynamic = 'force-dynamic'` en el `src/app/layout.tsx` raíz, ya que anula la generación estática (SSG) de rutas hijas como `/noticias/[slug]`.
- **Optimización de React:**
  - Usar `useMemo` y `useCallback` en componentes interactivos complejos (por ejemplo, el bucle de renderizado a 60 FPS del minijuego `ArcadeHalfLife`, la `CalculadoraVida` o el carrusel de noticias).
  - Mantener las dependencias de los hooks (`useEffect`, `useCallback`) estrictas y limpias, evitando re-renders o bucles innecesarios.
  - Diseñar componentes modulares con una única responsabilidad.

---

## 3. Calidad de Código, TypeScript y Base de Datos
- **Tipado estricto:** Prohibido el uso de `any`. Todos los modelos de datos (plegarias, récords de fichines, noticias, respuestas de la API de Steam) deben tener interfaces o tipos explícitos.
- **Resiliencia y Manejo de Errores (Zero Crashes):**
  - Todas las llamadas a base de datos (Neon Postgres / `pg`) y APIs externas (Steam Store API) deben estar envueltas en bloques `try/catch`.
  - En caso de caída de conexión o *cold start* de la base de datos serverless, el sistema siempre debe retornar fallbacks enriquecidos predeterminados para que la interfaz nunca quede en blanco ni muestre errores crudos al usuario.

---

## 4. Diseño, UI/UX y Estética Black Mesa
- **Consistencia del Design System de Half-Life:**
  - **Paleta oficial:** Fondo base `#09090b` (zinc-950), paneles `#18181b` (zinc-900) con bordes `#27272a` (zinc-800), acentos en naranja Black Mesa `#f97316` / `#ea580c` y ámbar `#f59e0b`.
  - **Identidad visual:** Respetar la atmósfera retro-sci-fi de Half-Life, tipografías monoespaciadas para terminales, arcades o consolas de Black Mesa, y el icónico símbolo Lambda (`λ`).
- **Soporte Bilingüe (ES / EN):**
  - Toda nueva funcionalidad, botón, texto o sección debe soportar tanto español como inglés mediante el diccionario centralizado en `src/lib/i18n.ts`.
- **Microinteracciones y Feedback:**
  - Todo elemento interactivo debe tener estados de `hover`, `active`, `focus-visible` y feedback visual o sonoro (Web Audio API retro) cuando corresponda.
- **Accesibilidad y Responsive:**
  - Semántica HTML correcta (`<main>`, `<section>`, `<article>`, `<button>`).
  - Adaptabilidad perfecta desde pantallas móviles de 360px hasta monitores 4K.

---

## 5. SEO, Google AdSense y Metadatos
- **Google AdSense:** No modificar ni romper bajo ninguna circunstancia el script y metadatos de AdSense (`ca-pub-4665232577336299`).
- **Metadatos e Iconografía:** Mantener actualizados los datos estructurados JSON-LD (Schema.org FAQPage), las OpenGraph images y la iconografía para Google Search (`favicon.ico`, `icon.svg`, `icon-192.png`, `icon-512.png` y `manifest.json`).

---

## 6. Verificación de Sanidad y Flujo de Despliegue (Git)
1. **Validación previa:** Antes de finalizar cualquier tarea técnica, verificar que la compilación de producción sea 100% exitosa mediante:
   ```bash
   npm run build
   ```
2. **Flujo de Git hacia Producción:**
   - Todo trabajo se desarrolla y prueba en la rama `develop`.
   - Se commitea y pushea a `origin/develop`.
   - Para desplegar a producción en **`radarblackmesa.online`**, se hace merge de `develop` hacia `main` y se pushea a `origin/main` (lo que dispara el despliegue automático en Vercel).
   - Siempre verificar el estado de despliegue mediante la API de GitHub o Vercel.

---

## 7. Uso Obligatorio de Herramientas y Agentes Globales (`C:\Users\hjavi\.agents`)
El asistente debe consultar y aplicar activamente las directivas de los agentes globales instalados en `C:\Users\hjavi\.agents` según la tarea a realizar:
- **Revisión de React y Componentes:** Aplicar los criterios de `agents/react-reviewer.md` y `workflows/react-review.md`.
- **Revisión de TypeScript y Errores:** Consultar `agents/typescript-reviewer.md` y `agents/build-error-resolver.md`.
- **Optimización y Rendimiento Web:** Aplicar las pautas de `agents/performance-optimizer.md`.
- **Bases de Datos (SQL / Postgres):** Seguir las mejores prácticas de `agents/database-reviewer.md`.
- **Posicionamiento y SEO:** Guiarse por `agents/seo-specialist.md`.
- **Accesibilidad:** Cumplir los estándares de `agents/a11y-architect.md`.
- **Calidad de Código y Arquitectura:** Seguir las directivas de `agents/code-reviewer.md` y el flujo de `workflows/quality-gate.md`.
