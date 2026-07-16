-- CreateTable
CREATE TABLE "TimeEntries" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockOut" TIMESTAMP(3) NOT NULL,
    "extraHours" INTEGER NOT NULL,
    "extraNote" TEXT,
    "workerId" INTEGER NOT NULL,

    CONSTRAINT "TimeEntries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimeEntries" ADD CONSTRAINT "TimeEntries_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
