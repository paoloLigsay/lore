-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "noteTitle" TEXT,
ALTER COLUMN "noteId" DROP NOT NULL;
