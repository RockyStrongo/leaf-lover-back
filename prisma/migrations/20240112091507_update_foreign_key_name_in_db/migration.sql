/*
  Warnings:

  - You are about to drop the column `actionTypeId` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `userPlantId` on the `Action` table. All the data in the column will be lost.
  - Added the required column `action_type_id` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_plant_id` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_actionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_userPlantId_fkey";

-- AlterTable
ALTER TABLE "Action" DROP COLUMN "actionTypeId",
DROP COLUMN "userPlantId",
ADD COLUMN     "action_type_id" INTEGER NOT NULL,
ADD COLUMN     "user_plant_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_user_plant_id_fkey" FOREIGN KEY ("user_plant_id") REFERENCES "user_plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_action_type_id_fkey" FOREIGN KEY ("action_type_id") REFERENCES "action_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
