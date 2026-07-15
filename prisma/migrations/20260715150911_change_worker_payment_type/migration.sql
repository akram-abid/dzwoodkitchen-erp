/*
  Warnings:

  - The values [hourly,per_meter] on the enum `worker_payment_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "worker_payment_type_new" AS ENUM ('hours', 'meters');
ALTER TABLE "workers" ALTER COLUMN "payment_type" TYPE "worker_payment_type_new" USING ("payment_type"::text::"worker_payment_type_new");
ALTER TYPE "worker_payment_type" RENAME TO "worker_payment_type_old";
ALTER TYPE "worker_payment_type_new" RENAME TO "worker_payment_type";
DROP TYPE "public"."worker_payment_type_old";
COMMIT;
