import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/file-upload.server";
import { db } from "@/db";
import { reportAttachmentsTable } from "@/db/schema";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter dados do formulário
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const reportId = formData.get("reportId") as string;

    if (!file || !reportId) {
      return NextResponse.json(
        { error: "Arquivo e ID do relatório são obrigatórios" },
        { status: 400 }
      );
    }

    // Validações básicas
    if (file.size === 0) {
      return NextResponse.json(
        { error: "Arquivo está vazio" },
        { status: 400 }
      );
    }

    // Fazer upload do arquivo
    const uploadResult = await uploadFile(file);

    // Salvar no banco de dados
    const [attachment] = await db
      .insert(reportAttachmentsTable)
      .values({
        reportId: reportId,
        fileName: file.name,
        fileUrl: uploadResult.fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: session.user.id,
      })
      .returning();

    // Registrar na auditoria
    await createAuditLog({
      reportId: reportId,
      userId: session.user.id,
      action: "attachment_added",
      attachmentName: file.name,
      attachmentSize: file.size,
    });

    return NextResponse.json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    console.error("Erro no upload:", error);

    if (error instanceof Error && error.name === "FileUploadError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
