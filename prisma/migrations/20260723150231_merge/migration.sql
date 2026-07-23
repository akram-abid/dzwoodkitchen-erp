/*
  Warnings:

  - You are about to drop the column `entry_id` on the `material_purchase_items` table. All the data in the column will be lost.
  - You are about to drop the `treasury_entries` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `material_catalog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `material_catalog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchase_id` to the `material_purchase_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "material_status_override" AS ENUM ('ORDERED');

-- CreateEnum
CREATE TYPE "movement_type" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "supplier_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "purchase_order_status" AS ENUM ('PENDING', 'RECEIVED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "material_purchase_items" DROP CONSTRAINT "material_purchase_items_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "treasury_entries" DROP CONSTRAINT "treasury_entries_other_category_id_fkey";

-- DropForeignKey
ALTER TABLE "treasury_entries" DROP CONSTRAINT "treasury_entries_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "treasury_entries" DROP CONSTRAINT "treasury_entries_worker_id_fkey";

-- DropIndex
DROP INDEX "idx_material_purchase_items_entry_id";

-- AlterTable
ALTER TABLE "material_catalog" ADD COLUMN     "code" VARCHAR(20) NOT NULL,
ADD COLUMN     "location" VARCHAR(100),
ADD COLUMN     "max_stock" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "min_stock" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "status_override" "material_status_override",
ADD COLUMN     "supplier_id" INTEGER,
ADD COLUMN     "unit_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "material_purchase_items" DROP COLUMN "entry_id",
ADD COLUMN     "purchase_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "nif" VARCHAR(20),
ADD COLUMN     "rc" VARCHAR(30),
ADD COLUMN     "status" "supplier_status" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "treasury_entries";

-- DropEnum
DROP TYPE "treasury_entry_type";

-- CreateTable
CREATE TABLE "material_leftovers" (
    "id" SERIAL NOT NULL,
    "material_id" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "dimensions" VARCHAR(100),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_order_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_leftovers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_stock_movements" (
    "id" SERIAL NOT NULL,
    "material_id" INTEGER NOT NULL,
    "type" "movement_type" NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" INTEGER,
    "worker_id" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" SERIAL NOT NULL,
    "po_ref" VARCHAR(50) NOT NULL,
    "invoice_ref" VARCHAR(50),
    "supplier_id" INTEGER NOT NULL,
    "order_date" DATE NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" "purchase_order_status" NOT NULL DEFAULT 'PENDING',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "received_at" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" SERIAL NOT NULL,
    "purchase_order_id" INTEGER NOT NULL,
    "material" VARCHAR(150) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reference" VARCHAR(100),
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_purchases" (
    "id" SERIAL NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reference" VARCHAR(100),
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "other_expenses" (
    "id" SERIAL NOT NULL,
    "other_category_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reference" VARCHAR(100),
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "other_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_material_leftovers_material_id" ON "material_leftovers"("material_id");

-- CreateIndex
CREATE INDEX "idx_material_stock_movements_material_id" ON "material_stock_movements"("material_id");

-- CreateIndex
CREATE INDEX "idx_material_stock_movements_order_id" ON "material_stock_movements"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_ref_key" ON "purchase_orders"("po_ref");

-- CreateIndex
CREATE INDEX "idx_purchase_orders_supplier_id" ON "purchase_orders"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_purchase_order_items_purchase_order_id" ON "purchase_order_items"("purchase_order_id");

-- CreateIndex
CREATE INDEX "idx_incomes_date" ON "incomes"("date");

-- CreateIndex
CREATE INDEX "idx_material_purchases_supplier_id" ON "material_purchases"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_material_purchases_date" ON "material_purchases"("date");

-- CreateIndex
CREATE INDEX "idx_other_expenses_category_id" ON "other_expenses"("other_category_id");

-- CreateIndex
CREATE INDEX "idx_other_expenses_date" ON "other_expenses"("date");

-- CreateIndex
CREATE UNIQUE INDEX "material_catalog_code_key" ON "material_catalog"("code");

-- CreateIndex
CREATE INDEX "idx_material_catalog_supplier_id" ON "material_catalog"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_material_purchase_items_purchase_id" ON "material_purchase_items"("purchase_id");

-- AddForeignKey
ALTER TABLE "material_catalog" ADD CONSTRAINT "material_catalog_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_leftovers" ADD CONSTRAINT "material_leftovers_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "material_catalog"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_leftovers" ADD CONSTRAINT "material_leftovers_source_order_id_fkey" FOREIGN KEY ("source_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_stock_movements" ADD CONSTRAINT "material_stock_movements_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "material_catalog"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_stock_movements" ADD CONSTRAINT "material_stock_movements_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_stock_movements" ADD CONSTRAINT "material_stock_movements_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_purchases" ADD CONSTRAINT "material_purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_purchase_items" ADD CONSTRAINT "material_purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "material_purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "other_expenses" ADD CONSTRAINT "other_expenses_other_category_id_fkey" FOREIGN KEY ("other_category_id") REFERENCES "other_expense_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
