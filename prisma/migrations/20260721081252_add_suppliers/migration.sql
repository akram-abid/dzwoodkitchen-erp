-- CreateEnum
CREATE TYPE "supplier_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "purchase_order_status" AS ENUM ('PENDING', 'RECEIVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "nif" VARCHAR(20),
    "rc" VARCHAR(40),
    "status" "supplier_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" SERIAL NOT NULL,
    "po_ref" VARCHAR(30) NOT NULL,
    "invoice_ref" VARCHAR(30),
    "supplier_id" INTEGER NOT NULL,
    "order_date" DATE NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "purchase_order_status" NOT NULL DEFAULT 'PENDING',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_at" TIMESTAMP(6),

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" SERIAL NOT NULL,
    "purchase_order_id" INTEGER NOT NULL,
    "material" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" VARCHAR(20) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_suppliers_status" ON "suppliers"("status");

-- CreateIndex
CREATE INDEX "idx_suppliers_name" ON "suppliers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_ref_key" ON "purchase_orders"("po_ref");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_invoice_ref_key" ON "purchase_orders"("invoice_ref");

-- CreateIndex
CREATE INDEX "idx_purchase_orders_supplier_id" ON "purchase_orders"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_purchase_orders_order_date" ON "purchase_orders"("order_date");

-- CreateIndex
CREATE INDEX "idx_purchase_orders_status" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "idx_purchase_orders_paid" ON "purchase_orders"("paid");

-- CreateIndex
CREATE INDEX "idx_purchase_order_items_po_id" ON "purchase_order_items"("purchase_order_id");

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
