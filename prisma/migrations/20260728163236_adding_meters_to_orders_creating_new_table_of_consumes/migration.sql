-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "meters" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "order_material_consumptions" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20),
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_material_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_order_material_consumptions_order_id" ON "order_material_consumptions"("order_id");

-- CreateIndex
CREATE INDEX "idx_order_material_consumptions_material_id" ON "order_material_consumptions"("material_id");

-- AddForeignKey
ALTER TABLE "order_material_consumptions" ADD CONSTRAINT "order_material_consumptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_material_consumptions" ADD CONSTRAINT "order_material_consumptions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "material_catalog"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
