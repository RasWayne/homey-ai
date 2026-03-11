# Architecture Validation Report

## Confirmed Components

1. TRD canonical workflow stages
- Confirmed in `TRD.md`:
  - Buyer: Select property -> Submit offer -> Offer accepted -> Inspection period -> Mortgage process -> Appraisal -> Closing preparation -> Closing
  - Seller: Prepare home for sale -> List property -> Receive offers -> Accept offer -> Inspection period -> Title and escrow -> Closing preparation -> Closing

2. `transactions.current_milestone_id` replacement
- Confirmed in `TRD.md` workflow state model.
- Confirmed in `database/schema.md` (`transactions.current_milestone_id`).
- `current_stage` is no longer present in `TRD.md` or `database/schema.md`.

3. `tasks` required fields
- Confirmed in `database/schema.md` tasks table:
  - `task_order`
  - `is_required`
  - `blocked_reason`
  - `due_date`
  - `completed_at`

4. `milestones` required fields
- Confirmed in `database/schema.md` milestones table:
  - `started_at`
  - `completed_at`

5. `agent_actions` lifecycle fields
- Confirmed in `database/schema.md`:
  - `approved_by`
  - `approved_at`
  - `executed_at`
  - `execution_result`
  - `error_message`

## Remaining Inconsistencies

1. Implementation plan workflow still uses an older buyer example
- `IMPLEMENTATION_PLAN.md` Section 8 still lists a 6-stage buyer flow (missing Offer accepted and Appraisal), while TRD and schema now define canonical 8-stage flows.

2. `AGENTS.md` still declares excluded architecture areas
- `AGENTS.md` still includes `listing marketplace` and requires `showing service` and `offer service` as core services.
- This conflicts with the current direction (“do not add listing marketplace, offers, or showings systems”).

3. Cross-doc architecture statement mismatch
- `IMPLEMENTATION_PLAN.md` says not a listing marketplace, but `AGENTS.md` still includes listing marketplace in core components.

## Schema Issues

1. Timestamp naming consistency
- `documents` uses `uploaded_at` but not `created_at` (AGENTS says all tables should include `created_at`).

2. Potential FK creation order concern
- `transactions.current_milestone_id -> milestones.id` can require deferred FK creation in SQL migrations because `milestones` also references `transactions`.

## Missing Indexes

Current index recommendations are present for basic foreign keys, but likely insufficient for workflow execution/query patterns. Recommended additions:

- `milestones(transaction_id, stage_order)`
- `tasks(milestone_id, task_order)`
- `tasks(status)`
- `tasks(due_date)`
- `agent_actions(transaction_id, status, created_at)`
- `agent_actions(task_id)`
- `ai_chat_sessions(user_id, created_at)`

## Architecture Presence Check (Requested Exclusions)

- Listing marketplace:
  - Not present in `TRD.md` or `database/schema.md`.
  - Still present in `AGENTS.md` (inconsistency).

- Offers system:
  - No offers table/API in `TRD.md` or `database/schema.md`.
  - Still referenced in stage names (`Receive offers`, `Accept offer`) and in `AGENTS.md` as a required service.

- Showings system:
  - No showings table/API in `TRD.md` or `database/schema.md`.
  - Still present in `AGENTS.md` as a required service.

## Readiness for Backend Code Generation

Status: **Partially ready (not fully ready)**

Ready:
- Core workflow schema updates requested in this phase are now documented correctly.

Blocking/cleanup recommended before coding:
1. Align `IMPLEMENTATION_PLAN.md` workflow section to canonical stages.
2. Align `AGENTS.md` with the intended scope exclusion (no listing marketplace/offers/showings system implementation now).
3. Finalize additional index plan for workflow-heavy queries.
4. Clarify migration strategy for cyclic transaction/milestone FK relationship.
