# Homey AI Project Context

## Overview
Homey AI is an AI copilot for residential real estate transactions. The goal is to guide buyers and sellers through the home buying or selling process without needing a traditional realtor for workflow guidance.

The system explains documents, tracks transaction milestones, monitors deadlines, and answers questions about the transaction using AI.

## Product Vision
Homey AI aims to function like "TurboTax for real estate transactions". Instead of hiring a realtor primarily for process guidance, users can rely on an AI copilot to understand and complete the transaction.

Key capabilities:
- explain documents
- generate or manage transaction paperwork
- track milestones and contingencies
- monitor deadlines
- answer real estate process questions
- surface deal risks

## Architecture

### Frontend
- Next.js (App Router)
- TailwindCSS
- Custom UI components inspired by shadcn
- Responsive SaaS-style dashboard UI
- Sidebar navigation

Main UI areas:
- Dashboard
- Transactions
- Documents
- AI Chat
- Notifications

Dashboard features:
- Homey AI Copilot card (next action)
- Deal Health Score indicator
- Upcoming Deadlines
- Transaction Timeline
- AI chat panel

### Backend
- Node.js
- Express API
- Prisma ORM
- PostgreSQL
- Redis
- Docker-based local development

## AI Integration
- OpenAI API
- AI sessions created with `createAiSession()`
- AI messages endpoint:

`POST /api/v1/ai/sessions/:sessionId/messages`

AI uses transaction context to answer questions and guide users.

## Database
- PostgreSQL
- Prisma schema

Core entities:
- User
- Property
- Transaction
- Milestones
- Tasks
- Deadlines
- Documents

## Local Development Environment
Docker Compose stack includes:
- postgres
- redis
- backend
- frontend

Key commands:

Start environment  
`bash scripts/setup-local.sh`

Frontend  
`http://localhost:3000`

Backend  
`http://localhost:4000/api/v1`

## Demo Mode
A demo seed script exists to create example data for local development.

File:  
`backend/scripts/seed-demo.ts`

The script creates:
- Demo Buyer user
- Demo Property (123 Palm Ave, Miami FL)
- Demo BUY transaction

The script automatically writes environment variables into:

`frontend/.env.local`

Variables written:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_DEFAULT_USER_ID`
- `NEXT_PUBLIC_DEFAULT_TRANSACTION_ID`

This allows the dashboard to automatically load demo data.

## UI Design System
Custom UI components created:
- Card
- Badge
- Button
- Tabs
- Progress

Libraries used:
- lucide-react
- clsx
- tailwind-merge
- class-variance-authority

## Current Product Direction
Homey AI should eventually:

1. Help users understand and manage real estate transactions without relying on realtors.
2. Generate or manage standardized state real estate forms.
3. Explain documents and contingencies using AI.
4. Track deadlines and milestones automatically.
5. Provide AI-powered risk analysis for contracts and transaction steps.

## Next Major Design Question
How Homey AI should obtain, generate, and manage real estate transaction documents that are traditionally handled by realtors using standardized state forms.

The system likely needs a document engine that:
- selects required documents based on state and transaction type
- fills standardized templates
- manages digital signatures
- explains documents with AI
