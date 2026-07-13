# Doceocho

**Sistema de gestión empresarial** para una carpintería/empresa constructora argentina. Una plataforma web integral que centraliza la administración de clientes, presupuestos, obras, stock, flujo de caja, reclamos, calendario y reportes — todo en un solo lugar.

> 🚧 **En desarrollo activo** — Actualmente estamos implementando un sistema de chat interno para mejorar la comunicación del equipo, y tenemos planificada la incorporación de un tablero Kanban como herramienta visual de gestión de flujo de trabajo.

---

## Funcionalidades

### Módulos actuales

| Módulo                   | Descripción                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**            | Resumen ejecutivo con estadísticas, alertas y eventos vencidos                                                                  |
| **Stock / Insumos**      | Gestión de inventario con precios, categorías, marcas, colores, galería de fotos y ajustes de stock                             |
| **Clientes**             | CRM completo con datos de contacto, archivos, obras vinculadas, presupuestos y balances                                         |
| **Obras**                | Seguimiento de proyectos con estado, checklists, imágenes y exportación a PDF                                                   |
| **Presupuestos**         | Creación y gestión de presupuestos por carpeta, con montos en ARS/USD, cotización del dólar y estado (vendido/perdido/aceptado) |
| **Reportes**             | Analíticas con gráficos, métricas de desempeño, rentabilidad por arquitecto y fuentes de ventas                                 |
| **Calendario**           | Agenda de eventos con tipos, colores, vencimientos y actualización en tiempo real                                               |
| **Reclamos**             | Gestión de reclamos post-venta con imágenes, estados y filtros                                                                  |
| **Caja / Flujo de Caja** | Cajas diarias, transacciones, cuentas bancarias y cierres de caja                                                               |
| **Balances**             | Saldos por cliente con historial de transacciones                                                                               |
| **Usuarios**             | Administración de usuarios del sistema con roles (Admin / Taller)                                                               |

### En desarrollo 🚧

**Chat interno** — Sistema de mensajería en tiempo real para la comunicación del equipo, con canales, mensajes, notificaciones push, edición/eliminación de mensajes y contadores de no leídos. Ya contamos con el diseño completo de la arquitectura, esquema de base de datos, hooks y componentes UI. [Ver documentación del diseño →](docs/CHAT_SYSTEM.md)

### Próximamente

**Kanban** — Tablero visual basado en la metodología ágil Kanban para gestionar el flujo de trabajo de obras y tareas. Kanban es un método visual que permite:

- Visualizar el trabajo en columnas (Pendiente → En Progreso → Completado)
- Limitar el trabajo en progreso (WIP) para evitar cuellos de botella
- Optimizar el flujo de principio a fin
- Mejorar la transparencia y la comunicación del equipo

El tablero se integrará con los módulos existentes (obras, checklists, reclamos) para ofrecer una vista unificada del estado de cada proyecto.

---

## Tecnologías

| Capa                 | Tecnología                                    |
| -------------------- | --------------------------------------------- |
| **Framework**        | Next.js 16 (App Router, Turbopack)            |
| **Lenguaje**         | TypeScript 5 (strict)                         |
| **Estilos**          | Tailwind CSS 4 + shadcn/ui + Radix UI         |
| **Base de datos**    | Supabase (PostgreSQL + RLS)                   |
| **Autenticación**    | Supabase Auth (JWT, email/contraseña)         |
| **ORM / Cliente DB** | @supabase/supabase-js + @supabase/ssr         |
| **Formularios**      | react-hook-form + zod                         |
| **Gráficos**         | Recharts                                      |
| **PDF**              | jsPDF + html2canvas                           |
| **Email**            | Nodemailer + Resend + Supabase Edge Functions |
| **Notificaciones**   | Web Push API                                  |
| **Testing**          | Jest + React Testing Library                  |
| **CI/CD**            | GitHub Actions                                |
| **Deploy**           | Vercel                                        |

---

## Empezar

### Requisitos

- Node.js 20+
- pnpm (recomendado) o npm
- Una cuenta de Supabase (gratuita)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/doceocho.git
cd doceocho

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.development .env.local
```

### Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta los schemas de `schema-supabase/` en el SQL Editor de Supabase
3. Copia las credenciales (`URL` y `ANON_KEY`) a tu `.env.local`

### Iniciar en desarrollo

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Variables de Entorno

| Variable                                              | Descripción                           |
| ----------------------------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                            | URL del proyecto Supabase             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                       | Llave anónima de Supabase             |
| `SUPABASE_SERVICE_ROLE_KEY`                           | Service role key (solo server)        |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Configuración SMTP para emails        |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`  | Claves para notificaciones push       |
| `RESEND_API_KEY`                                      | API key de Resend (email alternativo) |

---

## Scripts

| Comando              | Descripción                                  |
| -------------------- | -------------------------------------------- |
| `pnpm dev`           | Iniciar servidor de desarrollo con Turbopack |
| `pnpm build`         | Build de producción                          |
| `pnpm start`         | Iniciar servidor de producción               |
| `pnpm test`          | Ejecutar tests (Jest)                        |
| `pnpm test:watch`    | Tests en modo watch                          |
| `pnpm test:coverage` | Tests con cobertura                          |
| `pnpm lint`          | Linter (Next.js + ESLint)                    |
| `pnpm format`        | Formatear con Prettier                       |

---

## Roles de Usuario

- **Admin** — Acceso completo a todos los módulos del sistema
- **Taller** — Acceso limitado a stock, clientes y calendario

El ruteo y la UI se adaptan según el rol del usuario autenticado.

---

## Estructura del Proyecto

```
app/                      # Páginas y API routes (Next.js App Router)
├── page.tsx              # Home (redirige según rol)
├── login/                # Página de inicio de sesión
├── supplies/             # Stock / Insumos
├── clients/              # Clientes
├── works/                # Obras
├── budgets/              # Presupuestos
├── reports/              # Reportes
├── calendar/             # Calendario
├── claims/               # Reclamos
├── cash-flow/            # Caja / Flujo de caja
├── api/                  # Route Handlers (login, email, etc.)

components/
├── ui/                   # shadcn/ui primitives
├── layout/               # Dashboard layout, sidebar, header
├── provider/             # AuthProvider, ThemeProvider
├── business/             # Componentes por módulo
│   ├── balances/
│   ├── budgets/
│   ├── calendar/
│   ├── cash-flow/
│   ├── claims/
│   ├── clients/
│   ├── reports/
│   ├── stock/
│   ├── users/
│   └── works/

lib/                      # Lógica de negocio (CRUD contra Supabase)
hooks/                    # Custom hooks React
constants/                # Constantes y configuraciones de tipos
helpers/                  # Funciones auxiliares (PDF, formatos, filtros)
utils/                    # Utilidades generales
schema-supabase/          # Schemas SQL y políticas RLS
supabase/                 # Config local y Edge Functions
docs/                     # Documentación (chat, etc.)
__tests__/                # Suites de tests
```

---

## Licencia

Este proyecto es privado. Todos los derechos reservados.
