-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('NORMAL', 'ADDITIONAL');

-- AlterTable
ALTER TABLE "WorkersPayments" ADD COLUMN     "type" "payment_type" NOT NULL DEFAULT 'NORMAL';
