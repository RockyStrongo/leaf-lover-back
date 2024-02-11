/*
  Warnings:

  - Changed the type of `watering_general_benchmark_value` on the `plant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "plant" ALTER COLUMN "watering_general_benchmark_unit" SET DATA TYPE TEXT,
DROP COLUMN "watering_general_benchmark_value",
ADD COLUMN     "watering_general_benchmark_value" INTEGER NOT NULL;
