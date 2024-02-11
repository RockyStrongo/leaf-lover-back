/*
  Warnings:

  - You are about to drop the `Plant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPlant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPlant" DROP CONSTRAINT "UserPlant_plantId_fkey";

-- DropTable
DROP TABLE "Plant";

-- DropTable
DROP TABLE "UserPlant";

-- CreateTable
CREATE TABLE "plant" (
    "id" SERIAL NOT NULL,
    "common_name" VARCHAR NOT NULL,
    "scientific_name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,

    CONSTRAINT "plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_plant" (
    "id" SERIAL NOT NULL,
    "acquisition_date" VARCHAR NOT NULL,
    "nickname" VARCHAR,
    "plant_id" INTEGER NOT NULL,

    CONSTRAINT "user_plant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_plant" ADD CONSTRAINT "user_plant_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
