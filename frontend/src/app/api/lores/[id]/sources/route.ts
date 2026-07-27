import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createStorageAdminClient, SOURCES_BUCKET } from "@/lib/supabase/storage";
import {
  extractSourceText,
  getFileExtension,
  isSupportedSourceExtension,
} from "@/lib/extract-text";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: loreId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const lore = await prisma.lore.findUnique({ where: { id: loreId } });

  if (!lore) {
    return NextResponse.json({ error: "Lore not found" }, { status: 404 });
  }

  if (lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this lore" },
      { status: 403 }
    );
  }

  // content excluded — it's only needed server-side for agent prompts, not
  // for rendering the sources list.
  const sources = await prisma.source.findMany({
    where: { loreId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      loreId: true,
      type: true,
      title: true,
      url: true,
      storagePath: true,
      fileExt: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ sources });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: loreId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const lore = await prisma.lore.findUnique({ where: { id: loreId } });

  if (!lore) {
    return NextResponse.json({ error: "Lore not found" }, { status: 404 });
  }

  if (lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this lore" },
      { status: 403 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const ext = getFileExtension(file.name);
  if (!isSupportedSourceExtension(ext)) {
    return NextResponse.json(
      { error: "Unsupported file type — upload a PDF, .txt, or .md file" },
      { status: 400 }
    );
  }

  // This is a blocking (non-optimistic) upload — content/status aren't known
  // until the file is stored and parsed, so there's no client-rendered row
  // to reconcile against. The id only needs to exist before the Storage
  // upload so the object path can reference it.
  const id = crypto.randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${loreId}/${id}.${ext}`;

  const storage = createStorageAdminClient();
  const { error: uploadError } = await storage.storage
    .from(SOURCES_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Failed to store file" },
      { status: 500 }
    );
  }

  const title = file.name.replace(/\.[^./]+$/, "") || file.name;

  let content: string | null = null;
  let status: "READY" | "FAILED" = "READY";
  try {
    content = await extractSourceText(buffer, ext);
  } catch {
    status = "FAILED";
  }

  const source = await prisma.source.create({
    data: {
      id,
      loreId,
      type: "FILE",
      title,
      storagePath,
      fileExt: ext,
      content,
      status,
    },
    select: {
      id: true,
      loreId: true,
      type: true,
      title: true,
      url: true,
      storagePath: true,
      fileExt: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(source, { status: 201 });
}
