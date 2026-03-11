# PROJECT PROGRESS

EstateAI is currently in an advanced MVP/prototype stage with a working full-stack implementation: NestJS + Prisma backend APIs, Next.js frontend dashboard experience, AI chat persistence with OpenAI fallback behavior, workflow/milestone progression, document APIs, notifications APIs, background queue scaffolding, Docker local environment, and demo-data bootstrapping for instant local demos.

## CURRENT PRODUCT CAPABILITIES

The current repository implements these working capabilities:

- AI Copilot dashboard UI with a summary hero and transaction guidance sections.
- Deal health scoring API and frontend visualization.
- Transaction timeline and workflow progress views.
- Upcoming deadlines surfaced from task due dates.
- AI chat interface with persistent sessions/messages.
- Demo seed system that creates local demo user/property/transaction and writes frontend env IDs.
- Docker-based local development with Postgres, Redis, backend, and frontend services.

## ARCHITECTURE OVERVIEW

### Frontend

- Next.js 14 (App Router) with TypeScript and Tailwind CSS.
- Uses custom UI primitives inspired by shadcn style patterns.
- Calls backend REST APIs under `http://localhost:4000/api/v1`.

### Backend

- Node.js + NestJS modular monolith.
- Prisma ORM for database access.
- Global API prefix `/api/v1` configured in Nest bootstrap.
- Modules: users, properties, transactions, workflow, documents, ai, notifications, jobs.

### Database

- PostgreSQL schema managed via Prisma.
- Workflow templates seed canonical buyer/seller workflows.
- Core relational entities: users, properties, transactions, milestones, tasks, documents, ai chat, notifications.

### AI Integration

- OpenAI Chat Completions API integration in `AiService`.
- Context-enriched system prompt assembled from transaction, milestone, pending tasks, and upcoming deadlines.
- Safe fallback placeholder responses when OpenAI key is missing/placeholder or request fails.

### Infrastructure

- Docker Compose local stack: postgres, redis, backend, frontend.
- BullMQ/Redis queue and worker scaffolding for async jobs (AI + notifications pathways).
- Local setup script automates install, startup, migration, seed, and demo seed.

### Component Communication

- Frontend uses `frontend/lib/api/*` wrapper functions to call REST endpoints.
- Backend controllers route to services; services access DB through PrismaService.
- Workflow and AI services can enqueue background jobs via JobsService.
- AI and workflow APIs feed dashboard widgets and chat UI.

## FRONTEND IMPLEMENTATION

### Stack

- Framework: Next.js App Router.
- Styling: Tailwind CSS.
- UI libraries/helpers: lucide-react, clsx, tailwind-merge, class-variance-authority.
- Design system: custom reusable components under `frontend/components/ui`.

### Routing Structure

- `/dashboard`
- `/transactions`
- `/documents`
- `/ai-chat`
- `/notifications`

### Major Directories

- `frontend/app/`: route pages, global layout, global styles.
- `frontend/components/`: domain UI components (dashboard, ai, documents, layout, ui).
- `frontend/lib/`: API client/modules, shared types, utilities, formatting helpers.

### Key Frontend Files

- `frontend/app/dashboard/page.tsx`: dashboard entry page with demo-mode empty state handling and shell mounting.
- `frontend/app/layout.tsx`: shared app shell with sidebar + responsive content area.
- `frontend/components/layout/sidebar.tsx`: main navigation with lucide icons.
- `frontend/components/dashboard/dashboard-shell.tsx`: primary copilot dashboard composition (copilot card, health, deadlines, timeline, right-side chat panel).
- `frontend/components/ai/ai-chat-panel.tsx`: ChatGPT-style message bubbles and submit form bound to AI message endpoint.
- `frontend/components/ui/*`: Card, Badge, Button, Progress, Tabs primitives used across pages.
- `frontend/lib/api/client.ts`: centralized fetch wrapper with API base URL env handling.
- `frontend/lib/api/modules/*.ts`: typed endpoint wrappers for transactions, ai, documents.

## BACKEND IMPLEMENTATION

### Stack

- Node.js runtime.
- NestJS framework (not plain Express routing in repo code).
- Prisma ORM.
- PostgreSQL.
- Redis (BullMQ queue integration/scaffolding).

### API Structure

All routes are exposed under `/api/v1` (configured in `backend/src/main.ts`).

Controllers and route groups:

- Users: `backend/src/users/users.controller.ts`
  - `POST /users`
  - `GET /users/me`
  - `PATCH /users/me`
- Properties: `backend/src/properties/properties.controller.ts`
  - `POST /properties`
  - `POST /properties/import`
  - `GET /properties/:id`
- Transactions: `backend/src/transactions/transactions.controller.ts`
  - `POST /transactions`
  - `POST /transactions/import-milestone`
  - `GET /transactions/:id`
  - `PATCH /transactions/:id/current-milestone`
  - `GET /transactions/:id/next-step`
  - `GET /transactions/:id/health`
  - `GET /transactions/:id/deadlines`
  - `GET /transactions/:id/context`
- Workflow: `backend/src/workflow/workflow.controller.ts`
  - `GET /transactions/:id/milestones`
  - `GET /milestones/:id/tasks`
  - `PATCH /tasks/:id/status`
  - `GET /transactions/:id/progress`
  - `GET /transactions/:id/workflow`
- Documents: `backend/src/documents/documents.controller.ts`
  - `POST /documents/upload-url`
  - `POST /documents`
  - `GET /transactions/:id/documents`
  - `GET /documents/:id/access-url`
- AI: `backend/src/ai/ai.controller.ts`
  - `POST /ai/sessions`
  - `POST /ai/sessions/:id/messages`
  - `GET /ai/sessions/:id/messages`
  - `POST /ai/documents/:id/explain`
- Notifications: `backend/src/notifications/notifications.controller.ts`
  - `GET /notifications?userId=...`
  - `PATCH /notifications/:id/read?userId=...`
  - `PATCH /users/me/notification-preferences?userId=...`

## DATABASE SCHEMA

Schema source: `backend/prisma/schema.prisma`.

### Core Models and Purpose

- **User**: account/profile and notification preference flags; owns transactions, documents, sessions, notifications.
- **Property**: core property metadata used by transactions.
- **Transaction**: links user and property, stores type (buy/sell), tracks current milestone pointer.
- **Milestone**: ordered workflow stages per transaction with status and lifecycle timestamps.
- **Task**: milestone tasks with order, required flag, status, dueDate, completion/blocking metadata.
- **Document**: uploaded transaction documents with uploader relation and timestamps.
- **AiChatSession**: chat session scoped to user and optional transaction.
- **AiChatMessage**: ordered user/assistant messages for a session.
- **Notification**: user notifications with read state.
- **WorkflowTemplate / WorkflowTemplateTask**: reusable stage/task templates for creating workflow instances.
- **AgentAction**: records AI/agent action lifecycle (suggested/approved/executed etc.).

### Relationships (high level)

- `User -> Transaction` (1:N)
- `Property -> Transaction` (1:N)
- `Transaction -> Milestone` (1:N)
- `Milestone -> Task` (1:N)
- `Transaction -> Document` (1:N)
- `User -> Document` via uploader relation (1:N)
- `User -> AiChatSession` (1:N)
- `AiChatSession -> AiChatMessage` (1:N)
- `User -> Notification` (1:N)
- `Transaction -> AgentAction` (1:N)

### Deadline Representation Note

There is **no separate `Deadline` model** in Prisma. Deadlines are represented using `Task.dueDate` and queried in workflow services.

## AI SYSTEM

AI functionality is implemented in `backend/src/ai/ai.service.ts`.

### Current Flow

1. Client creates session via `POST /api/v1/ai/sessions`.
2. Client sends message via `POST /api/v1/ai/sessions/:sessionId/messages`.
3. Backend validates session and persists user message in `AiChatMessage`.
4. Backend assembles transaction context when available:
   - transaction type
   - current milestone
   - pending tasks
   - upcoming deadlines
5. Backend constructs system prompt and calls OpenAI (`gpt-4o-mini`) if API key is available.
6. Backend persists assistant message and returns it.
7. On failure or placeholder key, returns a fallback placeholder response.

### Storage

- Sessions stored in `AiChatSession`.
- Messages stored in `AiChatMessage` with role (`user`/`assistant`) and timestamp.

### Endpoint documented

- `POST /api/v1/ai/sessions/:sessionId/messages`

## DEMO MODE

Demo helper script:

- `backend/scripts/seed-demo.ts`

What it does:

- Upserts demo user (`Demo Buyer`, `demo@estateai.dev`).
- Creates/updates demo property (`123 Palm Ave`, Miami, FL 33101, listing price 550000).
- Finds or creates a BUY transaction for that user/property.
- Writes/updates `frontend/.env.local` with:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_DEFAULT_USER_ID`
  - `NEXT_PUBLIC_DEFAULT_TRANSACTION_ID`

Dashboard behavior:

- Dashboard pages read these env vars and auto-load demo transaction context when present.
- If not present, user sees guided empty-state cards with setup instructions.

## LOCAL DEVELOPMENT ENVIRONMENT

### Docker Compose

File: `docker-compose.yml`

Services:

- `postgres` (PostgreSQL 16)
- `redis` (Redis 7)
- `backend` (NestJS app container)
- `frontend` (Next.js app container)

### Setup Script

File: `scripts/setup-local.sh`

When run (`bash scripts/setup-local.sh`), it:

1. Verifies Docker and Docker Compose availability.
2. Requests `OPENAI_API_KEY` if missing.
3. Installs backend and frontend npm dependencies.
4. Builds/starts Docker services.
5. Runs Prisma migrations in backend container.
6. Runs workflow template seed script.
7. Runs local demo seed script (`backend/scripts/seed-demo.ts`).
8. Prints frontend/backend URLs.

## FILE STRUCTURE

Simplified repository tree:

```text
EstateAI/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seeds/workflowTemplates.ts
│   ├── scripts/
│   │   └── seed-demo.ts
│   ├── src/
│   │   ├── ai/
│   │   ├── documents/
│   │   ├── jobs/
│   │   ├── notifications/
│   │   ├── prisma/
│   │   ├── properties/
│   │   ├── transactions/
│   │   ├── users/
│   │   ├── workflow/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── ai-chat/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── notifications/
│   │   ├── transactions/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ai/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   ├── api/
│   │   ├── format.ts
│   │   └── utils.ts
│   └── Dockerfile
├── database/
│   └── schema.md
├── scripts/
│   └── setup-local.sh
├── docker-compose.yml
├── README.md
├── BRD.md
├── TRD.md
└── IMPLEMENTATION_PLAN.md
```

Folder purpose summary:

- `backend/`: API, services, schema, seeds, job scaffolding.
- `frontend/`: Next.js application, UI components, API client wrappers.
- `database/`: documentation-level schema reference.
- `scripts/`: local developer automation scripts.
- root docs (`BRD.md`, `TRD.md`, etc.): architecture and planning context.

## RECENT IMPLEMENTATIONS

Most recent major additions reflected in code:

- AI copilot-oriented dashboard shell with high-visibility summary UI.
- Modern reusable UI component primitives (Card, Badge, Button, Progress, Tabs).
- Demo seed system (`backend/scripts/seed-demo.ts`) with `.env.local` auto-write.
- Right-side “Ask EstateAI” chat panel with chat-style bubbles.
- Sidebar navigation refresh with lucide icons and notifications route.
- Timeline and deal health visual widgets connected to backend endpoints.
- Local Docker setup automation updates that include demo data bootstrapping.

## KNOWN LIMITATIONS

Current repository limitations/gaps:

- No authentication/authorization layer (many routes rely on `userId` query/body data).
- No production-grade storage integration for documents (signed URL behavior is placeholder-based).
- No dedicated document generation engine for state-specific standardized forms.
- No digital signature integration.
- Risk analysis is basic (score derived from completion/overdue counts, not legal/financial NLP).
- Jobs/workers are scaffolded but currently minimal and not yet a full async processing pipeline.
- No explicit marketplace/offers/showings subsystem (intentionally out of current MVP scope).

## NEXT DEVELOPMENT PRIORITIES

Logical next engineering steps based on current state:

1. Add authentication/authorization and secure route ownership checks.
2. Build document generation engine for state-specific forms and template filling.
3. Integrate e-signature workflow for transaction documents.
4. Expand AI document explanation into robust clause extraction and risk tagging.
5. Add automated deadline monitoring jobs and proactive notification scheduling.
6. Improve risk scoring beyond task completion (contract-level and timeline-level signals).
7. Harden production deployment setup (secrets, environment separation, observability, CI/CD).
