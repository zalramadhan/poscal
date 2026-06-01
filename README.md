# POSCal - Point of Sale System

A full-featured Point of Sale (POS) system built with Next.js 15, Prisma, and PostgreSQL.

## Features

### POS & Sales
- **POS Checkout** - Fast checkout with cart management, customer selection, and payment handling
- **Sales History** - View all past transactions with invoice details
- **Multi-payment Support** - Handle multiple payment methods per transaction
- **Automatic Stock Dedction** - Inventory automatically decreases when sales are completed

### Inventory Management
- **Products** - Manage product catalog with SKU, pricing, and categories
- **Stock In/Out** - Record inventory additions and reductions
- **Stock Transfers** - Transfer inventory between warehouses
- **Stock Opname** - Physical inventory counting and adjustments
- **Low Stock Alerts** - Dashboard shows items below threshold

### Purchases & Suppliers
- **Purchase Orders** - Create and manage PO to suppliers
- **Supplier Management** - Track supplier information
- **Receive Inventory** - Accept incoming stock against PO

### Finance & Reports
- **Income & Expense Tracking** - Record and track financial transactions
- **Dashboard Analytics** - Real-time revenue, sales count, top products
- **Finance Report** - Income/expense summary with net cash flow
- **Sales Report** - Sales analytics with trends
- **Inventory Report** - Stock levels and low stock items
- **Purchase Report** - Purchase order analytics

### Customer Management
- **Customer Database** - Store and manage customer information
- **Customer History** - Track customer purchase history

### Settings & Configuration
- **Branches** - Multi-branch support
- **Roles & Permissions** - Role-based access control
- **Units & Brands** - Product attribute management
- **Warehouses** - Warehouse/location management

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| UI Components | Radix UI, Lucide Icons, Recharts |
| Forms | React Hook Form, Zod validation |
| Backend | Next.js API Routes |
| ORM | Prisma 7 |
| Database | PostgreSQL (Supabase) |
| Auth | Better Auth |
| State | Zustand |

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL database (local or Supabase)
- npm or pnpm

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/zalramadhan/poscal.git
cd poscal
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your database connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/poscal?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/poscal?schema=public"
```

4. **Setup database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
poscal/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (v1)
│   │   │   └── v1/
│   │   │       ├── auth/       # Authentication
│   │   │       ├── brands/     # Brand management
│   │   │       ├── branches/   # Branch management
│   │   │       ├── categories/ # Category management
│   │   │       ├── customers/  # Customer management
│   │   │       ├── dashboard/  # Dashboard stats
│   │   │       ├── finance/    # Income/expense
│   │   │       ├── inventory/  # Stock operations
│   │   │       ├── products/   # Product management
│   │   │       ├── purchase-orders/ # PO management
│   │   │       ├── reports/    # Report endpoints
│   │   │       ├── roles/      # Role management
│   │   │       ├── sales/      # Sales transactions
│   │   │       ├── settings/   # Tenant settings
│   │   │       ├── stock-transfers/ # Stock transfers
│   │   │       ├── suppliers/   # Supplier management
│   │   │       ├── units/      # Unit management
│   │   │       ├── users/      # User management
│   │   │       └── warehouses/ # Warehouse management
│   │   └── app/                # Application pages
│   │       ├── brands/
│   │       ├── categories/
│   │       ├── customers/
│   │       ├── dashboard/
│   │       ├── employees/
│   │       ├── finance/
│   │       ├── inventory/
│   │       ├── pos/
│   │       ├── products/
│   │       ├── purchases/
│   │       ├── reports/
│   │       ├── settings/
│   │       ├── suppliers/
│   │       ├── transfers/
│   │       ├── units/
│   │       └── warehouses/
│   ├── components/             # React components
│   │   ├── shared/            # Shared components
│   │   └── ui/                # UI primitives
│   ├── lib/                    # Utilities
│   │   ├── api-handler.ts     # API utilities
│   │   ├── api-response.ts    # Response helpers
│   │   ├── prisma.ts          # Prisma client
│   │   ├── errors.ts          # Custom errors
│   │   ├── utils.ts           # Utility functions
│   │   └── services/          # Business logic
│   │       ├── brand.service.ts
│   │       ├── category.service.ts
│   │       ├── customer.service.ts
│   │       ├── dashboard.service.ts
│   │       ├── finance.service.ts
│   │       ├── inventory.service.ts
│   │       ├── product.service.ts
│   │       ├── purchase.service.ts
│   │       ├── report.service.ts
│   │       ├── sale.service.ts
│   │       ├── settings.service.ts
│   │       ├── supplier.service.ts
│   │       ├── transfer.service.ts
│   │       ├── unit.service.ts
│   │       └── warehouse.service.ts
│   └── validators/             # Zod schemas
│       ├── auth.ts
│       ├── finance.ts
│       ├── inventory.ts
│       ├── product.ts
│       ├── purchase.ts
│       └── settings.ts
└── package.json
```

## Data Flow

### Product → Inventory → Sale

1. **Create Product** - Add products via `/app/products/create`
2. **Stock In** - Add inventory via `/app/inventory/stock-in`
3. **POS Sale** - Checkout at `/app/pos` automatically deducts stock
4. **View Reports** - Check `/app/reports/*` for analytics

### Multi-Tenant

The system supports multi-tenant setup:
- `tenantId` - Identifies the business/company
- `branchId` - Identifies location within the business
- All data is filtered by tenant

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/logout` | User logout |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard` | Dashboard stats (revenue, sales, top products) |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sales` | List all sales |
| POST | `/api/v1/sales` | Create new sale |
| GET | `/api/v1/sales/[id]` | Get sale details |
| POST | `/api/v1/sales/[id]` | Refund sale |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products |
| POST | `/api/v1/products` | Create product |
| PUT | `/api/v1/products/[id]` | Update product |
| DELETE | `/api/v1/products/[id]` | Delete product |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/inventory` | List inventory movements |
| POST | `/api/v1/inventory` | Stock in/out/adjust |
| GET | `/api/v1/inventory/balances` | Current stock levels |

### Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/finance` | Get summary (income, expense, net) |
| GET | `/api/v1/finance?section=transactions` | List transactions |
| POST | `/api/v1/finance?type=income` | Add income |
| POST | `/api/v1/finance?type=expense` | Add expense |
| DELETE | `/api/v1/finance/[id]?type=income` | Delete income |
| DELETE | `/api/v1/finance/[id]?type=expense` | Delete expense |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/sales` | Sales report |
| GET | `/api/v1/reports/purchases` | Purchase report |
| GET | `/api/v1/reports/inventory` | Inventory report |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customers` | List customers |
| POST | `/api/v1/customers` | Create customer |
| PUT | `/api/v1/customers/[id]` | Update customer |
| DELETE | `/api/v1/customers/[id]` | Delete customer |

### Suppliers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/suppliers` | List suppliers |
| POST | `/api/v1/suppliers` | Create supplier |
| PUT | `/api/v1/suppliers/[id]` | Update supplier |
| DELETE | `/api/v1/suppliers/[id]` | Delete supplier |

### Purchase Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/purchase-orders` | List PO |
| POST | `/api/v1/purchase-orders` | Create PO |
| POST | `/api/v1/purchase-orders/[id]?action=submit` | Submit PO |
| POST | `/api/v1/purchase-orders/[id]?action=approve` | Approve PO |
| POST | `/api/v1/purchase-orders/[id]?action=receive` | Receive inventory |
| DELETE | `/api/v1/purchase-orders/[id]` | Delete PO |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/settings?section=branches` | List branches |
| GET | `/api/v1/settings?section=roles` | List roles |
| GET | `/api/v1/settings?section=users` | List users |

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio (GUI)
npm run db:studio

# Validate schema
npm run db:validate

# Format schema
npm run db:format

# Type check
npm run type-check
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
4. Deploy

Live demo: https://poscal.vercel.app

## License

Private - All rights reserved
