/*
  Warnings:

  - You are about to drop the column `careGuideTypeId` on the `care_guide` table. All the data in the column will be lost.
  - You are about to drop the `CareGuideType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `care_guide_type_id` to the `care_guide` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "care_guide" DROP CONSTRAINT "care_guide_careGuideTypeId_fkey";

-- AlterTable
ALTER TABLE "care_guide" DROP COLUMN "careGuideTypeId",
ADD COLUMN     "care_guide_type_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "CareGuideType";

-- CreateTable
CREATE TABLE "care_guide_type" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "care_guide_type_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "care_guide" ADD CONSTRAINT "care_guide_care_guide_type_id_fkey" FOREIGN KEY ("care_guide_type_id") REFERENCES "care_guide_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
