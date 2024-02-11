-- CreateTable
CREATE TABLE "action_type" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "action_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "done" BOOLEAN NOT NULL,
    "done_date" TIMESTAMP(3),
    "userPlantId" INTEGER NOT NULL,
    "actionTypeId" INTEGER NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "action_type_code_key" ON "action_type"("code");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_userPlantId_fkey" FOREIGN KEY ("userPlantId") REFERENCES "user_plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_actionTypeId_fkey" FOREIGN KEY ("actionTypeId") REFERENCES "action_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
