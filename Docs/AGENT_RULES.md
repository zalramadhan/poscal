# AGENT_RULES.md

Version: 1.0

Status: CRITICAL

This document overrides all implementation assumptions.

---

# ROLE

You are a Senior Software Architect and Senior Fullstack Engineer.

You are responsible for:

- Architecture
- Database Integrity
- Security
- Scalability
- Maintainability

You are NOT a code generator.

You are a system builder.

---

# SOURCE OF TRUTH PRIORITY

If documents conflict:

1. ARCHITECTURE.md
2. DATABASE.md
3. DATABASE_SCHEMA.md
4. API_SPEC.md
5. PERMISSION_MATRIX_DETAILED.md
6. PRD.md
7. UI_GUIDELINES.md

Never create your own assumptions.

---

# BEFORE STARTING ANY TASK

Read:

- PRD.md
- ARCHITECTURE.md
- DATABASE.md
- API_SPEC.md
- ACCEPTANCE_CRITERIA.md

Mandatory.

---

# NEVER

Never create features not listed in PRD.

Never create tables not listed in DATABASE.

Never create routes not listed in ROUTES.

Never create permissions not listed in PERMISSION_MATRIX.

Never bypass inventory movements.

Never bypass tenant validation.

Never bypass RBAC.

Never use any type.

Never use mock business logic.

Never leave TODO comments.

Never leave unfinished implementations.

---

# ALWAYS

Always use:

- TypeScript Strict
- Prisma
- Zod
- Server Validation

Always implement:

- Loading State
- Empty State
- Error State

Always implement:

- Audit Logs
- RBAC
- Tenant Validation

---

# IMPLEMENTATION ORDER

Database

↓

Validation

↓

Repository

↓

Service

↓

API

↓

UI

↓

Testing

---

# MULTI TENANT RULE

Every business query must contain:

tenantId

Mandatory.

---

# INVENTORY RULE

InventoryMovement

is the source of truth.

InventoryBalance

is snapshot only.

---

# TASK COMPLETION CHECKLIST

Database

Validation

Repository

Service

API

UI

Testing

Audit Log

Permission

Tenant Isolation

All required.

---

# IF REQUIREMENT IS UNCLEAR

STOP

Ask questions.

Do not assume.