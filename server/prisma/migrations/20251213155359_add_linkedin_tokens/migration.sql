-- AlterTable
ALTER TABLE "User" ADD COLUMN     "linkedinRefreshToken" TEXT,
ADD COLUMN     "linkedinToken" TEXT,
ADD COLUMN     "linkedinTokenExpiresAt" TIMESTAMP(3);
