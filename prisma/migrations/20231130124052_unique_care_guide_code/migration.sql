/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `care_guide_type` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "care_guide_type_code_key" ON "care_guide_type"("code");
