/*
  Warnings:

  - You are about to drop the column `status` on the `clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "status";

-- DropEnum
DROP TYPE "client_status";
