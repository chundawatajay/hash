/*
  Warnings:

  - You are about to drop the column `isAssigned` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "isAssigned",
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;
