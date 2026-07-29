/*
  Warnings:

  - You are about to drop the column `end_km` on the `vehicle_trips` table. All the data in the column will be lost.
  - You are about to drop the column `start_km` on the `vehicle_trips` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vehicle_trips" DROP COLUMN "end_km",
DROP COLUMN "start_km",
ADD COLUMN     "distance" DECIMAL(10,2) NOT NULL DEFAULT 0;
