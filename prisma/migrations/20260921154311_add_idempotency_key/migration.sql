/*
  Warnings:

  - A unique constraint covering the columns `[idempotency_key]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "idempotency_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_idempotency_key_key" ON "Booking"("idempotency_key");
