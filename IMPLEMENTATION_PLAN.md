# EstateAI Implementation Plan

## 1. Objective
Define a production-ready system architecture for EstateAI aligned with:

- BRD.md (business requirements)
- TRD.md (technical requirements)
- AGENTS.md (engineering rules)
- database/schema.md (data model)

This document defines architecture, service boundaries, data flow, and phased implementation.

---

## 2. Guiding Principles

- Modular monolith backend
- Clear frontend/backend separation
- Database-first development
- Security-first architecture
- AI guidance with compliance guardrails

EstateAI is a **transaction workflow system**, not a listing marketplace.

---

## 3. High-Level Architecture

Next.js Frontend  
↓  
NestJS API  
↓  
PostgreSQL (Cloud SQL)  
↓  
Firestore (chat history)  
↓  
Google Cloud Storage (documents)  
↓  
OpenAI API

Infrastructure:

Frontend → Vercel  
Backend → Cloud Run  
Database → Cloud SQL  
Chat → Firestore  
Files → Google Cloud Storage

---

## 4. Backend Services

### User Service
Handles user identity and profiles.

Owns:
users

---

### Property Service
Handles property records and listing imports.

Responsibilities:
- storing property information
- listing URL import
- AI extraction from listing pages

Owns:
properties

---

### Transaction Service
Handles buy/sell transaction lifecycle.

Responsibilities:
- transaction creation
- transaction import
- current milestone tracking via `current_milestone_id`

Owns:
transactions

---

### Workflow Service
Core workflow engine.

Responsibilities:
- loading workflow templates
- generating milestones
- generating tasks
- calculating progress

Owns:
workflow_templates  
workflow_template_tasks  
milestones  
tasks

---

### Document Service
Handles document uploads and access.

Responsibilities:
- upload initialization
- metadata storage
- signed URL access

Owns:
documents

Binary files stored in Google Cloud Storage.

---

### AI Service
Provides AI guidance.

Responsibilities:
- transaction guidance
- document summarization
- property extraction from listing URLs
- answering workflow questions

Owns:
ai_chat_sessions  
ai_chat_messages

Chat transcripts stored in Firestore.

### AI Agent Capabilities

The AI assistant may perform structured actions to reduce user effort.

Examples:

- draft communications
- summarize uploaded documents
- recommend vendors
- detect workflow deadlines
- suggest next actions

All AI actions require user confirmation before execution.

AI actions are recorded in the agent_actions table.

---

### Notification Service
Handles reminders and alerts.

Responsibilities:
- task reminders
- milestone alerts
- workflow notifications

---

## 5. Data Architecture

PostgreSQL is the source of truth for:

- users
- properties
- transactions
- workflow templates
- milestones
- tasks
- documents

Firestore stores chat history.

Google Cloud Storage stores document files.

---

## 6. API Architecture

All APIs are versioned under:

/api/v1

User APIs

GET /users/me  
PATCH /users/me

Property APIs

POST /properties/import  
POST /properties  
GET /properties/:id

Transaction APIs

POST /transactions  
POST /transactions/import-milestone  
GET /transactions/:id  
PATCH /transactions/:id/current-milestone

Workflow APIs

GET /transactions/:id/milestones  
GET /milestones/:id/tasks  
PATCH /tasks/:id/status  
GET /transactions/:id/progress

Document APIs

POST /documents/upload-url  
POST /documents  
GET /transactions/:id/documents  
GET /documents/:id/access-url

AI APIs

POST /ai/sessions  
POST /ai/sessions/:id/messages  
GET /ai/sessions/:id/messages  
POST /ai/documents/:id/explain

---

## 7. Frontend Architecture

Next.js App Router structure:

app/dashboard  
app/transactions  
app/documents  
app/settings

Reusable UI components:

- sidebar navigation
- transaction progress bar
- task checklist
- document viewer
- AI chat panel

---

## 8. Workflow Engine

Each transaction is generated from a workflow template.

Buyer baseline stages:

1. Select property
2. Submit offer
3. Offer accepted
4. Inspection period
5. Mortgage process
6. Appraisal
7. Closing preparation
8. Closing

Seller baseline stages:

1. Prepare home for sale
2. List property
3. Receive offers
4. Accept offer
5. Inspection period
6. Title and escrow
7. Closing preparation
8. Closing

Canonical storage keys for stage values (`workflow_templates.stage_name`, `milestones.stage_name`):

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

Each milestone contains tasks.

Task states:

pending  
completed  
blocked

---

## 9. AI Guardrails

The AI assistant may:

- explain transaction steps
- summarize documents
- suggest tasks

The AI assistant must not:

- provide legal advice
- negotiate offers
- represent users as agents

---

## 10. Deployment

CI/CD via GitHub Actions.

Environment tiers:

local  
staging  
production

Frontend deployed to Vercel.  
Backend deployed to Cloud Run.  
Database hosted on Cloud SQL.
