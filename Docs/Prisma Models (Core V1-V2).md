2. Prisma Models (Core V1-V2)
Tenant
model Tenant {
  id          String   @id @default(cuid())

  name        String

  slug        String   @unique

  email       String?

  phone       String?

  status      String

  createdAt   DateTime @default(now())

  updatedAt   DateTime @updatedAt

  users       User[]

  branches    Branch[]

  products    Product[]
}
User
model User {
  id          String   @id @default(cuid())

  tenantId    String

  roleId      String

  branchId    String?

  name        String

  email       String

  password    String

  status      UserStatus

  tenant      Tenant @relation(fields:[tenantId],references:[id])

  role        Role @relation(fields:[roleId],references:[id])

  branch      Branch? @relation(fields:[branchId],references:[id])

  createdAt   DateTime @default(now())

  updatedAt   DateTime @updatedAt

  deletedAt   DateTime?

  @@index([tenantId])
}
Product
model Product {

  id String @id @default(cuid())

  tenantId String

  categoryId String?

  brandId String?

  unitId String?

  sku String

  barcode String?

  name String

  description String?

  costPrice Decimal @db.Decimal(18,2)

  sellingPrice Decimal @db.Decimal(18,2)

  image String?

  isActive Boolean @default(true)

  tenant Tenant @relation(fields:[tenantId], references:[id])

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  deletedAt DateTime?

  @@unique([tenantId, sku])

}
InventoryMovement
model InventoryMovement {

  id String @id @default(cuid())

  tenantId String

  warehouseId String

  productId String

  movementType InventoryMovementType

  quantity Decimal @db.Decimal(18,2)

  previousStock Decimal @db.Decimal(18,2)

  currentStock Decimal @db.Decimal(18,2)

  referenceType String?

  referenceId String?

  notes String?

  createdBy String

  createdAt DateTime @default(now())

  @@index([tenantId])

  @@index([productId])

  @@index([warehouseId])

}
InventoryBalance
model InventoryBalance {

  id String @id @default(cuid())

  tenantId String

  warehouseId String

  productId String

  quantity Decimal @db.Decimal(18,2)

  @@unique([warehouseId, productId])

}
Sale
model Sale {

  id String @id @default(cuid())

  tenantId String

  customerId String?

  branchId String

  invoiceNumber String

  subtotal Decimal @db.Decimal(18,2)

  discount Decimal @db.Decimal(18,2)

  tax Decimal @db.Decimal(18,2)

  total Decimal @db.Decimal(18,2)

  status SaleStatus

  createdBy String

  createdAt DateTime @default(now())

  items SaleItem[]

}