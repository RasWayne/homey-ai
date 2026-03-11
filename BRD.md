# EstateAI
## Business Requirements Document (BRD)

Version: v2  
Concept: **TurboTax for buying and selling homes**

---

# 1. Executive Summary

EstateAI is a guided transaction platform that helps consumers manage the process of buying or selling a home through structured workflows and AI guidance.

The platform organizes the real estate process into milestones and tasks similar to how tax software guides users through filing taxes.

Instead of relying on traditional real estate agents for coordination, users are guided step-by-step through the transaction process while maintaining full control over decisions.

The platform provides workflow management, document explanation, and task guidance while escalating regulated services to licensed professionals when necessary.

---

# 2. Problem Statement

Buying or selling a home is complex and fragmented.

Participants must coordinate many tasks including:

- understanding the transaction timeline
- communicating with lenders
- scheduling inspections
- reviewing legal documents
- interacting with agents or title companies
- managing deadlines

Most consumers do not know the proper order of steps or what tasks must be completed.

Traditional agents act primarily as coordinators of this process, but the coordination itself can be productized through software.

---

# 3. Product Vision

Build the most trusted **self-service operating system for residential real estate transactions**.

The platform helps users:

- understand the transaction process
- track milestones and tasks
- upload and review documents
- receive AI guidance during each stage
- coordinate activities needed to close a transaction

Users remain responsible for decisions while the software provides structure and guidance.

---

# 4. Product Scope

EstateAI is a **workflow guidance platform**, not a brokerage.

The system does not:

- act as a licensed real estate broker
- negotiate offers
- provide legal advice
- perform title or escrow services

Instead it provides structure, explanations, and task coordination.

---

# 5. Core User Flows

## User Login

Users create an account and log into the platform.

---

## Start Transaction

Users may choose one of the following:

- Start a new home purchase
- Start a new home sale
- Import an existing transaction

---

## Import Existing Transaction

If a user has already started a transaction outside the platform, they can import their current stage.

The system asks:

- What property are you buying or selling?
- What stage are you currently in?

Example stages:

- searching
- offer submitted
- offer accepted
- inspection
- financing
- closing preparation

The platform then generates the remaining workflow tasks.

---

## Property Import

Users may paste a listing URL from websites such as Zillow or Realtor.

The system extracts information including:

- property address
- listing price
- listing agent
- agent contact information
- basic property details

This information becomes the property associated with the transaction.

---

# 6. Transaction Workflow

Each transaction contains milestones.

Example buyer milestones:

1. Select property
2. Submit offer
3. Offer accepted
4. Inspection period
5. Mortgage process
6. Appraisal
7. Closing preparation
8. Closing

Example seller milestones:

1. Prepare home for sale
2. List property
3. Receive offers
4. Accept offer
5. Inspection period
6. Title and escrow
7. Closing preparation
8. Closing

Each milestone contains tasks.

---

# 7. Task System

Tasks represent actionable steps required to complete a milestone.

Examples:

Inspection stage tasks:

- schedule home inspection
- upload inspection report
- review inspection findings
- negotiate repair requests

Financing stage tasks:

- contact mortgage lender
- upload loan approval letter
- schedule appraisal

Users can mark tasks complete.

---

# 8. AI Guidance

The AI assistant provides contextual guidance during the transaction.

Capabilities include:

- explaining the next steps in the transaction
- summarizing documents
- recommending tasks
- answering general process questions

The AI assistant must avoid providing legal advice or acting as a licensed agent.

---

# 9. Document Management

Users can upload documents related to the transaction.

Examples include:

- purchase agreements
- inspection reports
- disclosures
- mortgage documents

The AI assistant may summarize or explain documents.

---

# 10. Key Features

MVP features include:

- user authentication
- transaction workflow engine
- milestone progress tracking
- task management
- property import via listing URL
- document uploads
- AI assistant chat

---

# 11. Success Metrics

Key metrics include:

- user activation rate
- transactions created
- task completion rate
- document uploads
- AI assistant usage
- transaction completion rate

---

# 12. Future Features

Potential future capabilities include:

- vendor marketplace for inspectors and lenders
- document auto-parsing
- negotiation scenario modeling
- title and escrow integrations
- closing automation
