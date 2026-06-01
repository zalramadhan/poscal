# Auth Fix & Tenant Isolation Design

**Date:** 2026-06-01
**Status:** Approved

---

## 1. Overview

Replace mock auth with proper authentication using better-auth library. Implement tenant isolation at database level, not just header-based.

### Goals
- Real authentication (login/register/password hashing)
- Tenant isolation - users can only access their own tenant's data
- Admin can invite employees to their tenant

---

## 2. Architecture

```
User Login (email + password)
        ↓
  better-auth validates & creates session
        ↓
  Session cookie stored in browser
        ↓
  Middleware: validate session → get tenantId from DB → attach to request
        ↓
  All API routes use tenantId from middleware context
```

---

## 3. Register Flow (Self-Register for Entrepreneurs)

### Request
```
POST /api/v1/auth/register
{
  "name": "Budi Santos",
  "email": "budi@toko.com",
  "password": "secure123",
  "storeName": "Toko Budi Elektronik"
}
```

### Process
1. Validate: email not exists, password strength (min 8 chars, letter + number)
2. Create Tenant: { name: storeName, email, phone: null, address: null }
3. Create Role 'admin' if not exists for tenant
4. Create User: { name, email, passwordHash (bcrypt), tenantId, roleId: admin, status: ACTIVE }
5. Create better-auth session

### Response
```json
{
  "user": { "id", "name", "email", "tenantId", "role" },
  "session": { "token", "expiresAt" }
}
```

---

## 4. User Invite Flow (Admin invites employee)

### Step 1: Admin creates invitation
```
POST /api/v1/auth/invite
{
  "email": "karyawan@toko.com",
  "roleId": "cashier-role-id",
  "branchId": "branch-id"
}
```

### Step 2: System creates invitation + returns invite link
```json
{
  "invitationId": "xxx",
  "inviteLink": "https://app.poscal.com/invite/accept?token=yyy",
  "expiresAt": "2026-06-08"
}
```
Admin copies link and sends manually.

### Step 3: Employee accepts invitation
```
GET /api/v1/auth/verify-invite?token=yyy
→ validates token, returns invitation details

POST /api/v1/auth/accept-invite
{
  "token": "yyy",
  "password": "secure123",
  "name": "Karyawan Baru"
}
```

### Step 4: Employee sets password
- Create User with roleId & tenantId from invitation
- Create better-auth session
- Mark Invitation as ACCEPTED

---

## 5. Invitation Model

```prisma
model Invitation {
  id         String           @id @default(uuid())
  tenantId   String
  email      String
  roleId     String
  branchId   String?
  token      String           @unique
  status     InvitationStatus @default(PENDING)
  expiresAt  DateTime
  invitedBy  String
  acceptedAt DateTime?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
}
```

---

## 6. Middleware & Tenant Isolation

### Middleware Flow (src/middleware.ts)
```
Every API Request
        ↓
Check: session cookie exists?
        ↓ YES                      ↓ NO
Extract session token          Return 401 (except public routes)
        ↓
Validate session via better-auth
        ↓
Get userId from session
        ↓
Query: prisma.user.findUnique → get tenantId
        ↓
Attach to request context: { tenantId, userId }
        ↓
API route receives via getContext() or similar
```

### Tenant Isolation Enforcement

**Before (insecure):**
```typescript
// ❌ Client could spoof x-tenant-id header
const tenantId = request.headers.get('x-tenant-id')
```

**After (secure):**
```typescript
// ✅ TenantId from authenticated session, set by middleware
const tenantId = context.tenantId
```

### Public Routes (no auth required)
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/verify-invite (validate token)
- POST /api/v1/auth/accept-invite

---

## 7. Error Handling

| Scenario | HTTP | Message |
|----------|------|---------|
| Invalid credentials | 401 | "Email atau password salah" |
| Expired session | 401 | "Sesi expired, silakan login ulang" |
| Invite token expired | 400 | "Link expired, minta invite ulang ke admin" |
| Invite token already used | 400 | "Link sudah digunakan" |
| Email already registered | 400 | "Email sudah terdaftar" |
| User not in tenant | 403 | "Akses ditolak" |
| Employee trying to invite | 403 | "Hanya admin yang bisa mengundang" |
| Password too weak | 400 | "Password minimal 8 karakter, harus ada huruf dan angka" |

---

## 8. Prisma Schema Changes

### Add to schema.prisma
```prisma
model Invitation {
  id         String           @id @default(uuid())
  tenantId   String
  email      String
  roleId     String
  branchId   String?
  token      String           @unique
  status     InvitationStatus @default(PENDING)
  expiresAt  DateTime
  invitedBy  String
  acceptedAt DateTime?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
}
```

### Tenant fields to confirm
```prisma
model Tenant {
  id        String  @id @default(uuid())
  name      String
  email     String?
  phone     String?
  address   String?  // ADD IF NOT EXISTS
  // ...
}
```

---

## 9. File Changes Summary

| File | Action |
|------|--------|
| src/middleware.ts | CREATE - auth middleware |
| src/app/api/v1/auth/login/route.ts | REWRITE - use better-auth |
| src/app/api/v1/auth/register/route.ts | REWRITE - create tenant + user |
| src/app/api/v1/auth/logout/route.ts | REWRITE - use better-auth |
| src/app/api/v1/auth/invite/route.ts | CREATE - admin invite flow |
| src/app/api/v1/auth/verify-invite/route.ts | CREATE - validate token |
| src/app/api/v1/auth/accept-invite/route.ts | CREATE - complete invite |
| src/lib/api-handler.ts | MODIFY - use context instead of headers |
| prisma/schema.prisma | MODIFY - add Invitation model |
| src/lib/auth.ts | MODIFY - ensure proper config |
| src/app/invite/accept/page.tsx | CREATE - invite acceptance UI |

---

## 10. Out of Scope (Phase 1)

- Email sending (invite link shown as copyable text)
- Password reset flow
- Email verification
- 2FA
- OAuth providers