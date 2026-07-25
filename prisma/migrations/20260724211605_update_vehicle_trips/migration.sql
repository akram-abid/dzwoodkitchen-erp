/*
  Warnings:

  - You are about to drop the column `kilometers` on the `vehicle_trips` table. All the data in the column will be lost.
  - You are about to drop the column `trip_date` on the `vehicle_trips` table. All the data in the column will be lost.
  - Added the required column `date` to the `vehicle_trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purpose` to the `vehicle_trips` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "trip_purpose" AS ENUM ('DELIVERY', 'PICKUP', 'TRANSFER', 'MAINTENANCE', 'PERSONAL');

-- DropForeignKey
ALTER TABLE "vehicle_trips" DROP CONSTRAINT "vehicle_trips_order_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_trips" DROP CONSTRAINT "vehicle_trips_vehicle_id_fkey";

-- DropIndex
DROP INDEX "idx_vehicle_trips_order_id";

-- DropIndex
DROP INDEX "idx_vehicle_trips_vehicle_id";

-- AlterTable
ALTER TABLE "vehicle_trips" DROP COLUMN "kilometers",
DROP COLUMN "trip_date",
ADD COLUMN     "cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "end_km" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purpose" "trip_purpose" NOT NULL,
ADD COLUMN     "start_km" DECIMAL(10,2) NOT NULL DEFAULT 0,
ALTER COLUMN "order_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "vehicle_trips" ADD CONSTRAINT "vehicle_trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_trips" ADD CONSTRAINT "vehicle_trips_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
