-- DropIndex
DROP INDEX "public"."Token_cup_id_key";

-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "cup_id" SET DEFAULT '';
