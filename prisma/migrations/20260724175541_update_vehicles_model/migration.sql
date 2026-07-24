/*
  Warnings:

  - You are about to drop the column `total_kilometers` on the `vehicles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "total_kilometers",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_km" DECIMAL(10,2),
ADD COLUMN     "daily_cost" DECIMAL(10,2),
ADD COLUMN     "fuel_type" VARCHAR(20),
ADD COLUMN     "monthly_maint" DECIMAL(10,2),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purchase_date" DATE,
ADD COLUMN     "purchase_price" DECIMAL(10,2),
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "plate_number" SET DATA TYPE VARCHAR(50);
