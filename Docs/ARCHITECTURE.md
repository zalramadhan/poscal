# ARCHITECTURE.md

Version: V1-V2

Status: Approved

Purpose:

This document defines the mandatory architecture rules for the POS AI platform.

All AI agents must follow these rules.

Deviation is not allowed without explicit approval.

---

# SYSTEM ARCHITECTURE

Architecture Style:

Modular Monolith

Reason:

* Faster development
* Easier maintenance
* Lower infrastructure cost
* Easier AI-generated development
* Can be split into microservices later

---

# TECHNOLOGY STACK

Frontend:

* Next.js 15
* React 19
* TypeScript

UI:

* TailwindCSS
* shadcn/ui

Database:

* PostgreSQL

ORM:

* Prisma

Authentication:

* Better Auth

Validation:

* Zod

State Management:

* Zustand

Tables:

* TanStack Table

Forms:

* React Hook Form

Storage:

* S3 Compatible

Queue:

* BullMQ

Cache:

* Redis

---

# PROJECT STRUCTURE

src/

├── app/
│
├── modules/
│
├── components/
│
├── lib/
│
├── services/
│
├── repositories/
│
├── stores/
│
├── hooks/
│
├── types/
│
├── validators/
│
└── constants/

---

# MODULE STRUCTURE

Each business module must follow:

modules/

product/

├── components/
├── pages/
├── actions/
├── services/
├── repositories/
├── validators/
├── types/
└── constants/

---

# MODULE ISOLATION

Modules must not directly access another module's database logic.

Bad:

sales -> prisma.product.findMany()

Good:

sales -> productService

Only services may communicate across modules.

---

# LAYER RULES

UI

↓

Action

↓

Service

↓

Repository

↓

Database

Never skip layers.

---

# RESPONSIBILITIES

UI

Responsible for:

* Rendering
* User Interaction

Must NOT:

* Query Database
* Business Logic

---

# ACTION

Responsible for:

* Request Handling
* Validation Trigger

Must NOT:

* Direct Database Queries

---

# SERVICE

Responsible for:

* Business Logic
* Rules
* Calculations

Must NOT:

* Render UI

---

# REPOSITORY

Responsible for:

* Database Queries

Must NOT:

* Business Logic

---

# DATABASE ACCESS

Only repositories may use Prisma.

Forbidden:

UI -> Prisma

Service -> Prisma

Action -> Prisma

Allowed:

Repository -> Prisma

---

# VALIDATION RULES

Every write operation must use Zod.

Required:

Create

Update

Delete

Filters

Search

No exceptions.

---

# TYPESCRIPT RULES

Never use:

any

unknown

unless unavoidable.

Prefer:

strict typing

everywhere.

---

# FILE NAMING

Components:

ProductTable.tsx

ProductForm.tsx

ProductCard.tsx

Services:

product.service.ts

Repositories:

product.repository.ts

Validators:

product.schema.ts

Types:

product.types.ts

---

# IMPORT RULES

Prefer:

@/modules/products

Avoid:

../../../products

Use path aliases.

---

# BUSINESS RULES

Business rules belong in services.

Never in:

* Components
* Repositories
* Pages

Example:

Calculate Discount

Location:

sales.service.ts

---

# INVENTORY ARCHITECTURE

Source of Truth:

inventory_movements

Current Snapshot:

inventory_balances

Never trust inventory_balances alone.

Always verify movement history.

---

# STOCK FLOW

Purchase Receive

↓

Inventory Movement

↓

Inventory Balance Update

Sale

↓

Inventory Movement

↓

Inventory Balance Update

Transfer

↓

Inventory Movement

↓

Inventory Balance Update

No stock operation may bypass movement records.

---

# MULTI TENANT RULES

Every query must contain:

tenant_id

Example:

WHERE tenant_id = currentTenant

Mandatory.

---

# TENANT SECURITY

User A

Tenant A

Must never access:

Tenant B Data

All repositories must automatically scope by tenant.

---

# RBAC ARCHITECTURE

Owner

Full Access

Manager

Operations Access

Cashier

POS Only

Warehouse Staff

Warehouse Only

Permission checks must exist:

Server Side

Not only Frontend.

---

# AUDIT LOG RULES

Every critical action must create audit logs.

Examples:

Create Product

Update Product

Delete Product

Create Sale

Receive Purchase Order

Transfer Stock

Required Fields:

* user_id
* tenant_id
* action
* entity
* entity_id
* old_value
* new_value

---

# ERROR HANDLING

Use standard error format.

Never expose:

* SQL Errors
* Stack Traces
* Internal Paths

To users.

---

# LOGGING

Required:

Info

Warning

Error

Audit

Use structured logs.

---

# PERFORMANCE RULES

Always use:

Pagination

Filtering

Search

Avoid:

SELECT *

on large datasets.

---

# UI RULES

All pages must include:

* Loading State
* Empty State
* Error State

No blank pages allowed.

---

# TESTING RULES

Every service requires:

Unit Tests

Critical flows require:

Integration Tests

Required Coverage:

80%+

---

# CODE QUALITY RULES

Follow:

* SOLID
* DRY
* KISS

Avoid:

* Massive Components
* Massive Services
* Duplicate Logic

---

# MAX FILE SIZE

Component:

300 Lines

Service:

300 Lines

Repository:

250 Lines

If larger:

Split into smaller files.

---

# DEFINITION OF DONE

A task is complete only when:

✓ Database Implemented

✓ Validation Implemented

✓ API Implemented

✓ UI Implemented

✓ Permissions Implemented

✓ Audit Logs Implemented

✓ Tests Passing

✓ PRD Compliant

If any item is missing:

Task is NOT complete.

---

# AI AGENT FINAL RULE

Never invent features.

Never expand scope.

Always follow:

PRD.md

DATABASE.md

API_SPEC.md

ARCHITECTURE.md

If conflict exists:

ARCHITECTURE.md

takes precedence over implementation assumptions.
