/*
  Warnings:

  - You are about to drop the column `nif` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `rc` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the `purchase_order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase_orders` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `suppliers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "treasury_entry_type" AS ENUM ('INCOME', 'WORKER_PAYMENT', 'MATERIAL_PURCHASE', 'OTHER_EXPENSE');

-- DropForeignKey
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_purchase_order_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_supplier_id_fkey";

-- DropIndex
DROP INDEX "idx_suppliers_name";

-- DropIndex
DROP INDEX "idx_suppliers_status";

-- AlterTable
ALTER TABLE "suppliers" DROP COLUMN "nif",
DROP COLUMN "rc",
DROP COLUMN "status",
DROP COLUMN "updated_at",
ADD COLUMN     "address" VARCHAR(255);

-- DropTable
DROP TABLE "purchase_order_items";

-- DropTable
DROP TABLE "purchase_orders";

-- DropEnum
DROP TYPE "purchase_order_status";

-- DropEnum
DROP TYPE "supplier_status";

-- CreateTable
CREATE TABLE "material_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "material_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_catalog" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category_id" INTEGER,
    "default_unit" VARCHAR(20),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "other_expense_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "other_expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_entries" (
    "id" SERIAL NOT NULL,
    "type" "treasury_entry_type" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reference" VARCHAR(100),
    "note" TEXT,
    "period" VARCHAR(80),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "worker_id" INTEGER,
    "supplier_id" INTEGER,
    "other_category_id" INTEGER,

    CONSTRAINT "treasury_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_purchase_items" (
    "id" SERIAL NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "material_id" INTEGER,
    "material_name" VARCHAR(150) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "material_purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "material_categories_name_key" ON "material_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "material_catalog_name_key" ON "material_catalog"("name");

-- CreateIndex
CREATE INDEX "idx_material_catalog_category_id" ON "material_catalog"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "other_expense_categories_name_key" ON "other_expense_categories"("name");

-- CreateIndex
CREATE INDEX "idx_treasury_entries_type_date" ON "treasury_entries"("type", "date");

-- CreateIndex
CREATE INDEX "idx_treasury_entries_date" ON "treasury_entries"("date");

-- CreateIndex
CREATE INDEX "idx_treasury_entries_worker_id" ON "treasury_entries"("worker_id");

-- CreateIndex
CREATE INDEX "idx_treasury_entries_supplier_id" ON "treasury_entries"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_treasury_entries_other_category_id" ON "treasury_entries"("other_category_id");

-- CreateIndex
CREATE INDEX "idx_material_purchase_items_entry_id" ON "material_purchase_items"("entry_id");

-- CreateIndex
CREATE INDEX "idx_material_purchase_items_material_id" ON "material_purchase_items"("material_id");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_name_key" ON "suppliers"("name");

-- AddForeignKey
ALTER TABLE "material_catalog" ADD CONSTRAINT "material_catalog_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "material_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "treasury_entries" ADD CONSTRAINT "treasury_entries_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "treasury_entries" ADD CONSTRAINT "treasury_entries_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "treasury_entries" ADD CONSTRAINT "treasury_entries_other_category_id_fkey" FOREIGN KEY ("other_category_id") REFERENCES "other_expense_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_purchase_items" ADD CONSTRAINT "material_purchase_items_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "treasury_entries"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_purchase_items" ADD CONSTRAINT "material_purchase_items_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "material_catalog"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
