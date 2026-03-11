# AGENTS.md

This document defines rules and guidance for AI coding agents working on the Homey AI repository.

Agents must read this file before generating or modifying code.

---

# Project Overview

Homey AI is an AI-guided home transaction platform.

The platform helps users buy or sell homes with step-by-step workflow guidance.

Core system components:

The platform consists of:

- User account system
- Transaction management system
- Workflow engine (milestones and tasks)
- Document management system
- AI assistant and agent actions
- Notification and reminder system

The product concept is “TurboTax for home transactions.”

Users are guided through a transaction but remain responsible for decisions.

The platform does NOT act as a licensed broker, attorney, or settlement agent.

---

# Tech Stack

Agents must use the following stack unless instructed otherwise.

Frontend

Next.js  
React  
TypeScript  
TailwindCSS  

Backend

Node.js  
NestJS framework preferred  
REST API architecture  

Database

PostgreSQL (Cloud SQL on GCP)

Secondary storage

Firestore

File storage

Google Cloud Storage

AI

OpenAI API

Infrastructure

Google Cloud Platform

Deployment targets

Frontend: Vercel  
Backend: Cloud Run

---

# Architecture Principles

Agents must follow these architecture principles.

1. Modular services
2. Clear separation of frontend and backend
3. REST APIs between frontend and backend
4. Database models defined before service logic
5. Clean service boundaries

Core services should include:

- user service
- transaction service
- workflow service
- document service
- AI service
- notification service

---

# Coding Standards

All code must follow these standards.

Use TypeScript for all backend and frontend code.

Keep files under approximately 300 lines where possible.

Prefer clear, readable code over clever solutions.

Use descriptive variable names.

Avoid deeply nested logic.

All database access should use a repository or service layer.

---

# Backend Guidelines

Backend should follow service-based architecture.

Example folder structure:

backend/
services/
controllers/
database/
models/

Business logic should be implemented in services.

Controllers should only handle API requests and responses.

Database schema should match definitions in database/schema.md.

---

# Frontend Guidelines

Frontend must be built using Next.js.

Pages should be organized by major product areas:

- transactions
- dashboard
- documents

Use reusable UI components.

Key UI components include:

- navigation sidebar
- transaction progress bar
- document viewer
- AI chat panel

---

# Transaction Workflow System

The transaction workflow engine is a core system.

Transactions must support milestone stages such as:

Search  
Offer accepted  
Inspection  
Financing  
Closing

Each stage contains tasks.

Tasks can be pending, completed, or blocked.

Progress should be visible in a progress bar component.

---

# AI Assistant Guidelines

The AI assistant should provide:

- workflow guidance
- document explanations
- property information
- next-step suggestions

The AI must NOT:

- provide legal advice
- negotiate offers
- represent users as agents

The AI assistant should escalate to professionals when appropriate.

---

# Database Development Rules

All tables must match the schema defined in database/schema.md.

Do not modify schema without updating the schema file.

Use UUID primary keys.

All tables should include created_at timestamps.

Indexes should be added to frequently queried fields.

---

# Security Rules

Sensitive data must never be exposed to the frontend directly.

Documents must be accessed using signed URLs.

Authentication must be enforced on all API routes.

---

# Development Workflow

Agents should follow this process when implementing features.

1. Review BRD.md for product requirements.
2. Review TRD.md for technical requirements.
3. Review database/schema.md for database structure.
4. Generate backend models and services.
5. Generate API routes.
6. Implement frontend pages.
7. Connect frontend to backend APIs.

---

# Code Generation Expectations

Agents should prioritize:

- maintainability
- modular architecture
- scalable services

Avoid generating unnecessary dependencies.

Prefer widely adopted libraries.

---

# Documentation Requirements

Agents must add documentation for:

- API routes
- service responsibilities
- database models

Documentation should be written in Markdown.

---

# Future Expansion

The architecture should support future features such as:

- negotiation scenario modeling
- vendor marketplace
- mortgage integrations
- closing automation
