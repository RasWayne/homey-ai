# EstateAI Technical Requirements Document

Version: v2

---

## 1. System Overview

EstateAI is a workflow platform that guides users through buying or selling a home.

The system organizes transactions into:

- milestones
- tasks
- documents
- AI guidance

The architecture prioritizes modular services and scalable cloud infrastructure.

---

## 2. Technology Stack

Frontend

Next.js  
React  
TypeScript  
TailwindCSS

Backend

Node.js  
NestJS

Database

PostgreSQL (Cloud SQL)

Secondary Data Store

Firestore

File Storage

Google Cloud Storage

AI

OpenAI API

Infrastructure

Google Cloud Platform

Deployment

Frontend → Vercel  
Backend → Cloud Run

---

## 3. Core System Components

EstateAI includes the following system components:

- Web frontend
- Backend API
- Workflow engine
- Document storage system
- AI assistant

---

## 4. Workflow Engine

Each transaction consists of milestones.

Each milestone contains tasks.

Tasks represent actions required to progress the transaction.

Canonical buyer workflow stages:

1. Select property
2. Submit offer
3. Offer accepted
4. Inspection period
5. Mortgage process
6. Appraisal
7. Closing preparation
8. Closing

Canonical seller workflow stages:

1. Prepare home for sale
2. List property
3. Receive offers
4. Accept offer
5. Inspection period
6. Title and escrow
7. Closing preparation
8. Closing

Canonical storage keys used by `workflow_templates.stage_name` and `milestones.stage_name`:

- `select_property`
- `submit_offer`
- `offer_accepted`
- `inspection_period`
- `mortgage_process`
- `appraisal`
- `closing_preparation`
- `closing`
- `prepare_home_for_sale`
- `list_property`
- `receive_offers`
- `accept_offer`
- `title_and_escrow`

Workflow state model requirements:

- `transactions.current_milestone_id` is the authoritative pointer to workflow progress.
- Milestones track lifecycle timestamps (`started_at`, `completed_at`) in addition to status.
- Tasks include deterministic ordering and completion metadata:
  - `task_order`
  - `is_required`
  - `completed_at`
  - `blocked_reason`

---

## 5. Property Import

Users may paste a listing URL.

Example:

https://www.zillow.com/...

The system performs the following process:

1. Fetch webpage HTML
2. Send HTML to AI extraction service
3. Extract structured property data
4. Store property record

Example extracted fields:

- address
- listing price
- agent name
- brokerage
- phone/email
- beds/baths
- square footage

AI extraction allows the platform to support multiple listing websites without building custom scrapers.

---

## 6. AI Assistant

The AI assistant provides both conversational guidance and structured task assistance.

Capabilities include:

- explaining transaction stages
- suggesting next tasks
- summarizing uploaded documents
- extracting property data from listing URLs
- drafting communications
- recommending vendors or professionals

AI may suggest actions that reduce user effort.

Example actions:

- draft email to inspector
- summarize inspection report
- identify upcoming deadlines
- recommend local inspectors or lenders

AI actions must always require user confirmation before execution.

The platform logs AI actions for auditability.

Agent action lifecycle must include:

- approver identity (`approved_by`)
- approval timestamp (`approved_at`)
- execution timestamp (`executed_at`)
- execution result payload (`execution_result`)
- execution error details (`error_message`)

---

## 7. Authentication

Authentication handled via Firebase Authentication.

Supported login methods:

- email/password
- Google login

---

## 8. Security

Security features include:

- HTTPS encryption
- authenticated API routes
- signed document URLs
- role-based access control

---

## 9. Deployment

Infrastructure deployed on Google Cloud Platform.

Frontend hosted on Vercel.

Backend deployed to Cloud Run.
