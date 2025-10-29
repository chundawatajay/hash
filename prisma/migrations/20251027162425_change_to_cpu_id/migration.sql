/*
  Warnings:

  - You are about to drop the column `value` on the `Token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cup_id]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cup_id` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "value",
ADD COLUMN     "cup_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Token_cup_id_key" ON "Token"("cup_id");
