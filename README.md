# Half-Life 3 Tracker & Arcade 🕹️λ

Sitio web interactivo, comunidad de seguimiento, cronología de filtraciones y minijuego arcade 2D temático en honor a la espera de **Half-Life 3**.

Construido con **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **HTML5 Canvas API**, **Web Audio API** y **PostgreSQL**.

---

## ✨ Características

### 🕹️ 1. Minijuego Arcade 2D (`ArcadeHalfLife.tsx`)
- Motor de juego propio en **HTML5 Canvas** con físicas 2D, renderizado por frames y partículas.
- Sistema de combate: pistolas, escopetas, daño progresivo y oleadas de enemigos (*Headcrabs*, soldados Combine, etc.).
- Sistema de puntuación y tabla de récords con tags de 5 letras persistidos en base de datos.
- Controles fluidos de teclado y panel responsive.

### 📻 2. Radio Black Mesa (`RadioBlackMesa.tsx`)
- Reproductor de audio ambientado con estética de terminal científica retro.
- Efectos de sonido y banda sonora icónica (*Hazardous Environments*) mediante Web Audio API.

### ⏳ 3. Calculadora de Vida y Cronología (`CalculadoraVida.tsx`, `LineaTiempoHL3.tsx`)
- Muestra el tiempo transcurrido desde el lanzamiento de *Half-Life 2: Episode Two* (10 de octubre de 2007).
- Línea de tiempo interactiva con hitos oficiales, registros en SteamDB, declaraciones de Gabe Newell y filtraciones de patentes/marcas.

### 📰 4. Artículos y API Dinámica
- Noticias y reportes estructurados con rutas dinámicas (`/noticias/[slug]`).
- Endpoints REST para récords (`/api/records`), plegarias (`/api/plegarias`), recuento de cachetadas (`/api/cachetadas`) y estado de Steam (`/api/steam`).
- Widgets embebibles (`/embed`) para insertar el contador en foros o sitios web externos.

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 15, React 18, Tailwind CSS v4, Lucide Icons.
- **Gráficos & Sonido:** HTML5 Canvas API (juego arcade) y Web Audio API.
- **Lenguaje:** TypeScript 5.
- **Base de Datos:** PostgreSQL con driver `pg`.
- **Contenedores:** Docker & Docker Compose.
- **Despliegue & Analítica:** Vercel Analytics.

---

## 🚀 Inicio Rápido (Desarrollo Local)

### 1. Clonar el repositorio
```bash
git clone https://github.com/valdivieso01/half-life-3-tracker.git
cd half-life-3-tracker
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Levantar la base de datos PostgreSQL con Docker
```bash
docker compose up -d
```
Esto creará y arrancará un contenedor PostgreSQL configurado en el puerto `5432`.

### 4. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hl3_db"
```

### 5. Iniciar la aplicación
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación y jugar al arcade.

---

## 📄 Licencia

Este proyecto es un tributo no comercial desarrollado por fans de la saga Half-Life y Valve Corporation. Half-Life y el logotipo de Lambda son marcas registradas de Valve Corporation.
