# Homey AI Architecture and Consistency Review

## Scope Reviewed
- `BRD.md`
- `TRD.md`
- `IMPLEMENTATION_PLAN.md`
- `AGENTS.md`
- `database/schema.md`

## Executive Summary
The architecture is directionally strong (modular NestJS backend, Next.js frontend, PostgreSQL + GCS + OpenAI), but the documents are not fully aligned yet. The biggest pre-coding issues are:

1. Product scope and service boundaries are inconsistent across docs (listing/offer/showing components).
2. AI capabilities in TRD are only partially represented in API and schema contracts.
3. Schema misses operational fields and indexes for core access patterns.
4. Workflow engine is implementable, but current schema is insufficient for deterministic stage progression and imported-stage reconciliation.

---

## 1) Inconsistencies Between Documents

### 1.1 Product scope mismatch: marketplace vs workflow-only
- `AGENTS.md` includes `listing marketplace` as a core system component (`AGENTS.md:17`).
- `IMPLEMENTATION_PLAN.md` states “Homey AI is a transaction workflow system, not a listing marketplace” (`IMPLEMENTATION_PLAN.md:23`).

Impact:
- Conflicting roadmap and service/API expectations.

Recommendation:
- Decide one explicit MVP scope and update both documents to match.

### 1.2 Required core services not fully aligned
- `AGENTS.md` requires `listing`, `showing`, `offer` services (`AGENTS.md:88-95`).
- `IMPLEMENTATION_PLAN.md` defines `Property Service` but no explicit `Listing Service`, `Showing Service`, or `Offer Service` sections (`IMPLEMENTATION_PLAN.md:61-160`).

Impact:
- Service boundary drift before implementation.

Recommendation:
- Either add those services to the plan as first-class modules, or revise AGENTS to reflect intentional MVP deferral.

### 1.3 Frontend area mismatch
- `AGENTS.md` expects pages organized by `listings`, `transactions`, `dashboard`, `documents` (`AGENTS.md:141-147`).
- `IMPLEMENTATION_PLAN.md` lists `app/dashboard`, `app/transactions`, `app/documents`, `app/settings` (missing listings) (`IMPLEMENTATION_PLAN.md:229-235`).

Impact:
- UI IA inconsistency and routing rework later.

Recommendation:
- Align App Router areas to AGENTS, or explicitly mark `listings` as deferred.

### 1.4 Workflow stage definitions differ across documents
- BRD buyer workflow includes: Select property, Submit offer, Offer accepted, Inspection, Mortgage, Appraisal, Closing prep, Closing (`BRD.md:133-140`).
- AGENTS stage examples: Search, Showings, Offer, Inspection, Financing, Closing (`AGENTS.md:167-172`).
- TRD buyer milestones are shorter and omit Offer accepted/Appraisal (`TRD.md:85-90`).
- Implementation plan uses the shorter 6-stage model (`IMPLEMENTATION_PLAN.md:252-257`).

Impact:
- Template generation ambiguity; hard to map imported stage strings reliably.

Recommendation:
- Define canonical stage taxonomy with aliases and versioning (e.g., `v1_buy_workflow`).

### 1.5 AI data architecture inconsistency (Postgres vs Firestore ownership)
- TRD positions Firestore as chat history store (`TRD.md:42`, implied in AI behavior section).
- Implementation plan says AI service owns `ai_chat_sessions` and `ai_chat_messages` while also storing chat in Firestore (`IMPLEMENTATION_PLAN.md:128-133`).
- Schema has full AI chat tables in PostgreSQL (`database/schema.md:218-283`).

Impact:
- Dual-write complexity and reconciliation risk.

Recommendation:
- Choose one source of truth for chat messages (Postgres or Firestore), then define mirror strategy explicitly if needed.

### 1.6 Security exception not reflected in API inventory
- AGENTS allows unauthenticated access for public listing search (`AGENTS.md:221-222`).
- Implementation plan API list has no public listing search endpoint (`IMPLEMENTATION_PLAN.md:186-224`).

Impact:
- Security policy and API catalog mismatch.

Recommendation:
- Add explicit public listing search route and auth annotation policy.

---

## 2) Missing Entities, Services, or APIs

### 2.1 Missing entities for required capabilities
- Offer management is listed as a core component (`AGENTS.md:19`) but no `offers` table exists.
- Showing service is required (`AGENTS.md:90`) but no `showings` table exists.
- Notifications service exists in architecture, but no `notifications` or `notification_preferences` tables.
- Vendor recommendation is in TRD AI capabilities (`TRD.md:134`, `TRD.md:143`) but no vendor/domain model exists.

### 2.2 AI action execution model only partially modeled
- TRD requires user confirmation before AI actions execute and action logging (`TRD.md:145-147`).
- Schema has `agent_actions` table, which is good (`database/schema.md:237-264`), but missing:
  - approver (`approved_by`)
  - approval/execution timestamps
  - failure reason / execution result metadata

### 2.3 Missing API endpoints for documented behavior
Recommended additions:
- Public listing search endpoint (unauthenticated): `GET /api/v1/listings/search`
- Offer endpoints:
  - `POST /api/v1/transactions/:id/offers`
  - `GET /api/v1/transactions/:id/offers`
  - `PATCH /api/v1/offers/:id/status`
- Showing endpoints:
  - `POST /api/v1/transactions/:id/showings`
  - `GET /api/v1/transactions/:id/showings`
- Notification endpoints:
  - `GET /api/v1/notifications`
  - `PATCH /api/v1/notifications/:id/read`
  - `PATCH /api/v1/users/me/notification-preferences`
- AI agent action endpoints:
  - `POST /api/v1/ai/actions`
  - `POST /api/v1/ai/actions/:id/approve`
  - `POST /api/v1/ai/actions/:id/execute`
  - `GET /api/v1/ai/actions?transaction_id=...`

---

## 3) Unnecessary Complexity

### 3.1 Dual persistence for chat without clear ownership
Maintaining full `ai_chat_messages` in PostgreSQL plus Firestore transcript storage creates synchronization overhead with little MVP value.

Recommendation:
- Pick one authoritative store for messages in MVP.
- If dual store is required, make one append-only mirror and document backfill/replay strategy.

### 3.2 Premature breadth in domain decomposition
Without implemented offer/showing/listing domain tables, adding all services immediately increases scaffolding cost with weak domain contracts.

Recommendation:
- Keep modular monolith, but implement services in strict vertical slices tied to concrete schema-backed entities.

---

## 4) Recommended Schema Changes

## 4.1 Add/adjust columns
1. `documents`: add `created_at` (AGENTS requires created_at on all tables; currently uses only `uploaded_at`) (`AGENTS.md:209`, `database/schema.md:191-203`).
2. `transactions`: replace free-text `current_stage` with stable `current_milestone_id` (FK) OR add both with canonical enum to reduce drift.
3. `tasks`:
   - add `task_order` for deterministic display/execution sequence
   - add `is_required` boolean for milestone completion logic
   - add `blocked_reason` text and `completed_at` timestamp
4. `milestones`:
   - add `started_at`, `completed_at` for analytics and SLA/reminder logic
5. `ai_chat_messages`:
   - add optional `agent_action_id` FK for traceability when assistant proposes action
6. `agent_actions`:
   - add `approved_by` (FK users)
   - add `approved_at`, `executed_at`
   - add `execution_result` (jsonb), `error_message` (text)

## 4.2 Add missing tables
1. `offers`
2. `showings`
3. `notifications`
4. `notification_preferences`
5. Optional: `vendors` + `vendor_recommendations` (if TRD vendor recommendation is in MVP)

## 4.3 Indexes to add beyond current recommendations
Current recommendations in schema are good baseline (`database/schema.md:285-300`) but incomplete.

Add indexes on:
- `transactions.current_stage` (or replacement stage field)
- `milestones(transaction_id, stage_order)` unique
- `tasks(milestone_id, task_order)`
- `tasks(status)`
- `documents(uploaded_by)`
- `ai_chat_sessions(user_id, created_at)`
- `agent_actions(transaction_id, status, created_at)`
- `agent_actions(task_id)`

## 4.4 Constraints/integrity improvements
- Unique `workflow_templates(transaction_type, name)`.
- Enforce valid stage ordering constraints at template level.
- Add ON DELETE behavior for all FKs (explicitly define CASCADE/RESTRICT semantics).
- Ensure all timestamp fields default to `CURRENT_TIMESTAMP` per schema guidance (`database/schema.md:312-316`).

---

## 5) Missing AI-Agent Capabilities vs Docs

From TRD and Implementation Plan, missing or underspecified capabilities:

1. Draft communications flow exists conceptually (`TRD.md:133-141`, `IMPLEMENTATION_PLAN.md:140`), but no explicit endpoint/UI contract for preview/edit/send.
2. Vendor recommendation capability is described (`TRD.md:134`, `TRD.md:143`) but lacks vendor data model and retrieval policy.
3. Deadline detection is listed (`TRD.md:142`, `IMPLEMENTATION_PLAN.md:143`) but missing rule engine contract and notification integration API.
4. User confirmation for every AI action is required (`TRD.md:145`) but approval lifecycle is not fully represented in APIs.
5. Auditability is required (`TRD.md:147`), but retention/log export policy is not specified.

---

## 6) Workflow Engine Implementability Assessment

## 6.1 What is implementable now
- Template-driven milestone and task generation is feasible (`database/schema.md:84-124`, `137-188`).
- Milestone/task progression with statuses is feasible.
- Imported stage onboarding can work at a basic level by mapping user-selected stage to milestone index.

## 6.2 What blocks robust implementation
1. No canonical stage dictionary/versioning, while docs use different stage names and granularity.
2. No dependency model between tasks (blocking semantics exist but no dependency graph).
3. No required/optional task indicator, making automatic milestone completion ambiguous.
4. Free-text `transactions.current_stage` risks mismatches with milestone records.

## 6.3 Minimum additions for production-grade workflow engine
- Canonical stage catalog (or controlled enums) with alias mapping for imported transactions.
- `task_order`, `is_required`, dependency relation (e.g., `task_dependencies` table) for deterministic progression.
- Milestone progress rules documented as deterministic service logic.
- Stage transition idempotency rules and conflict handling.

---

## 7) Suggested Service Boundaries (Refined)

### Keep
- User Service
- Transaction Service
- Workflow Service
- Document Service
- AI Service
- Notification Service

### Split/rename for clarity
- Replace `Property Service` with:
  - `Listing Service` (listing URL import/search/extraction)
  - `Property Service` (normalized property records and ownership)

### Add explicitly
- Offer Service
- Showing Service

### Cross-cutting modules
- AuthN/AuthZ module (Firebase JWT verification, ownership checks)
- Audit/Event module (AI actions, workflow state changes)

---

## 8) Risks Before Coding Begins

1. **Requirement drift risk**
   - Cause: conflicting scope and workflow definitions across docs.
   - Mitigation: publish canonical glossary + stage taxonomy and update all docs.

2. **Data model churn risk**
   - Cause: missing offer/showing/notification entities despite required services.
   - Mitigation: finalize schema v1 with migration plan before coding.

3. **AI governance risk**
   - Cause: action approval/audit lifecycle not fully specified in APIs/schema.
   - Mitigation: define end-to-end AI action state machine prior to implementation.

4. **Operational complexity risk**
   - Cause: dual chat persistence (Postgres + Firestore) without ownership rules.
   - Mitigation: choose single source of truth or define strict mirror contract.

5. **Workflow correctness risk**
   - Cause: stage naming inconsistency and lack of task dependency semantics.
   - Mitigation: implement canonical stage model and dependency primitives first.

---

## 9) Pre-Coding Decision Checklist

Complete these decisions before coding starts:

1. Confirm product scope: workflow-only vs workflow + listing marketplace.
2. Lock canonical workflow stage taxonomy (buy/sell) and import aliases.
3. Approve schema v1 additions (offers/showings/notifications + workflow fields).
4. Approve AI action lifecycle (suggested -> approved -> executed/cancelled + audit fields).
5. Choose chat source of truth (Postgres or Firestore) and document sync strategy.
6. Finalize API surface including public listing search and AI action endpoints.

