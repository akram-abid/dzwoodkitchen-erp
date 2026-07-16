/*
  Warnings:

  - Changed the type of `clockIn` on the `TimeEntries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `clockOut` on the `TimeEntries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TimeEntries" DROP COLUMN "clockIn",
ADD COLUMN     "clockIn" VARCHAR(5) NOT NULL,
DROP COLUMN "clockOut",
ADD COLUMN     "clockOut" VARCHAR(5) NOT NULL,
ALTER COLUMN "extraHours" SET DEFAULT 0;
