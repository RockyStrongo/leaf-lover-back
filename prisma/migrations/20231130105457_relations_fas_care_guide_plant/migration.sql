/*
  Warnings:

  - Added the required column `plantId` to the `care_guide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plantId` to the `faq` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "care_guide" ADD COLUMN     "plantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "faq" ADD COLUMN     "plantId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "faq" ADD CONSTRAINT "faq_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_guide" ADD CONSTRAINT "care_guide_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
