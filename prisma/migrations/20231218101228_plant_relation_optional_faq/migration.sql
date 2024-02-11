-- DropForeignKey
ALTER TABLE "faq" DROP CONSTRAINT "faq_plantId_fkey";

-- AlterTable
ALTER TABLE "faq" ALTER COLUMN "plantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "faq" ADD CONSTRAINT "faq_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
