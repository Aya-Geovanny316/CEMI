# Repository Guidelines

## Project Structure & Module Organization
- Work inside `api/` (Django backend) or `frontend/` (React app).
- Backend: core config in `api/api/settings.py`; endpoints and business logic live in `api/api/views/`, `serializers/`, `models/`, and `path/`. Shared helpers belong in `api/api/utils/`. Static/templates are under `api/api/static` and `api/api/templates`.
- Frontend: source in `frontend/src/`, public assets in `frontend/public/`, production build in `frontend/build/`.
- Database engines are toggled via `.env`: set `DB_ENGINE=mssql` (default) or `DB_ENGINE=mysql` to load the correct Django backend plus matching credentials (see `DB_PRUEBAS_*` / `DB_PROD_*`). The migration `api/api/migrations/0033_*` conditionally drops legacy tables per engine.

## Build, Test, and Development Commands
- Backend setup: from `api/`, create/activate a venv (`python -m venv venv` then `source venv/bin/activate`) and install deps with `pip install -r requirements.txt`.
- Backend run: `python manage.py runserver` (from `api/`; relies on `.env` for DB and host config).
- Backend tests: `python manage.py test` (add tests first; see testing section).
- Frontend install: from `frontend/`, run `npm install`.
- Frontend dev: `npm start` (runs patched CRA dev server on port 3000).
- Frontend build: `npm run build` (outputs optimized assets to `frontend/build/`).

## Coding Style & Naming Conventions
- Python: follow PEP 8, 4-space indents; favor descriptive snake_case for functions/variables and PascalCase for classes. Keep views/serializers lean and move shared helpers into `api/api/utils/`.
- React: components in `frontend/src/` use PascalCase filenames; hooks/helpers in `camelCase`. ESLint extends CRA with a few rules disabled—avoid unused code and keep effects scoped.
- Prefer `.env` values over hardcoding endpoints or credentials.

## Testing Guidelines
- Backend: place Django tests in `tests.py` within each app or in `tests/` packages named `test_*.py`. Mock DB/external calls to keep tests deterministic.
- Frontend: use `npm test` (Jest + React Testing Library). Name files `*.test.js` near the component or under `frontend/src/__tests__/`.
- Aim to exercise new endpoints, reducers, and critical UI flows; add fixtures for edge cases.

## Commit & Pull Request Guidelines
- Use concise, imperative commits. Conventional prefixes are encouraged (`feat:`, `fix:`, `chore:`, `docs:`); include scope when helpful (e.g., `feat(api): add patient search endpoint`).
- For PRs, include purpose/summary, screenshots or cURL samples for API changes, linked issues/tickets, and test notes (`npm test`, `python manage.py test`, or manual steps). Call out migrations or breaking changes explicitly.

## Configuration & Security Tips
- Keep environment files in `api/.env` and `frontend/.env`; do not commit them. Document required keys in PRs when adding new config.
- When targeting SQL Server, set `SQL_ODBC_DRIVER` and optional `SQL_ENCRYPT`, `SQL_TRUST_SERVER_CERT`, `SQL_EXTRA_PARAMS`; for MySQL prefer `MYSQL_CHARSET=utf8mb4`. Update `DB_ENGINE` accordingly before running migrations.
- If you introduce new services (DB, cache, queue), add setup notes and default ports to this guide and to service-specific READMEs.

## Recent Domain Notes
- Carga masiva de admisiones: el endpoint `mantenimiento/carga-masiva/admisiones/crear/` usa lectura en streaming y procesa en lotes (configurable con `chunk_size`) para archivos grandes. El frontend muestra aviso si el POST se corta por timeout, porque el procesamiento sigue en servidor. El archivo base ya no se usa; siempre se sube un .xlsx.
- Admisiones: el modal de ver/editar en `/dashboard/ingresos/gestion-registros` replica el layout del formulario de nueva solicitud (perfil de paciente, detalles de ingreso, contacto de soporte, cobertura); datos laborales y tabs antiguos se removieron.
