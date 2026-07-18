/*
  Warnings:

  - You are about to drop the column `created_at` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `clients` table. All the data in the column will be lost.
  - Added the required column `name` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `clients` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "client_type" AS ENUM ('Individual', 'Company');

-- CreateEnum
CREATE TYPE "client_status" AS ENUM ('VIP', 'ACTIVE', 'NEW', 'INACTIVE');

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "created_at",
DROP COLUMN "full_name",
DROP COLUMN "updated_at",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "client_status" NOT NULL,
ADD COLUMN     "type" "client_type" NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "phone" SET DATA TYPE TEXT;
