-- CreateEnum
CREATE TYPE "task_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "priority" "task_priority" NOT NULL DEFAULT 'MEDIUM',
    "due_date" DATE,
    "due_time" VARCHAR(5),
    "assignee" VARCHAR(150),
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_tasks_due_date" ON "tasks"("due_date");

-- CreateIndex
CREATE INDEX "idx_tasks_done" ON "tasks"("done");
