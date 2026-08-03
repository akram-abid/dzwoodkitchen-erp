/*
  Warnings:

  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `workers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `workers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `workers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'WORKER');

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_worker_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'WORKER',
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "workers" ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "roles";

-- CreateIndex
CREATE UNIQUE INDEX "workers_email_key" ON "workers"("email");
