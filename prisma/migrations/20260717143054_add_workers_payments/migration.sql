-- CreateTable
CREATE TABLE "WorkersPayments" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "workerId" INTEGER NOT NULL,

    CONSTRAINT "WorkersPayments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkersPayments" ADD CONSTRAINT "WorkersPayments_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
