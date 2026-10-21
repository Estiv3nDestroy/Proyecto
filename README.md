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
- Alertas de viabilidad: *ya aprobaste* / *matemáticamente imposible*.

### 📊 Mi semestre (dashboard)
- Promedio acumulado y comparación contra la meta.
- Gráfico de barras por materia (Recharts) con línea de referencia de la nota mínima.
- Estado general: materias aprobando vs. por mejorar.

### ☁️ Cuenta y sincronización
- Registro e inicio de sesión con correo (Supabase Auth).
- Tus materias se sincronizan entre **celular y computadora**.
- **Modo local**: si no configuras Supabase o no inicias sesión, todo funciona igual
  guardando los datos en el navegador.

### 🎨 Diseño "Cuaderno Universitario Premium"
- Hojas rayadas, margen rojo y argollas dibujadas **con CSS puro** (sin imágenes pesadas).
- Cinta adhesiva (*washi tape*), notas adhesivas (*post-it*) y sellos *APROBADO / EN RIESGO*.
- Tipografía manuscrita **Caveat** para títulos y **DM Sans** para los números.
- **Modo oscuro** ("cuaderno nocturno") con la preferencia guardada.
- Ilustraciones **SVG inline** (lápiz, cuaderno, birrete, calculadora, libros) — nunca se rompen.
- Animaciones sutiles: entrada de hojas, barras que se llenan, números que cuentan y confeti al superar la meta.

### 📱 PWA e inclusión
- Instalable como app en el celular (manifest + service worker, funciona **sin conexión**).
- Mobile-first de 360 px a escritorio, botones táctiles de **mínimo 44 px**.
- Accesibilidad: contraste AA, `aria-label`, foco visible y respeto por `prefers-reduced-motion`.

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

### Tabla necesaria en Supabase

```sql
create table public.user_subjects (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  config      jsonb not null,
  grades      jsonb not null,
  created_at  timestamptz not null default now()
);

alter table public.user_subjects enable row level security;

create policy "Cada quien ve solo sus materias"
  on public.user_subjects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
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

---

## 🧪 Pruebas

La lógica matemática vive en funciones **puras** dentro de `src/utils/gradeMath.ts`
y está cubierta por **29 pruebas** en `src/utils/gradeMath.test.ts`:

```bash
npm test
```

Cubre: promedio simple, promedio ponderado, parseo de texto con coma/punto,
aporte por categoría, nota mínima necesaria y casos borde
(categorías vacías, porcentajes ≠ 100 %, división por cero, notas fuera de escala).

---

## 🗂️ Estructura

```
src/
├── types/academic.ts          Contratos de datos del dominio
├── lib/supabase.ts            Cliente Supabase (solo desde .env)
├── utils/
│   ├── gradeMath.ts           ⭐ Toda la matemática (funciones puras)
│   ├── gradeMath.test.ts      Pruebas unitarias (Vitest)
│   ├── validation.ts          Validación de entradas
│   ├── subjectStatus.ts       Evaluación de viabilidad
│   └── subjectFactory.ts      Fábricas y escalas por defecto
├── hooks/
│   ├── useAuth.ts             Sesión con Supabase (degrada a modo local)
│   ├── useCloudSync.ts        Sincronización nube ↔ dispositivo
│   ├── useSubjects.ts         CRUD de materias + localStorage
│   ├── useTheme.ts            Cuaderno diurno / nocturno
│   ├── useGradeCalculation.ts Cálculos memoizados
│   └── useLocalStorage.ts     Persistencia defensiva
└── components/
    ├── ui/Notebook.tsx        Papel, washi, post-it, sellos, SVG, CountUp
    ├── ui/Toast.tsx           Avisos efímeros
    ├── calculator/            CategoryCalculator ⭐ · CutCalculator
    ├── dashboard/             SubjectsDashboard (Recharts)
    ├── subjects/              Sidebar y asistente de la materia
    ├── layout/                Landing · Navbar · EmptyState
    └── auth/AuthModal.tsx     Registro e inicio de sesión
```

---

## 📦 Dependencias y por qué

| Librería                | Justificación                                                        |
| ----------------------- | -------------------------------------------------------------------- |
| `react` / `react-dom`   | Núcleo de la interfaz                                                |
| `tailwindcss`           | Estilos utilitarios + variables CSS para el tema                     |
| `lucide-react`          | Iconos SVG ligeros y accesibles (tree-shaking)                       |
| `@supabase/supabase-js` | Autenticación y base de datos en la nube                             |
| `recharts`              | Gráfico de barras del dashboard (sobre SVG, responsive por defecto)  |
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

```bash
npm run build          # genera dist/index.html (archivo único)
```

Arrastra la carpeta `dist` a [Netlify Drop](https://app.netlify.com/drop) o súbela a
GitHub Pages y comparte el enlace con tus compañeros.

---

## 📄 Licencia

MIT — úsala, modifícala y compártela con tu salón.
