// ──────────────────────────────────────────────────────
// POS AI - Seed Data
// ──────────────────────────────────────────────────────

import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding POS AI Platform...\n')

  // ── Tenant ──
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'pt-maju-jaya' },
    update: {},
    create: {
      name: 'PT Maju Jaya',
      slug: 'pt-maju-jaya',
      email: 'info@majujaya.com',
      phone: '021-5555-1234',
      plan: 'growth',
    },
  })
  console.log('✅ Tenant:', tenant.name)

  // ── Permissions ──
  const modules = ['products', 'categories', 'brands', 'units', 'customers', 'suppliers',
    'inventory', 'sales', 'purchases', 'warehouses', 'transfers', 'finance', 'reports',
    'settings', 'users', 'roles', 'branches', 'dashboard']

  const actions = ['view', 'create', 'edit', 'delete']

  const permissions: Record<string, string> = {}
  for (const mod of modules) {
    for (const action of actions) {
      const name = `${mod}:${action}`
      const perm = await prisma.permission.upsert({
        where: { id: `perm-${name}` },
        update: {},
        create: { id: `perm-${name}`, name, module: mod, action },
      })
      permissions[`${mod}:${action}`] = perm.id
    }
  }
  console.log(`✅ ${Object.keys(permissions).length} permissions created`)

  // ── Roles ──
  const roleData = [
    { name: 'Owner', permissions: modules.flatMap(m => actions.map(a => `${m}:${a}`)) },
    { name: 'Manager', permissions: modules.flatMap(m => ['view', 'create', 'edit'].map(a => `${m}:${a}`)) },
    { name: 'Cashier', permissions: ['dashboard:view', 'sales:view', 'sales:create', 'customers:view', 'customers:create', 'products:view', 'inventory:view'] },
    { name: 'Warehouse Staff', permissions: ['inventory:view', 'inventory:create', 'inventory:edit', 'products:view', 'warehouses:view', 'transfers:view', 'transfers:create', 'purchases:view', 'purchases:create'] },
  ]

  const roles: Record<string, any> = {}
  for (const r of roleData) {
    const role = await prisma.role.upsert({
      where: { id: `role-${r.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `role-${r.name.toLowerCase().replace(/\s+/g, '-')}`,
        tenantId: tenant.id,
        name: r.name,
        permissions: {
          create: r.permissions.map(p => ({
            permissionId: permissions[p],
          })),
        },
      },
    })
    roles[r.name] = role
  }
  console.log(`✅ ${Object.keys(roles).length} roles created`)

  // ── Branches ──
  const branchData = [
    { name: 'Cabang Pusat', code: 'PST' },
    { name: 'Cabang Surabaya', code: 'SBY' },
    { name: 'Cabang Jakarta', code: 'JKT' },
  ]

  const branches: Record<string, any> = {}
  for (const b of branchData) {
    const branch = await prisma.branch.upsert({
      where: { id: `branch-${b.code.toLowerCase()}` },
      update: {},
      create: { id: `branch-${b.code.toLowerCase()}`, tenantId: tenant.id, ...b },
    })
    branches[b.name] = branch
  }
  console.log('✅ Branches created')

  // ── Warehouses ──
  const warehouseData = [
    { name: 'Gudang Utama', code: 'GDG-01', branchId: branches['Cabang Pusat'].id },
    { name: 'Gudang Surabaya', code: 'GDG-02', branchId: branches['Cabang Surabaya'].id },
    { name: 'Gudang Jakarta', code: 'GDG-03', branchId: branches['Cabang Jakarta'].id },
  ]

  const warehouses: Record<string, any> = {}
  for (const w of warehouseData) {
    const wh = await prisma.warehouse.upsert({
      where: { id: `wh-${w.code.toLowerCase()}` },
      update: {},
      create: { id: `wh-${w.code.toLowerCase()}`, tenantId: tenant.id, ...w },
    })
    warehouses[w.name] = wh
  }
  console.log('✅ Warehouses created')

  // ── Users ──
  const userData = [
    { name: 'Owner', email: 'owner@demo.com', role: 'Owner', branch: 'Cabang Pusat' },
    { name: 'Manager', email: 'manager@demo.com', role: 'Manager', branch: 'Cabang Pusat' },
    { name: 'Cashier', email: 'cashier@demo.com', role: 'Cashier', branch: 'Cabang Pusat' },
    { name: 'Warehouse Staff', email: 'warehouse@demo.com', role: 'Warehouse Staff', branch: 'Cabang Pusat' },
  ]

  for (const u of userData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        tenantId: tenant.id,
        roleId: roles[u.role].id,
        branchId: branches[u.branch].id,
        name: u.name,
        email: u.email,
        passwordHash: '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm5q2FMEoVV1qFMEoVW', // Password123!
        status: 'ACTIVE',
      },
    })
  }
  console.log('✅ Users created (password: Password123!)')

  // ── Payment Methods ──
  const paymentMethods = ['Tunai', 'Kartu Debit', 'Kartu Kredit', 'QRIS', 'Transfer Bank']
  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { id: `pm-${pm.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: { id: `pm-${pm.toLowerCase().replace(/\s+/g, '-')}`, tenantId: tenant.id, name: pm },
    })
  }
  console.log('✅ Payment methods created')

  // ── Categories ──
  const categoryNames = ['Makanan', 'Minuman', 'Elektronik', 'Fashion', 'Kebutuhan Rumah']
  const categories: Record<string, any> = {}
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { id: `cat-${name.toLowerCase()}` },
      update: {},
      create: { id: `cat-${name.toLowerCase()}`, tenantId: tenant.id, name },
    })
    categories[name] = cat
  }
  console.log('✅ Categories created')

  // ── Brands ──
  const brandNames = ['Indomie', 'Aqua', 'ABC', 'Samsung', 'LG']
  const brands: Record<string, any> = {}
  for (const name of brandNames) {
    const brand = await prisma.brand.upsert({
      where: { id: `brand-${name.toLowerCase()}` },
      update: {},
      create: { id: `brand-${name.toLowerCase()}`, tenantId: tenant.id, name },
    })
    brands[name] = brand
  }
  console.log('✅ Brands created')

  // ── Units ──
  const unitData = [
    { name: 'Pieces', symbol: 'PCS' },
    { name: 'Kilogram', symbol: 'KG' },
    { name: 'Liter', symbol: 'LTR' },
    { name: 'Box', symbol: 'BOX' },
    { name: 'Pack', symbol: 'PK' },
  ]
  const units: Record<string, any> = {}
  for (const u of unitData) {
    const unit = await prisma.unit.upsert({
      where: { id: `unit-${u.symbol.toLowerCase()}` },
      update: {},
      create: { id: `unit-${u.symbol.toLowerCase()}`, tenantId: tenant.id, ...u },
    })
    units[u.symbol] = unit
  }
  console.log('✅ Units created')

  // ── Products ──
  const productData = [
    { name: 'Indomie Goreng', sku: 'IDM-001', category: 'Makanan', brand: 'Indomie', unit: 'PCS', costPrice: 2500, sellingPrice: 3500 },
    { name: 'Indomie Rebus', sku: 'IDM-002', category: 'Makanan', brand: 'Indomie', unit: 'PCS', costPrice: 2500, sellingPrice: 3500 },
    { name: 'Aqua 600ml', sku: 'AQU-001', category: 'Minuman', brand: 'Aqua', unit: 'PCS', costPrice: 3000, sellingPrice: 4500 },
    { name: 'Aqua 1500ml', sku: 'AQU-002', category: 'Minuman', brand: 'Aqua', unit: 'PCS', costPrice: 5000, sellingPrice: 7500 },
    { name: 'ABC Kecap Manis 500ml', sku: 'ABC-001', category: 'Makanan', brand: 'ABC', unit: 'PCS', costPrice: 12000, sellingPrice: 18000 },
    { name: 'ABC Sambal 300ml', sku: 'ABC-002', category: 'Makanan', brand: 'ABC', unit: 'PCS', costPrice: 8000, sellingPrice: 13000 },
    { name: 'Samsung TV 43"', sku: 'SSG-001', category: 'Elektronik', brand: 'Samsung', unit: 'PCS', costPrice: 3500000, sellingPrice: 4500000 },
    { name: 'Samsung TV 55"', sku: 'SSG-002', category: 'Elektronik', brand: 'Samsung', unit: 'PCS', costPrice: 5500000, sellingPrice: 7500000 },
    { name: 'LG AC 1 PK', sku: 'LG-001', category: 'Elektronik', brand: 'LG', unit: 'PCS', costPrice: 3000000, sellingPrice: 4200000 },
    { name: 'LG AC 2 PK', sku: 'LG-002', category: 'Elektronik', brand: 'LG', unit: 'PCS', costPrice: 5000000, sellingPrice: 7000000 },
    { name: 'Kaos Polos Hitam', sku: 'FSN-001', category: 'Fashion', brand: 'ABC', unit: 'PCS', costPrice: 30000, sellingPrice: 50000 },
    { name: 'Sapu Lantai', sku: 'KBR-001', category: 'Kebutuhan Rumah', brand: 'ABC', unit: 'PCS', costPrice: 15000, sellingPrice: 25000 },
  ]

  for (const p of productData) {
    await prisma.product.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: p.sku } },
      update: {},
      create: {
        tenantId: tenant.id,
        categoryId: categories[p.category].id,
        brandId: brands[p.brand].id,
        unitId: units[p.unit].id,
        name: p.name, sku: p.sku,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
      },
    })
  }
  console.log('✅ Products created')

  // ── Customers ──
  const customerData = [
    { name: 'Budi Santoso', phone: '0812-1111-1111', email: 'budi@email.com' },
    { name: 'Andi Wijaya', phone: '0812-2222-2222', email: 'andi@email.com' },
    { name: 'Dewi Lestari', phone: '0812-3333-3333', email: 'dewi@email.com' },
    { name: 'Siti Rahma', phone: '0812-4444-4444' },
    { name: 'Rudi Hartono', phone: '0812-5555-5555' },
  ]

  const customers: Record<string, any> = {}
  for (const c of customerData) {
    const customer = await prisma.customer.upsert({
      where: { id: `cust-${c.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: { id: `cust-${c.name.toLowerCase().replace(/\s+/g, '-')}`, tenantId: tenant.id, ...c },
    })
    customers[c.name] = customer
  }
  console.log('✅ Customers created')

  // ── Suppliers ──
  const supplierData = [
    { name: 'PT Indofood', phone: '021-5795-8822', email: 'sales@indofood.co.id' },
    { name: 'PT Tirta Investama', phone: '021-2555-8888', email: 'sales@aqua.co.id' },
    { name: 'PT Samsung Indonesia', phone: '021-2999-8888', email: 'sales@samsung.co.id' },
    { name: 'PT LG Electronics', phone: '021-2688-8888', email: 'sales@lg.co.id' },
  ]

  for (const s of supplierData) {
    await prisma.supplier.upsert({
      where: { id: `sup-${s.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: { id: `sup-${s.name.toLowerCase().replace(/\s+/g, '-')}`, tenantId: tenant.id, ...s },
    })
  }
  console.log('✅ Suppliers created')

  // ── Initial Inventory Balances ──
  const inventoryData = [
    { product: 'Indomie Goreng', warehouse: 'Gudang Utama', qty: 500 },
    { product: 'Aqua 600ml', warehouse: 'Gudang Utama', qty: 1000 },
    { product: 'Samsung TV 43"', warehouse: 'Gudang Utama', qty: 25 },
    { product: 'LG AC 1 PK', warehouse: 'Gudang Utama', qty: 15 },
    { product: 'ABC Kecap Manis 500ml', warehouse: 'Gudang Utama', qty: 200 },
    { product: 'Indomie Rebus', warehouse: 'Gudang Surabaya', qty: 300 },
    { product: 'Aqua 1500ml', warehouse: 'Gudang Surabaya', qty: 400 },
    { product: 'Samsung TV 55"', warehouse: 'Gudang Jakarta', qty: 10 },
  ]

  for (const inv of inventoryData) {
    const product = await prisma.product.findFirst({ where: { tenantId: tenant.id, name: inv.product } })
    const warehouse = warehouses[inv.warehouse]

    if (product && warehouse) {
      await prisma.inventoryBalance.upsert({
        where: { warehouseId_productId: { warehouseId: warehouse.id, productId: product.id } },
        update: { quantity: inv.qty },
        create: { tenantId: tenant.id, warehouseId: warehouse.id, productId: product.id, quantity: inv.qty },
      })

      // Record initial movement
      await prisma.inventoryMovement.create({
        data: {
          tenantId: tenant.id,
          warehouseId: warehouse.id,
          productId: product.id,
          movementType: 'PURCHASE',
          quantity: inv.qty,
          previousStock: 0,
          currentStock: inv.qty,
          notes: 'Initial stock',
          createdBy: 'seed',
        },
      })
    }
  }
  console.log('✅ Inventory balances created')

  // ── Sample Sales (last 30 days) ──
  const customerNames = Object.keys(customers)
  const allProducts = await prisma.product.findMany({ where: { tenantId: tenant.id } })
  const paymentMethodsList = await prisma.paymentMethod.findMany({ where: { tenantId: tenant.id } })
  const mainWarehouse = warehouses['Gudang Utama']

  for (let i = 0; i < 100; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))

    const itemCount = Math.floor(Math.random() * 4) + 1
    const shuffled = [...allProducts].sort(() => Math.random() - 0.5).slice(0, itemCount)
    const items = shuffled.map(p => ({
      productId: p.id,
      quantity: Math.floor(Math.random() * 5) + 1,
      price: Number(p.sellingPrice),
      discount: 0,
      subtotal: Number(p.sellingPrice) * (Math.floor(Math.random() * 5) + 1),
    }))

    const subtotal = items.reduce((s, i) => s + i.subtotal, 0)
    const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 10000) : 0
    const total = subtotal - discount
    const customer = customers[customerNames[Math.floor(Math.random() * customerNames.length)]]
    const paymentMethod = paymentMethodsList[Math.floor(Math.random() * paymentMethodsList.length)]
    const invoiceNumber = `INV-${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`

    await prisma.sale.create({
      data: {
        tenantId: tenant.id,
        branchId: branches['Cabang Pusat'].id,
        customerId: customer.id,
        invoiceNumber,
        subtotal, discount, tax: 0, total,
        status: 'COMPLETED',
        createdBy: 'seed',
        createdAt: date,
        items: { create: items },
        payments: { create: { paymentMethodId: paymentMethod.id, amount: total } },
      },
    })
  }
  console.log('✅ 100 sample sales created')

  // ── Sample Purchase Orders ──
  const suppliers = await prisma.supplier.findMany({ where: { tenantId: tenant.id } })

  for (let i = 0; i < 10; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 60))
    const itemCount = Math.floor(Math.random() * 3) + 1
    const shuffled = [...allProducts].sort(() => Math.random() - 0.5).slice(0, itemCount)
    const items = shuffled.map(p => ({
      productId: p.id,
      quantity: Math.floor(Math.random() * 50) + 10,
      costPrice: Number(p.costPrice),
      subtotal: Number(p.costPrice) * (Math.floor(Math.random() * 50) + 10),
    }))

    const total = items.reduce((s, i) => s + i.subtotal, 0)
    const poNumber = `PO-${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`
    const statuses: Array<'RECEIVED' | 'APPROVED' | 'DRAFT'> = ['RECEIVED', 'APPROVED', 'DRAFT']
    const status = statuses[i % 3]
    const supplier = suppliers[i % suppliers.length]

    const po = await prisma.purchaseOrder.create({
      data: {
        tenantId: tenant.id,
        supplierId: supplier.id,
        warehouseId: mainWarehouse.id,
        poNumber, status,
        subtotal: total, total,
        createdBy: 'seed',
        createdAt: date,
        items: { create: items },
      },
    })

    if (status === 'RECEIVED') {
      for (const item of items) {
        const balance = await prisma.inventoryBalance.findUnique({
          where: { warehouseId_productId: { warehouseId: mainWarehouse.id, productId: item.productId } },
        })
        const prevQty = balance?.quantity?.toNumber() ?? 0
        const newQty = prevQty + item.quantity

        await prisma.inventoryBalance.upsert({
          where: { warehouseId_productId: { warehouseId: mainWarehouse.id, productId: item.productId } },
          update: { quantity: newQty },
          create: { tenantId: tenant.id, warehouseId: mainWarehouse.id, productId: item.productId, quantity: newQty },
        })

        await prisma.inventoryMovement.create({
          data: {
            tenantId: tenant.id,
            warehouseId: mainWarehouse.id,
            productId: item.productId,
            movementType: 'PURCHASE',
            quantity: item.quantity,
            previousStock: prevQty,
            currentStock: newQty,
            referenceType: 'PURCHASE_ORDER',
            referenceId: po.id,
            createdBy: 'seed',
          },
        })
      }
    }
  }
  console.log('✅ 10 sample purchase orders created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('   Login: owner@demo.com / Password123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
