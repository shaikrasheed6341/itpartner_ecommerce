-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "deliveryConfirmed" BOOLEAN,
ADD COLUMN     "deliveryConfirmedAt" TIMESTAMP(3);
