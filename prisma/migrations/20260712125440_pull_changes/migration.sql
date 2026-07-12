-- CreateEnum
CREATE TYPE "order_state" AS ENUM ('appointment', 'contract', 'in_production', 'ready_to_delivery', 'completed');

-- CreateEnum
CREATE TYPE "worker_payment_type" AS ENUM ('hourly', 'per_meter');

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "quantity" INTEGER DEFAULT 1,
    "unit" VARCHAR(20),
    "notes" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(6),

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_notes" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "remaining_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "address" VARCHAR(255),
    "address_notes" TEXT,
    "longitude" DECIMAL(10,7),
    "latitude" DECIMAL(10,7),
    "lift_cost" DECIMAL(10,2) DEFAULT 0,
    "floor" INTEGER,
    "truck_distance_km" DECIMAL(10,2),
    "delivered_at" TIMESTAMP(6),

    CONSTRAINT "delivery_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" VARCHAR(20) NOT NULL,
    "length_cm" DECIMAL(10,2),
    "width_cm" DECIMAL(10,2),
    "height_cm" DECIMAL(10,2),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_photos" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "photo_url" VARCHAR(500) NOT NULL,
    "description" VARCHAR(255),
    "uploaded_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "worker_id" INTEGER,
    "project_name" VARCHAR(255),
    "total_amount" DECIMAL(10,2),
    "due_date" DATE,
    "state" "order_state" NOT NULL DEFAULT 'appointment',
    "address" VARCHAR(255),
    "address_notes" TEXT,
    "longitude" DECIMAL(10,7),
    "latitude" DECIMAL(10,7),
    "lift_cost" DECIMAL(10,2) DEFAULT 0,
    "is_fully_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "note" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_trips" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "trip_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "kilometers" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "vehicle_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "plate_number" VARCHAR(20) NOT NULL,
    "total_kilometers" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "hire_date" DATE,
    "payment_type" "worker_payment_type" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_checklist_items_order_id" ON "checklist_items"("order_id");

-- CreateIndex
CREATE INDEX "idx_delivery_notes_order_id" ON "delivery_notes"("order_id");

-- CreateIndex
CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "idx_order_photos_order_id" ON "order_photos"("order_id");

-- CreateIndex
CREATE INDEX "idx_orders_client_id" ON "orders"("client_id");

-- CreateIndex
CREATE INDEX "idx_orders_state" ON "orders"("state");

-- CreateIndex
CREATE INDEX "idx_orders_worker_id" ON "orders"("worker_id");

-- CreateIndex
CREATE INDEX "idx_payments_order_id" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "idx_vehicle_trips_order_id" ON "vehicle_trips"("order_id");

-- CreateIndex
CREATE INDEX "idx_vehicle_trips_vehicle_id" ON "vehicle_trips"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicle_trips" ADD CONSTRAINT "vehicle_trips_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicle_trips" ADD CONSTRAINT "vehicle_trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
