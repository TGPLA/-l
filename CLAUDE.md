# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

阅读回响 (ReadRecall) — a full-stack EPUB reading and active-learning application. Users import EPUBs, read with highlights/annotations, and practice through AI-generated questions, concept explanations, and paraphrasing exercises.

**Repositories and deployment:**
- GitHub: `https://github.com/TGPLA/ReadRecall.git`
- Production: `https://linyubo.top` (Tencent Cloud 114.132.47.245, Nginx → static files + Go backend proxy)
- Frontend static files on server: `/opt/1panel/www/sites/readrecall/index/`
- Backend on server: `/root/backend/` (Docker container `readrecall-backend`, port 8080)
- Database: MySQL (container `1Panel-mysql-OHb5` on `readrecall-network`)
- SSH: `ssh linyubo.top` (configured in `~/.ssh/config`, root@114.132.47.245)

### Path aliases (vite.config.ts + tsconfig.app.json)

| Alias | Resolves to |
|---|---|
| `@` | `src/` |
| `@core` | `src/core/` |
| `@infrastructure` | `src/infrastructure/` |
| `@features` | `src/features/` |
| `@shared` | `src/shared/` |

### ESLint rules specific to this project

- `@typescript-eslint/no-explicit-any` is disabled project-wide
- `react-hooks/*` (set-state-in-effect, refs, immutability, preserve-manual-memoization, purity) disabled for `src/**`
- `react-refresh/only-export-components` disabled for DuanLuoXuanRan, ToastRongQi, ToastTiShi

## Build & development commands

```bash
# Frontend (Vite dev server, proxies /api to localhost:8080)
npm run dev              # start dev server (pre-checks port)
npm run build            # production build → dist/
npm run preview          # preview production build
npm run lint             # ESLint

# Testing
npm test                 # Vitest watch mode
npm run test:run         # Vitest single run
npx vitest run tests/books.spec.ts   # run specific test file
npm run test:e2e         # Playwright E2E (headless)
npm run test:e2e:ui      # Playwright UI mode

# Backend
cd backend
go mod tidy && go mod download
go run main.go           # starts on :8080
go build -o backend.exe .   # build for Windows

# Deployment
.\deploy.ps1                         # Build frontend + SCP dist/* to server
ssh linyubo.top "cd /root/backend && docker compose up -d --build"   # Rebuild backend
```

## Architecture

### Frontend: single-page app (no React Router)

Routing is a state machine in [`src/core/App.tsx`](src/core/App.tsx#L20-L28): five pages (`shelf`, `reader`, `settings`, `concept-learning`, `concept-explanation`) rendered with opacity transitions — only the active page has `pointer-events: auto`.

```
App.tsx
  AppProvider (Context API — books, questions, settings, local storage sync)
    AuthPage (login/signup — shown when unauthenticated)
    BookShelf (book list, grid/list toggle, add/import)
    EPUBReaderPage
      EPUBReader → EPUBYueDuQuYu → ReactReader (epubjs rendering)
        + useEPUBReaderJiChuHuo (init, open/close)
        + useEPUBReaderHuoChuLi (font/theme/font-size)
        + useEPUBReaderFanYeHeYeMa (page turning + section jump)
        + useEPUBReaderShiJian (keyboard/touch events, relocated listener)
        + useEPUBReaderYangShi (CSS variables, theme colors)
        + useYueDuJinDu (reading progress via use-local-storage-state)
        + useEPUBCFi (CFI parsing/navigation)
        + annotation hooks (highlight create, click)
    SettingsPage
```

State management: [`src/infrastructure/store/index.ts`](src/infrastructure/store/index.ts) — localStorage-backed CRUD for books, questions, settings. The `AppProvider` wraps this in React Context. Many components also use `use-local-storage-state` directly for persistence (e.g., reading progress, EPUB reader preferences).

**Dual-mode persistence**: `AppProvider` checks `isAuthenticated` at runtime. When authenticated, all CRUD goes through the Go backend API via `databaseService`; when unauthenticated or backend is down, it falls back to localStorage. Backend health is polled every 30s by `healthCheck.ts` which toggles `backendAvailable` state. The `authService` singleton manages JWT tokens (stored in localStorage or sessionStorage based on "remember me") and fires change notifications via a listener pattern.

**Vite dev proxy**: `/api` and `/uploads` are proxied to `http://localhost:8080` with `changeOrigin: true`.

### Backend: Go + Gin + GORM

```
main.go → config.LoadConfig / InitDB → routes.InitRoutes()
  /api/auth/*       (JWT auth, rate-limited)
  /api/books/*      (CRUD + EPUB upload/download)
  /api/questions/*  (practice records)
  /api/ai/*         (Zhipu AI: question generation, evaluation, concept extraction)
  /api/annotations/* (highlights CRUD)
  /api/concepts/*    (concept practice)
  /api/settings/*    (user settings)
  /api/paraphrases/* (paraphrase records)
  /health
```

Controller → direct DB queries (no service layer for most CRUD). AI endpoints delegate to `services/zhipu_*.go`.

Auth: `middleware/auth_middleware.go` — JWT Bearer token (or `?token=` query param), validates against DB user existence, sets `userId`/`username`/`jti` in gin context. Logout uses JTI blacklisting (records in `token_blacklists` table).

**Database migrations**: GORM `AutoMigrate` is disabled. Manual versioned migrations (`migrateV5`, `migrateV6`, `migrateV7`) run at startup in `config/config.go:InitDB()`. Each checks column/table existence before running ALTER statements.

**Code markers**: `// @审计已完成` = audited code. `// @关键代码-不要随意删除` = critical code block with explanatory comment (do not remove).

### EPUB reader internals (critical patterns)

**epubjs page-turning timing (DO NOT regress):**
`rendition.next()` / `rendition.prev()` return a Promise that resolves BEFORE `rendition.location` is updated — epubjs updates location asynchronously via `requestAnimationFrame`. The reliable detection sequence in [`useEPUBReaderFanYeHeYeMa.ts`](src/features/books/hooks/useEPUBReaderFanYeHeYeMa.ts) is:
1. Record `scrollLeft` before calling `rendition.next()` → compare after — if scroll changed, page turned within the section
2. If scroll unchanged, wait 1 RAF frame to check if epubjs already performed cross-section `append()` and updated `location.href`
3. If still no change, do multi-frame polling via `waitForLocationChange()` (up to ~160ms across 5 RAF frames)
4. Only as last resort: manually call `rendition.display(nextSectionHref)` to jump sections

**saveImmediately causes visual flash (DO NOT regress):**
Never call `saveImmediately()` inside page-turn handlers. Reason: `saveImmediately` → `setProgressData(location)` → React re-render → `ReactReader` receives new `location` prop → calls `rendition.display(location)` → epubjs clears and rebuilds the view → user sees a flash/pull-back. Progress saving is already handled by the permanent `relocated` event listener in [`useEPUBReaderShiJian.ts`](src/features/books/hooks/useEPUBReaderShiJian.ts#L473-L482) (3-second debounce + `beforeunload` flush). See [memory/feedback_page_turn_save.md](.claude/projects/e------/memory/feedback_page_turn_save.md).

**Uploads path must be absolute (DO NOT regress):**
`router.Static("/uploads", ...)` in [`routes.go`](backend/routes/routes.go) must use an absolute path. The uploads directory is resolved via `config.UploadsPath` which checks `UPLOADS_PATH` env var → `<exe_dir>/uploads` → `<cwd>/uploads`. Never hardcode a relative path like `./uploads` or `./backend/uploads` — the working directory differs between `go run` (inside `backend/`), Docker (`/app`), and direct binary execution. A wrong relative path causes 404 on all `/uploads/` requests, making EPUBs fail to load. See commit `41db45f` for the incident (changed `./uploads` → `./backend/uploads`, broke both local and production).

### Naming conventions

Project uses pinyin for almost everything: files, components, hooks, variables, functions. Chinese comments only. Examples: `useEPUBReaderFanYeHeYeMa` (page turning), `HuaXianCaiDan` (highlight menu), `JiaZaiZhuangTai` (loading state). Import aliases: `@`, `@core`, `@infrastructure`, `@features`, `@shared`.

### Testing

- Vitest (jsdom) — `tests/*.spec.ts`, `src/**/*.test.ts`. Setup in `vitest.setup.ts` mocks global `fetch`.
- Playwright — `tests/e2e/*.spec.ts`. Config expects dev server on `http://localhost:5173`.

### CSS

TailwindCSS 3 with `darkMode: 'class'`. Dark mode toggled by `settings.darkMode` setting `document.documentElement.classList.toggle('dark')` in App.tsx.
