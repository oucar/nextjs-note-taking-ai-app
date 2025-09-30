/*
  Warnings:

  - You are about to drop the `Analysis` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,id]` on the table `JournalEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."JOURNAL_ENTRY_STATUS" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "public"."Analysis" DROP CONSTRAINT "Analysis_entryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JournalEntry" DROP CONSTRAINT "JournalEntry_userId_fkey";

-- DropIndex
DROP INDEX "public"."JournalEntry_userId_idx";

-- AlterTable
ALTER TABLE "public"."JournalEntry" ADD COLUMN     "status" "public"."JOURNAL_ENTRY_STATUS" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "name" TEXT;

-- DropTable
DROP TABLE "public"."Analysis";

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntryAnalysis" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "negative" BOOLEAN NOT NULL,
    "summary" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#0101fe',
    "sentimentScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EntryAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "public"."Account"("userId");

-- CreateIndex
CREATE INDEX "EntryAnalysis_userId_idx" ON "public"."EntryAnalysis"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EntryAnalysis_entryId_key" ON "public"."EntryAnalysis"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_userId_id_key" ON "public"."JournalEntry"("userId", "id");
