/*
  Warnings:

  - Added the required column `care_level` to the `plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cuisine` to the `plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_id` to the `plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flowers` to the `plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poisonous_to_humans` to the `plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poisonous_to_pets` to the `plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `watering` to the `plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `watering_general_benchmark_unit` to the `plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `watering_general_benchmark_value` to the `plant` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `acquisition_date` on the `user_plant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "plant" ADD COLUMN     "care_level" TEXT NOT NULL,
ADD COLUMN     "cuisine" BOOLEAN NOT NULL,
ADD COLUMN     "default_image_regular" TEXT,
ADD COLUMN     "default_image_thumbnail" TEXT,
ADD COLUMN     "external_id" INTEGER NOT NULL,
ADD COLUMN     "flowers" TEXT NOT NULL,
ADD COLUMN     "poisonous_to_humans" BOOLEAN NOT NULL,
ADD COLUMN     "poisonous_to_pets" BOOLEAN NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "watering" TEXT NOT NULL,
ADD COLUMN     "watering_general_benchmark_unit" BOOLEAN NOT NULL,
ADD COLUMN     "watering_general_benchmark_value" BOOLEAN NOT NULL,
ALTER COLUMN "common_name" SET DATA TYPE TEXT,
ALTER COLUMN "scientific_name" SET DATA TYPE TEXT,
ALTER COLUMN "description" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user_plant" ADD COLUMN     "gifted_by" TEXT,
ADD COLUMN     "notes" TEXT,
DROP COLUMN "acquisition_date",
ADD COLUMN     "acquisition_date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "nickname" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "faq" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_guide" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "care_guide_pkey" PRIMARY KEY ("id")
);
