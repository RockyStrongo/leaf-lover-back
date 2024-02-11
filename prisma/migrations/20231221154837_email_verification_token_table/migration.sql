-- CreateTable
CREATE TABLE "email_validation_token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "email_validation_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_validation_token_token_key" ON "email_validation_token"("token");

-- AddForeignKey
ALTER TABLE "email_validation_token" ADD CONSTRAINT "email_validation_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
