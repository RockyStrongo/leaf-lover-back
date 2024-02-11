/*
  Warnings:

  - Added the required column `careGuideTypeId` to the `care_guide` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "care_guide" ADD COLUMN     "careGuideTypeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CareGuideType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "CareGuideType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "care_guide" ADD CONSTRAINT "care_guide_careGuideTypeId_fkey" FOREIGN KEY ("careGuideTypeId") REFERENCES "CareGuideType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
