import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Create default tenant with ID 'default' to match getTenantId fallback
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Default Tenant',
      slug: 'default',
      email: 'admin@poscal.com',
      status: 'active',
    },
  })

  // Create default role
  const role = await prisma.role.upsert({
    where: { id: 'default-role' },
    update: {},
    create: {
      id: 'default-role',
      tenantId: tenant.id,
      name: 'Admin',
      description: 'Administrator role',
    },
  })

  // Create default branch
  const branch = await prisma.branch.upsert({
    where: { id: 'default-branch' },
    update: {},
    create: {
      id: 'default-branch',
      tenantId: tenant.id,
      name: 'Main Branch',
      code: 'MAIN',
    },
  })

  // Create default warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { id: 'default-warehouse' },
    update: {},
    create: {
      id: 'default-warehouse',
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'Main Warehouse',
      code: 'WH001',
    },
  })

  // Create units
  const units = ['pcs', 'kg', 'gram', 'liter', 'ml', 'pack', 'box', 'botol', 'sachet'].map((symbol, i) => ({
    id: `unit-${i + 1}`,
    tenantId: tenant.id,
    name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
    symbol,
  }))

  // Create payment methods
  const paymentMethods = [
    { id: 'cash', name: 'Cash' },
    { id: 'debit', name: 'Debit Card' },
    { id: 'qris', name: 'QRIS' },
  ]

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { id: pm.id },
      update: pm,
      create: { ...pm, tenantId: tenant.id },
    })
  }

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { id: unit.id },
      update: unit,
      create: unit,
    })
  }

  // Create categories
  const categories = [
    { id: 'cat-makanan', name: 'Makanan', description: 'Makanan ringan dan berat' },
    { id: 'cat-minuman', name: 'Minuman', description: 'Minuman kemasan dan botol' },
    { id: 'cat-snack', name: 'Snack', description: 'Snack dan camilan' },
    { id: 'cat-elektronik', name: 'Elektronik', description: 'Barang elektronik' },
    { id: 'cat-perawatan', name: 'Perawatan Diri', description: 'Sabun, shampoo, pasta gigi' },
    { id: 'cat-rumah', name: 'Kebutuhan Rumah', description: 'Perlengkapan rumah tangga' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: { ...cat, tenantId: tenant.id },
    })
  }

  // Create brands
  const brands = [
    { id: 'brand-indomie', name: 'Indomie', description: 'Mie instant' },
    { id: 'brand-aqua', name: 'Aqua', description: 'Air mineral' },
    { id: 'brand-sosro', name: 'Sosro', description: 'Teh dalam kemasan' },
    { id: 'brand-samsung', name: 'Samsung', description: 'Elektronik' },
    { id: 'brand-oppo', name: 'Oppo', description: 'Smartphone' },
    { id: 'brand-unilever', name: 'Unilever', description: 'Barang kebutuhan rumah' },
    { id: 'brand-abc', name: 'ABC', description: 'Kopi dan minuman' },
    { id: 'brand-nivea', name: 'Nivea', description: 'Perawatan diri' },
  ]

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: brand,
      create: { ...brand, tenantId: tenant.id },
    })
  }

  // Create products
  const products = [
    // Makanan
    { sku: 'IND-001', name: 'Indomie Goreng', category: 'cat-makanan', brand: 'brand-indomie', unit: 'pcs', costPrice: 2500, sellingPrice: 3500 },
    { sku: 'IND-002', name: 'Indomie Ayam Bawang', category: 'cat-makanan', brand: 'brand-indomie', unit: 'pcs', costPrice: 2500, sellingPrice: 3500 },
    { sku: 'IND-003', name: 'Indomie Special', category: 'cat-makanan', brand: 'brand-indomie', unit: 'pcs', costPrice: 3000, sellingPrice: 4000 },
    { sku: 'IND-004', name: 'Indomie Goreng Spesial', category: 'cat-makanan', brand: 'brand-indomie', unit: 'pack', costPrice: 10000, sellingPrice: 13000 },
    
    // Minuman
    { sku: 'AQU-001', name: 'Aqua 240ml', category: 'cat-minuman', brand: 'brand-aqua', unit: 'botol', costPrice: 3000, sellingPrice: 4000 },
    { sku: 'AQU-002', name: 'Aqua 600ml', category: 'cat-minuman', brand: 'brand-aqua', unit: 'botol', costPrice: 5000, sellingPrice: 6500 },
    { sku: 'AQU-003', name: 'Aqua 1500ml', category: 'cat-minuman', brand: 'brand-aqua', unit: 'botol', costPrice: 7000, sellingPrice: 9000 },
    
    // Teh
    { sku: 'SOS-001', name: 'Teh Botol 250ml', category: 'cat-minuman', brand: 'brand-sosro', unit: 'botol', costPrice: 4000, sellingPrice: 5500 },
    { sku: 'SOS-002', name: 'Teh Botol 450ml', category: 'cat-minuman', brand: 'brand-sosro', unit: 'botol', costPrice: 6000, sellingPrice: 8000 },
    { sku: 'SOS-003', name: 'Sosro 1000ml', category: 'cat-minuman', brand: 'brand-sosro', unit: 'botol', costPrice: 10000, sellingPrice: 13000 },
    
    // Kopi
    { sku: 'ABC-001', name: 'ABC Susu Coffee 150ml', category: 'cat-minuman', brand: 'brand-abc', unit: 'botol', costPrice: 5000, sellingPrice: 7000 },
    { sku: 'ABC-002', name: 'ABC Kopiko 150ml', category: 'cat-minuman', brand: 'brand-abc', unit: 'botol', costPrice: 5000, sellingPrice: 7000 },
    { sku: 'ABC-003', name: 'ABC Susu Frestea 150ml', category: 'cat-minuman', brand: 'brand-abc', unit: 'botol', costPrice: 5000, sellingPrice: 7000 },
    
    // Snack
    { sku: 'CHK-001', name: 'Chiki Bites 50g', category: 'cat-snack', brand: 'brand-unilever', unit: 'pcs', costPrice: 5000, sellingPrice: 7000 },
    { sku: 'CHK-002', name: 'Qtela 80g', category: 'cat-snack', brand: 'brand-unilever', unit: 'pcs', costPrice: 8000, sellingPrice: 11000 },
    { sku: 'CHK-003', name: 'Taro 70g', category: 'cat-snack', brand: 'brand-unilever', unit: 'pcs', costPrice: 7000, sellingPrice: 10000 },
    
    // Elektronik
    { sku: 'SAM-001', name: 'Samsung Galaxy A14', category: 'cat-elektronik', brand: 'brand-samsung', unit: 'pcs', costPrice: 2500000, sellingPrice: 2999000 },
    { sku: 'SAM-002', name: 'Samsung Galaxy A54', category: 'cat-elektronik', brand: 'brand-samsung', unit: 'pcs', costPrice: 4500000, sellingPrice: 5299000 },
    { sku: 'SAM-003', name: 'Samsung Galaxy S24', category: 'cat-elektronik', brand: 'brand-samsung', unit: 'pcs', costPrice: 15000000, sellingPrice: 17990000 },
    { sku: 'SAM-004', name: 'Samsung Earphone', category: 'cat-elektronik', brand: 'brand-samsung', unit: 'pcs', costPrice: 150000, sellingPrice: 250000 },
    
    // HP Oppo
    { sku: 'OPP-001', name: 'Oppo A78', category: 'cat-elektronik', brand: 'brand-oppo', unit: 'pcs', costPrice: 2800000, sellingPrice: 3299000 },
    { sku: 'OPP-002', name: 'Oppo Reno 10', category: 'cat-elektronik', brand: 'brand-oppo', unit: 'pcs', costPrice: 5500000, sellingPrice: 6499000 },
    
    // Perawatan Diri
    { sku: 'NIV-001', name: 'Nivea Body Lotion 400ml', category: 'cat-perawatan', brand: 'brand-nivea', unit: 'pcs', costPrice: 45000, sellingPrice: 65000 },
    { sku: 'NIV-002', name: 'Nivea Deodorant 150ml', category: 'cat-perawatan', brand: 'brand-nivea', unit: 'pcs', costPrice: 35000, sellingPrice: 50000 },
    { sku: 'NIV-003', name: 'Nivea Face Wash 100ml', category: 'cat-perawatan', brand: 'brand-nivea', unit: 'pcs', costPrice: 25000, sellingPrice: 38000 },
  ]

  for (const prod of products) {
    const unit = units.find(u => u.symbol === prod.unit)
    await prisma.product.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: prod.sku } },
      update: {
        name: prod.name,
        categoryId: prod.category,
        brandId: prod.brand,
        unitId: unit?.id,
        costPrice: prod.costPrice,
        sellingPrice: prod.sellingPrice,
      },
      create: {
        tenantId: tenant.id,
        sku: prod.sku,
        name: prod.name,
        categoryId: prod.category,
        brandId: prod.brand,
        unitId: unit?.id,
        costPrice: prod.costPrice,
        sellingPrice: prod.sellingPrice,
        isActive: true,
      },
    })
  }

  // Create inventory balances for products (initial stock)
  const allProducts = await prisma.product.findMany({ where: { tenantId: tenant.id } })
  for (const product of allProducts) {
    await prisma.inventoryBalance.upsert({
      where: { warehouseId_productId: { warehouseId: warehouse.id, productId: product.id } },
      update: {},
      create: {
        tenantId: tenant.id,
        warehouseId: warehouse.id,
        productId: product.id,
        quantity: 100, // Initial stock of 100 for each product
      },
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
