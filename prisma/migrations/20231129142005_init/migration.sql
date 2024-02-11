-- CreateTable
CREATE TABLE "Plant" (
    "id" SERIAL NOT NULL,
    "commonName" VARCHAR NOT NULL,
    "scientificName" VARCHAR NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlant" (
    "id" SERIAL NOT NULL,
    "acquisitionDate" VARCHAR NOT NULL,
    "nickname" VARCHAR,
    "plantId" INTEGER NOT NULL,

    CONSTRAINT "UserPlant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserPlant" ADD CONSTRAINT "UserPlant_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
