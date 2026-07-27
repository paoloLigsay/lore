-- AlterEnum
BEGIN;
CREATE TYPE "AgentType_new" AS ENUM ('RAG', 'WEB');
ALTER TABLE "Proposal" ALTER COLUMN "agent" TYPE "AgentType_new" USING ("agent"::text::"AgentType_new");
ALTER TYPE "AgentType" RENAME TO "AgentType_old";
ALTER TYPE "AgentType_new" RENAME TO "AgentType";
DROP TYPE "public"."AgentType_old";
COMMIT;
