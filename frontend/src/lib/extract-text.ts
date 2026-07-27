import { extractText, getDocumentProxy } from "unpdf";

const SUPPORTED_EXTENSIONS = ["pdf", "txt", "md"] as const;

export type SupportedSourceExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^./]+)$/);
  return match ? match[1].toLowerCase() : "";
}

export function isSupportedSourceExtension(
  ext: string
): ext is SupportedSourceExtension {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}

export async function extractSourceText(
  buffer: Buffer,
  ext: SupportedSourceExtension
): Promise<string> {
  if (ext === "pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
  return buffer.toString("utf-8");
}
