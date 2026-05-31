# PROJECT_BOOTSTRAP.md

Version: V1.0

Status: REQUIRED

Purpose:

This document defines the technical foundation, development standards, architecture decisions, coding conventions, deployment strategy, and AI Agent implementation rules for the POS + Warehouse + Restaurant + Finance Lite platform.

---

# PROJECT OVERVIEW

Project Name:

POS AI Platform

Type:

Multi Tenant SaaS

Modules:

* POS
* Inventory
* Warehouse
* Purchasing
* CRM
* Finance Lite
* Reports
* Restaurant
* AI Assistant (V3)

Architecture:

Modular Monolith

Multi Tenant

API First

---

# TECH STACK

## Frontend

Next.js 15

React 19

TypeScript

Tailwind CSS

shadcn/ui

Lucide Icons

---

## State Management

TanStack Query

Zustand

Rule:

Server State → TanStack Query

Client UI State → Zustand

---

## Forms

React Hook Form

Zod

---

## Tables

TanStack Table

---

## Charts

Recharts

---

## Backend

Next.js Route Handlers

TypeScript

Zod Validation

Service Layer Pattern

Repository Pattern

---

## Database

PostgreSQL

Version:

16+

---

## ORM

Prisma

---

## Authentication

Better Auth

---

## File Storage

S3 Compatible

Options:

* Cloudflare R2
* MinIO
* AWS S3

---

## Deployment

Preferred:

Coolify

Alternative:

Railway

Alternative:

VPS Docker

---

# PROJECT STRUCTURE

src/

app/

modules/

components/

services/

repositories/

validators/

stores/

hooks/

types/

constants/

lib/

generated/

---

# MODULE STRUCTURE

Example:

modules/products/

├── api/
├── components/
├── repositories/
├── services/
├── validators/
├── types/
├── hooks/
└── pages/

---

# LAYER RESPONSIBILITIES

Repository

Database Access Only

No business logic.

---

Service

Business Logic

Validation

Transactions

---

API

Request

Response

Authorization

---

UI

Presentation Only

---

# MULTI TENANT RULES

Every business entity:

tenantId

Mandatory

---

Every query:

Must filter tenantId

Mandatory

---

Forbidden:

findMany()

Without tenant filter

---

Allowed:

findMany({
where:{
tenantId
}
})

---

# RBAC RULES

Every protected API must validate:

Authentication

↓

Tenant

↓

Permission

↓

Business Rules

↓

Execute

---

# DATABASE RULES

Primary Key

String

@default(cuid())

---

Money

Decimal(18,2)

Never Float

---

Soft Delete

Use:

deletedAt

---

Required Tables

Users

Products

Customers

Suppliers

Menus

Restaurant Tables

---

# INVENTORY RULES

InventoryMovement

Source Of Truth

---

InventoryBalance

Snapshot

---

Never:

Update historical inventory movements

Delete inventory movements

---

# API RULES

Response Format

Success

{
"success": true,
"data": {}
}

---

Error

{
"success": false,
"message": "Validation failed",
"errors": {}
}

---

# VALIDATION RULES

All API Inputs:

Zod

Mandatory

---

No direct database input allowed

Without validation

---

# TYPESCRIPT RULES

Strict Mode

Enabled

---

Forbidden

any

unknown casting

ts-ignore

eslint-disable

---

Required

Explicit Types

Reusable Interfaces

Strong Typing

---

# UI DESIGN SYSTEM

Theme:

Modern SaaS

Enterprise Grade

---

Radius

12px

---

Spacing Scale

4

8

12

16

24

32

48

64

---

Typography

Font:

Inter

---

Weights

400

500

600

700

---

# COLOR SYSTEM

Primary

#2563EB

---

Success

#16A34A

---

Warning

#F59E0B

---

Danger

#DC2626

---

Neutral

Slate Scale

---

# COMPONENT STANDARDS

All forms:

Loading State

Error State

Empty State

Success State

Required

---

All tables:

Pagination

Sorting

Search

Responsive

Required

---

# FILE NAMING

Components

PascalCase

Example:

ProductForm.tsx

---

Hooks

camelCase

Example:

useProducts.ts

---

Types

PascalCase

Example:

Product.ts

---

# ROUTING

App Router

Only

---

Protected Pages

Inside:

(dashboard)

---

Public Pages

Inside:

(public)

---

Auth Pages

Inside:

(auth)

---

# ENVIRONMENT VARIABLES

DATABASE_URL

BETTER_AUTH_SECRET

BETTER_AUTH_URL

NEXT_PUBLIC_APP_URL

S3_ACCESS_KEY

S3_SECRET_KEY

S3_BUCKET

S3_REGION

S3_ENDPOINT

---

# LOGGING

Use Structured Logging

Required

---

Log:

Errors

Auth Events

Inventory Events

Purchasing Events

Transfers

---

# AUDIT LOGS

Required For

Products

Inventory

Sales

Purchases

Transfers

Users

Settings

---

Audit Logs Immutable

---

# TESTING STRATEGY

Unit Test

Services

---

Integration Test

API

---

E2E Test

Critical Flows

---

Critical Flows

Login

Create Product

Stock In

Stock Out

Create Sale

Refund Sale

Receive Purchase

Transfer Stock

---

# GIT STRATEGY

main

Production

---

develop

Integration

---

feature/*

Feature Branches

---

hotfix/*

Emergency Fixes

---

# COMMIT CONVENTION

feat:

fix:

refactor:

docs:

test:

chore:

---

Examples

feat(products): create product module

fix(inventory): stock calculation bug

---

# AI AGENT EXECUTION ORDER

1. Database
2. Prisma Schema
3. Migrations
4. Repository
5. Service
6. API
7. UI
8. Tests

Never reverse order.

---

# DEFINITION OF DONE

Feature is complete only if:

✓ Database Complete

✓ Validation Complete

✓ Repository Complete

✓ Service Complete

✓ API Complete

✓ UI Complete

✓ Responsive

✓ RBAC Applied

✓ Tenant Isolation Applied

✓ Audit Log Applied

✓ Tests Pass

Otherwise:

Feature is NOT complete.

---

# RELEASE CRITERIA

Critical Bugs = 0

Inventory Accuracy = 100%

Tenant Isolation Verified

RBAC Verified

Audit Logs Verified

All Acceptance Criteria Passed

Required Before Production.
