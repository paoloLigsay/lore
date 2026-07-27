-- CreateIndex
CREATE UNIQUE INDEX "Proposal_chatMessageId_key" ON "Proposal"("chatMessageId");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_chatMessageId_fkey" FOREIGN KEY ("chatMessageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
