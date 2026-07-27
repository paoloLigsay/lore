/*
  Warnings:

  - You are about to drop the `SourceChunk` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_noteId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_loreId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_noteId_fkey";

-- DropForeignKey
ALTER TABLE "Source" DROP CONSTRAINT "Source_loreId_fkey";

-- DropForeignKey
ALTER TABLE "SourceChunk" DROP CONSTRAINT "SourceChunk_sourceId_fkey";

-- AlterTable
ALTER TABLE "Source" ADD COLUMN     "content" TEXT,
ADD COLUMN     "fileExt" TEXT;

-- DropTable
DROP TABLE "SourceChunk";

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_loreId_fkey" FOREIGN KEY ("loreId") REFERENCES "Lore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_loreId_fkey" FOREIGN KEY ("loreId") REFERENCES "Lore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
