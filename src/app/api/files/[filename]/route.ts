import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/lib/auth";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Aguardar os parâmetros
    const { filename } = await params;
    
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Ler o arquivo
    const fileBuffer = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);

    // Determinar tipo MIME baseado na extensão
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
    };

    const mimeType = mimeTypes[ext] || "application/octet-stream";

    // Retornar o arquivo
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": stats.size.toString(),
        "Cache-Control": "private, max-age=31536000", // Cache por 1 ano
      },
    });
  } catch (error) {
    console.error("Erro ao servir arquivo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
