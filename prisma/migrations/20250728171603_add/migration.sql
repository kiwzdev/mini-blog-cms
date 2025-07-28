/*
  Warnings:

  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "category" TEXT;

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "VerificationEmailToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationEmailToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationEmailToken_token_key" ON "VerificationEmailToken"("token");

-- CreateIndex
CREATE INDEX "VerificationEmailToken_email_idx" ON "VerificationEmailToken"("email");

-- CreateIndex
CREATE INDEX "VerificationEmailToken_token_idx" ON "VerificationEmailToken"("token");

-- CreateIndex
CREATE INDEX "VerificationEmailToken_expires_idx" ON "VerificationEmailToken"("expires");

-- CreateIndex
CREATE INDEX "VerificationEmailToken_email_expires_idx" ON "VerificationEmailToken"("email", "expires");
