# 📘 NotaMínima

> **¿Cuánto necesitas para pasar la materia?**
> Calculadora de notas universitarias por categorías y cortes, con estética de
> cuaderno, proyección de semestre y sincronización en la nube.

Hecha con **React 19 + TypeScript + Vite + Tailwind CSS 4 + Supabase**.
100 % en español, pensada para estudiantes de Latinoamérica.

---

## ✨ Funcionalidades

### 🧮 Calculadora de notas por categoría *(función principal)*
- Crea categorías con nombre y porcentaje (ej. **Formativa 50 %**, **Parcial 50 %**).
- Valida en tiempo real que los porcentajes **sumen exactamente 100 %**.
- Escribe varias notas separadas por **coma, espacio o salto de línea**: `2.0, 3.0, 4.0`.
- Muestra al instante: **promedio de cada categoría**, **aporte en puntos** y **nota total del corte**.
- **Modo simple** (promedio aritmético) y **modo ponderado** (cada nota con su propio peso).
- **Modo "¿Cuánto necesito?"**: deja vacía la nota que falta y te dice la nota mínima exacta
  para llegar a la meta. Si es imposible, te lo dice claramente.
- Escala configurable: **0–5**, **0–10**, **0–100** y decimales de 0 a 3.
- Resultados con **colores de resaltador**: 🟢 aprobando · 🟡 en riesgo · 🔴 reprobando.
- Barras de progreso con estilo de **regla escolar**.
- Botones: **copiar resumen**, **guardar en la materia**, **deshacer** y **limpiar**.
- Acepta coma o punto decimal e **ignora texto inválido con un mensaje amable**.

### 🎓 Proyección de semestre
- 3 cortes con pesos configurables (30/30/40 por defecto).
- Calcula la **nota exacta** que necesitas en el corte pendiente.
- Simulador *"¿y si saco X?"* con deslizador en tiempo real.
- Botones de escenario: **mejor caso**, **peor caso**, **realista**.
- Alertas de viabilidad: *ya aprobaste* / *matemáticamente imposible*.

### 📊 Mi semestre (dashboard)
- **Promedio acumulado ponderado por créditos** (configurables por materia).
- Comparación contra la meta global.
- Gráfico de barras por materia (Recharts) con línea de referencia de la nota mínima.
- Estado general: materias aprobando vs. por mejorar.
- Filtro por semestre activo.

### 📅 Semestres
- Crea, renombra, archiva y elimina semestres.
- Las materias se filtran por semestre activo.
- Promedio ponderado calculado por semestre.

### 📋 Plan de estudio inteligente
- Muestra **"necesitas X en el parcial"** para cada materia.
- Marca el riesgo de cada materia en **verde / amarillo / rojo**.
- Ordena las materias por urgencia.

### 🗓️ Agenda de entregas
- Registra exámenes, entregas y presentaciones con fecha.
- **Cuenta regresiva** automática y orden por urgencia.
- Marca como completada y elimina items.
- **Notificaciones del navegador** para los próximos eventos.

### 📈 Historial y evolución
- **Gráfico del promedio** a lo largo del tiempo (Recharts).
- Guarda puntos (*snapshots*) del promedio cuando quieras.
- Filtra por semestre.

### 🎯 Metas
- Meta global de promedio y meta por materia.
- Barra de avance visual para cada meta.

### 🏆 Logros y rachas
- Insignias que se desbloquean al alcanzar hitos.
- **Notificaciones** al desbloquear un logro.
- Racha de días estudiando con Pomodoro.

### ⏱️ Pomodoro
- Temporizador de 25/5 minutos configurable.
- Registra el tiempo estudiado **por materia**.
- Cuenta total de minutos por materia y globales.

### 💾 Respaldo de datos
- Exporta todas tus materias como **archivo JSON**.
- Importa un respaldo con **validación** de estructura.
- Compatible con la nube: al importar, se sincroniza.

### ☁️ Cuenta y sincronización
- Registro e inicio de sesión con correo (Supabase Auth).
- Tus materias se sincronizan entre **celular y computadora** mediante **upsert** por id.
- **Debounce** de 800ms al guardar + **reintento automático** (hasta 3 intentos).
- Detección de **cambios desde otro dispositivo**.
- **Recuperación de contraseña** por correo.
- **Cambiar nombre** desde el panel "Mi cuenta".
- **Eliminar cuenta y datos** con confirmación.
- **Modo local**: si no configuras Supabase o no inicias sesión, todo funciona igual
  guardando los datos en el navegador. Un banner explica qué se pierde sin cuenta.
- **Pantalla de privacidad**: qué se guarda, dónde y por qué.

### 🎨 Diseño "Cuaderno Universitario Premium"
- Hojas rayadas, margen rojo y argollas dibujadas **con CSS puro** (sin imágenes pesadas).
- Cinta adhesiva (*washi tape*), notas adhesivas (*post-it*) y sellos *APROBADO / EN RIESGO*.
- Tipografía manuscrita **Caveat** para títulos y **DM Sans** para los números.
- **Modo oscuro** ("cuaderno nocturno") con la preferencia guardada.
- Ilustraciones **SVG inline** (lápiz, cuaderno, birrete, calculadora, libros) — nunca se rompen.
- Animaciones sutiles: entrada de hojas, barras que se llenan, números que cuentan y confeti al superar la meta.
- Configurador de estilo: color de hoja, resaltador y tinta.

### 📱 PWA e inclusión
- Instalable como app en el celular (manifest + service worker, funciona **sin conexión**).
- **Íconos SVG** (192 y 512) con propósito `any` y `maskable`.
- **Aviso "Hay una versión nueva"** sin perder datos.
- **Pantalla offline** amigable cuando no hay conexión.
- **Onboarding de 3 pasos** la primera vez (con opción de saltarlo).
- Mobile-first de 360 px a escritorio, botones táctiles de **mínimo 44 px**.
- Accesibilidad: contraste AA, `aria-label`, foco visible y respeto por `prefers-reduced-motion`.
- Fuentes con `display=swap` para evitar bloqueo de render.

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias (requiere Node.js 18+)
npm install

# 2. Configurar las variables de entorno
cp .env.example .env
#    …y edita .env con tus credenciales de Supabase (opcional)

# 3. Arrancar en desarrollo  →  http://localhost:5173
npm run dev
```

> 💡 **¿Sin Supabase?** La app arranca perfectamente sin `.env`: funciona en
> *modo local* guardando todo en el navegador. La nube es opcional.

---

## 🔑 Variables de entorno

Copia `.env.example` a `.env` y rellena:

| Variable                 | Obligatoria | Descripción                                             |
| ------------------------ | ----------- | ------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | No          | URL del proyecto Supabase (*Settings → API*)            |
| `VITE_SUPABASE_ANON_KEY` | No          | Clave pública `anon` del proyecto                       |
| `VITE_APP_NAME`          | No          | Nombre mostrado en la app (por defecto `NotaMínima`)    |

Las credenciales **nunca** están escritas en el código fuente: se leen solo
desde variables de entorno. `.env` está ignorado por Git.

### Base de datos (Supabase)

Las migraciones se aplican automáticamente en el proyecto de Supabase
provisionado. Si necesitas replicar el esquema manualmente:

```sql
-- Tabla principal
create table public.user_subjects (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name        text not null,
  config      jsonb not null,
  grades      jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.user_subjects enable row level security;

-- 4 políticas (una por verbo CRUD), solo el dueño puede acceder
create policy "select_own_subjects" on public.user_subjects for select
  to authenticated using (auth.uid() = user_id);
create policy "insert_own_subjects" on public.user_subjects for insert
  to authenticated with check (auth.uid() = user_id);
create policy "update_own_subjects" on public.user_subjects for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own_subjects" on public.user_subjects for delete
  to authenticated using (auth.uid() = user_id);

-- Trigger para updated_at automático
create function set_user_subjects_updated_at() returns trigger
  language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_set_user_subjects_updated_at
  before update on public.user_subjects
  for each row execute function set_user_subjects_updated_at();
```

---

## 📜 Scripts

| Comando              | Qué hace                                                      |
| -------------------- | ------------------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo con recarga en caliente                |
| `npm run build`      | Compila a **un único archivo** `dist/index.html`              |
| `npm run preview`    | Sirve localmente el build de producción                       |
| `npm test`           | Ejecuta las pruebas unitarias (Vitest)                        |
| `npm run test:watch` | Pruebas en modo observador                                    |
| `npm run lint`       | Verificación de tipos (TypeScript estricto)                  |

---

## 🧪 Pruebas

La lógica matemática vive en funciones **puras** dentro de `src/utils/` y está
cubierta por **77 pruebas** en Vitest:

```bash
npm test
```

Cubre:
- **Promedio simple y ponderado** (`gradeMath.test.ts`, 29 tests)
- **Simulador "¿y si?"** (`whatIfSimulation.test.ts`, 13 tests)
- **Evaluación de riesgo** verde/amarillo/rojo (`riskAssessment.test.ts`, 8 tests)
- **Matemática de semestres** y promedio ponderado por créditos (`semesterMath.test.ts`, 16 tests)
- **Importación/exportación** de respaldos con validación (`dataTransfer.test.ts`, 11 tests)

Casos borde: categorías vacías, porcentajes ≠ 100 %, división por cero, notas
fuera de escala, materias sin notas, escalas 0-5 / 0-10 / 0-100.

---

## 🗂️ Estructura

```
src/
├── types/academic.ts              Contratos de datos del dominio
├── lib/supabase.ts                Cliente Supabase (solo desde .env)
├── utils/
│   ├── gradeMath.ts               ⭐ Toda la matemática (funciones puras)
│   ├── gradeMath.test.ts          Pruebas unitarias
│   ├── whatIfSimulation.ts        Simulador "¿y si?"
│   ├── whatIfSimulation.test.ts
│   ├── riskAssessment.ts          Evaluación de riesgo verde/amarillo/rojo
│   ├── riskAssessment.test.ts
│   ├── semesterMath.ts            Promedio ponderado por créditos
│   ├── semesterMath.test.ts
│   ├── dataTransfer.ts            Exportación/importación JSON
│   ├── dataTransfer.test.ts
│   ├── validation.ts              Validación de entradas
│   ├── subjectStatus.ts           Evaluación de viabilidad
│   ├── subjectFactory.ts          Fábricas y escalas por defecto
│   └── cn.ts                      Composición de clases
├── hooks/
│   ├── useAuth.ts                 Sesión, recuperar contraseña, eliminar cuenta
│   ├── useCloudSync.ts            Upsert con debounce y reintento
│   ├── useSubjects.ts             CRUD de materias + localStorage
│   ├── useSemesters.ts            CRUD de semestres
│   ├── useTheme.ts                Cuaderno diurno / nocturno
│   ├── useNotebookStyle.ts        Color de hoja, tinta, resaltador
│   ├── useGradeCalculation.ts     Cálculos memoizados
│   ├── useAgenda.ts               Agenda de entregas
│   ├── usePomodoro.ts             Temporizador Pomodoro
│   ├── useGoals.ts                Metas por materia y global
│   ├── useAchievements.ts         Logros desbloqueables
│   ├── useHistory.ts              Snapshots del promedio
│   └── useLocalStorage.ts         Persistencia defensiva
├── components/
│   ├── ui/Notebook.tsx            Papel, washi, post-it, sellos, SVG, CountUp
│   ├── ui/Toast.tsx               Avisos efímeros
│   ├── ui/Button.tsx, Badge.tsx, Alert.tsx, Card.tsx
│   ├── calculator/                CategoryCalculator ⭐ · CutCalculator
│   ├── dashboard/                 SubjectsDashboard (Recharts)
│   ├── subjects/                  Sidebar y asistente de la materia
│   ├── plan/                      StudyPlan · WhatIfSimulator
│   ├── agenda/                    AgendaPanel
│   ├── goals/                     GoalsPanel
│   ├── achievements/              AchievementsPanel
│   ├── pomodoro/                  PomodoroTimer
│   ├── history/                   HistoryChart (Recharts)
│   ├── results/                   Resultados de proyección
│   ├── semesters/                 SemesterSelector
│   ├── settings/                  BackupModal (exportar/importar)
│   ├── auth/                      AuthModal · AccountPanel · PrivacyScreen
│   ├── layout/                    Landing · Navbar · EmptyState ·
│   │                              LocalModeBanner · UpdateNotice · Onboarding
│   └── steps/                     ConfigStep · GradesStep
public/
├── manifest.webmanifest           PWA manifest
├── sw.js                          Service worker (offline + update notice)
├── icon-192.svg, icon-512.svg     Íconos PWA
├── og-image.svg                   Imagen Open Graph (1200×630)
└── offline.html                   Pantalla sin conexión
```

---

## 📦 Dependencias y por qué

| Librería                | Justificación                                                        |
| ----------------------- | -------------------------------------------------------------------- |
| `react` / `react-dom`   | Núcleo de la interfaz                                                |
| `tailwindcss`           | Estilos utilitarios + variables CSS para el tema                     |
| `lucide-react`          | Iconos SVG ligeros y accesibles (tree-shaking)                       |
| `@supabase/supabase-js` | Autenticación y base de datos en la nube                             |
| `recharts`              | Gráficos de barras e historial (sobre SVG, responsive por defecto)   |
| `clsx` + `tailwind-merge` | Composición segura de clases                                       |
| `vitest` *(dev)*        | Pruebas unitarias de la lógica matemática                            |

Las animaciones, el papel, el confeti y el contador están hechos con **CSS y
`requestAnimationFrame`**, sin librerías adicionales.

---

## 🧮 Cómo probar la calculadora

**Ejemplo 1 — Nota del corte**

1. Abre la pestaña **Calculadora**.
2. En *Formativa* (50 %) escribe: `2.0, 3.0, 4.0` → promedio **3.00**, aporta **1.50**.
3. En *Parcial* (50 %) escribe: `3.0` → promedio **3.00**, aporta **1.50**.
4. **Total del corte = 3.00** con sello 🟢 *APROBADO*.

**Ejemplo 2 — ¿Cuánto necesito?**

1. Cambia la **Meta** a `3.5`.
2. Borra la nota del *Parcial* (déjalo vacío).
3. La app responde: **4.00** → *"Necesitas sacar 4.00 en lo que falta (50 %) para llegar a 3.5"*.

---

## 🌐 Publicar gratis

### Opción 1: Netlify Drop (lo más fácil)

```bash
npm run build          # genera dist/index.html (archivo único)
```

Arrastra la carpeta `dist` a [Netlify Drop](https://app.netlify.com/drop) y
comparte el enlace con tus compañeros.

### Opción 2: GitHub Pages

```bash
npm run build
# Sube el contenido de dist/ a la rama gh-pages
```

### Opción 3: Vercel

Conecta tu repositorio y Vercel detecta Vite automáticamente. El comando de
build es `npm run build` y el output está en `dist/`.

> **Nota sobre PWA**: El service worker solo se registra en producción (bajo
> HTTPS o localhost). Si pruebas en desarrollo, la app funciona sin él.

---

## 📱 Instalar como app en el celular

1. Abre la app en el navegador del celular (Chrome, Safari, Edge).
2. En el menú (⋮ o compartir), selecciona **"Instalar app"** o **"Añadir a pantalla de inicio"**.
3. La app se abre como una aplicación nativa, funciona sin conexión y muestra el ícono de cuaderno.

---

## 🔒 Privacidad

- **Sin cuenta**: tus datos se guardan solo en el navegador del dispositivo.
- **Con cuenta**: tus datos se sincronizan en Supabase (cifrado en tránsito y reposo).
- No usamos cookies de seguimiento ni publicidad.
- Puedes exportar y eliminar tus datos en cualquier momento desde "Mi cuenta".

---

## 📄 Licencia

MIT — úsala, modifícala y compártela con tu salón.
