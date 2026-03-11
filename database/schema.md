# EstateAI Database Schema

Database: PostgreSQL

This schema supports the EstateAI workflow-based real estate transaction platform.

The system centers around:

- users
- properties
- transactions
- workflow templates
- milestones
- tasks
- documents
- AI chat

---

# Users

Table: users

Columns

id (uuid, primary key)
name (text)
email (text, unique)
phone (text)
created_at (timestamp)

Description

Stores platform user accounts.

---

# Properties

Table: properties

Columns

id (uuid, primary key)
address_line1 (text)
city (text)
state (text)
zip_code (text)
listing_url (text)
listing_price (numeric)
listing_agent_name (text)
listing_agent_phone (text)
created_at (timestamp)

Description

Represents the property associated with a transaction.

Property data may be imported by providing a listing URL which is parsed using AI extraction.

---

# Transactions

Table: transactions

Columns

id (uuid, primary key)
user_id (uuid, foreign key → users.id)
property_id (uuid, foreign key → properties.id)
transaction_type (enum: buy, sell)
current_milestone_id (uuid, nullable foreign key → milestones.id)
created_at (timestamp)

Description

Represents a buy or sell workflow created by a user.

Each transaction references a property and progresses through workflow stages.

---

# Workflow Templates

Table: workflow_templates

Columns

id (uuid, primary key)
name (text)
transaction_type (enum: buy, sell)
created_at (timestamp)

Description

Defines reusable workflow structures.

Examples:

Buyer workflow
Seller workflow

These templates generate milestones when a transaction is created.

Canonical buyer stages:

1. Select property (`select_property`)
2. Submit offer (`submit_offer`)
3. Offer accepted (`offer_accepted`)
4. Inspection period (`inspection_period`)
5. Mortgage process (`mortgage_process`)
6. Appraisal (`appraisal`)
7. Closing preparation (`closing_preparation`)
8. Closing (`closing`)

Canonical seller stages:

1. Prepare home for sale (`prepare_home_for_sale`)
2. List property (`list_property`)
3. Receive offers (`receive_offers`)
4. Accept offer (`accept_offer`)
5. Inspection period (`inspection_period`)
6. Title and escrow (`title_and_escrow`)
7. Closing preparation (`closing_preparation`)
8. Closing (`closing`)

---

# Workflow Template Tasks

Table: workflow_template_tasks

Columns

id (uuid, primary key)
template_id (uuid, foreign key → workflow_templates.id)
stage_name (enum: select_property, submit_offer, offer_accepted, inspection_period, mortgage_process, appraisal, closing_preparation, closing, prepare_home_for_sale, list_property, receive_offers, accept_offer, title_and_escrow)
task_name (text)
task_order (integer)
created_at (timestamp)

Description

Defines tasks associated with each stage of a workflow template.

Example:

Stage: Inspection

Tasks:

Schedule inspection  
Upload inspection report  
Review inspection findings  

---

# Milestones

Table: milestones

Columns

id (uuid, primary key)
transaction_id (uuid, foreign key → transactions.id)
stage_name (enum: select_property, submit_offer, offer_accepted, inspection_period, mortgage_process, appraisal, closing_preparation, closing, prepare_home_for_sale, list_property, receive_offers, accept_offer, title_and_escrow)
stage_order (integer)
status (enum: pending, active, completed)
started_at (timestamp, nullable)
completed_at (timestamp, nullable)
created_at (timestamp)

Description

Represents transaction stages generated from workflow templates.

Stages must follow the canonical buyer/seller stage definitions in `workflow_templates`.

---

# Tasks

Table: tasks

Columns

id (uuid, primary key)
milestone_id (uuid, foreign key → milestones.id)
task_name (text)
task_description (text)
task_order (integer)
is_required (boolean)
status (enum: pending, completed, blocked)
blocked_reason (text, nullable)
due_date (timestamp, nullable)
completed_at (timestamp, nullable)
created_at (timestamp)

Description

Represents individual tasks within a milestone.

Tasks may optionally have a due_date if the task has a deadline such as inspection contingency, financing approval, or document submission.

AI agents may monitor due_date values to detect upcoming deadlines and notify users.

---

# Documents

Table: documents

Columns

id (uuid, primary key)
transaction_id (uuid, foreign key → transactions.id)
uploaded_by (uuid, foreign key → users.id)
document_type (text)
file_url (text)
uploaded_at (timestamp)
created_at (timestamp)

Description

Stores metadata for documents uploaded during a transaction.

Examples:

Purchase agreement  
Inspection report  
Disclosure documents  

Document files are stored in Google Cloud Storage.

---

# AI Chat Sessions

Table: ai_chat_sessions

Columns

id (uuid, primary key)
user_id (uuid, foreign key → users.id)
transaction_id (uuid, nullable)
created_at (timestamp)

Description

Represents a conversation session between the user and AI assistant.

Sessions may optionally be linked to a transaction.

---

# Agent Actions

Table: agent_actions

Columns

id (uuid, primary key)
transaction_id (uuid, foreign key → transactions.id)
task_id (uuid, nullable foreign key → tasks.id)
action_type (text)
action_payload (jsonb)
status (enum: suggested, approved, executed, cancelled)
approved_by (uuid, nullable foreign key → users.id)
approved_at (timestamp, nullable)
executed_at (timestamp, nullable)
execution_result (jsonb, nullable)
error_message (text, nullable)
created_at (timestamp)

Description

Stores structured actions generated by the AI assistant.

Examples of action types:

draft_email
summarize_document
recommend_vendor
schedule_task
generate_message

Actions must be approved by the user before execution.

---

# AI Chat Messages

Table: ai_chat_messages

Columns

id (uuid, primary key)
session_id (uuid, foreign key → ai_chat_sessions.id)
role (enum: user, assistant)
message_text (text)
created_at (timestamp)

Description

Stores individual messages exchanged between user and AI assistant.

---

# Index Recommendations

Create indexes for the following fields to improve query performance.

users.email

transactions.user_id  
transactions.property_id  
transactions.current_milestone_id  

milestones.transaction_id  
milestones(transaction_id, stage_order)  

tasks.milestone_id  
tasks(milestone_id, task_order)  
tasks(status)  
tasks(due_date)  

documents.transaction_id  

agent_actions(transaction_id, status, created_at)  
agent_actions(task_id)  

ai_chat_sessions(user_id, created_at)  
ai_chat_messages.session_id

---

# UUID Generation

Primary keys should use UUID values generated by PostgreSQL:

gen_random_uuid()

---

# Timestamp Defaults

All timestamp columns should default to:

CURRENT_TIMESTAMP
