/*
  Warnings:

  - Changed the type of `flowers` on the `plant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "plant" DROP COLUMN "flowers",
ADD COLUMN     "flowers" BOOLEAN NOT NULL;
