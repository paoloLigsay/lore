// Run only via `npx tsx e2e/seed-cli.ts <seed|cleanup> <jsonArgs>` — kept as
// a standalone tsx-executed script (not imported by any Playwright spec)
// because the generated Prisma client is ESM (`import.meta`) and Playwright's
// own CJS test transform can't load it directly.
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma";

async function seed(args: {
  userId: string;
  email: string;
  noteBefore: string;
  noteAfter: string;
}) {
  await prisma.user.upsert({
    where: { id: args.userId },
    update: {},
    create: { id: args.userId, email: args.email },
  });

  const lore = await prisma.lore.create({
    data: { id: randomUUID(), userId: args.userId, title: "E2E accept/reject test lore" },
  });

  const note = await prisma.note.create({
    data: { loreId: lore.id, title: "E2E test note", content: args.noteBefore },
  });

  const chat = await prisma.chat.create({
    data: { loreId: lore.id, title: "E2E test chat" },
  });

  const message = await prisma.chatMessage.create({
    data: { chatId: chat.id, role: "ASSISTANT", content: "Here's a suggested edit." },
  });

  await prisma.proposal.create({
    data: {
      noteId: note.id,
      chatMessageId: message.id,
      agent: "RAG",
      diffBefore: args.noteBefore,
      diffAfter: args.noteAfter,
      explanation: "E2E test proposal",
      status: "PENDING",
    },
  });

  return { loreId: lore.id, noteId: note.id };
}

async function cleanup(loreId: string) {
  await prisma.lore.delete({ where: { id: loreId } });
}

async function main() {
  const [command, payload] = process.argv.slice(2);

  if (command === "seed") {
    const result = await seed(JSON.parse(payload));
    process.stdout.write(JSON.stringify(result));
  } else if (command === "cleanup") {
    await cleanup(payload);
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
