# Restaurant Management System

## Tech Stack

### Backend (`/api`)
- **Framework:** Laravel 13.x (PHP 8.4+)
- **Authentication:** Laravel Sanctum
- **Real-time:** Laravel Reverb (via Laravel Echo)
- **Database Utilities:** Spatie Query Builder
- **Testing:** PHPUnit
- **Linting:** Laravel Pint

### Frontend (`/web`)
- **Framework:** React 19 (TypeScript 6.0)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4.x (with Shadcn UI)
- **State Management:** Zustand 5
- **Data Fetching:** TanStack Query (React Query) 5
- **Routing:** React Router 7
- **Internationalization:** i18next
- **Real-time:** Laravel Echo

## Architecture & Conventions

### General
- Use **Surgical Updates** for all code changes.
- Prioritize **Composition over Inheritance**.
- Maintain **Type Safety** throughout the project (TypeScript for frontend, strict types for PHP).

### Backend (`/api`)
- Follow **PSR-12** coding standards via Laravel Pint.
- Use **Spatie Query Builder** for filtering, sorting, and including relationships in API requests.
- All API responses should be JSON.
- Business logic should ideally reside in **Actions** or **Services** if they become too complex for Controllers.

### Frontend (`/web`)
- Follow **Functional Components** pattern with Hooks.
- Use **TanStack Query** for all server state management.
- Use **Zustand** for global UI/Client state.
- Components should be modular and stored in `src/components`.
- Use **Shadcn UI** components for UI primitives.
- Internationalization strings must be managed via `i18n` locales.

## Workflows

### Development
- Run `composer dev` in the `api` directory to start all backend services (Server, Queue, Reverb, Pail).
- Run `npm run dev` in the `web` directory for the frontend.

### Testing
- Backend: `php artisan test`
- Frontend: `npm run lint`
