"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { reportAttachmentsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";
import { deleteFile } from "@/lib/file-upload.server";
import { createAuditLog } from "@/lib/audit";

const deleteAttachmentSchema = z.object({
  attachmentId: z.string().uuid("ID do anexo inválido"),
});

export const deleteReportAttachment = protectedWithClinicActionClient
  .schema(deleteAttachmentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { attachmentId } = parsedInput;

    // Buscar o anexo com informações do relatório
    const attachment = await db.query.reportAttachmentsTable.findFirst({
      where: eq(reportAttachmentsTable.id, attachmentId),
      with: {
        report: true,
      },
    });

    if (!attachment) {
      throw new Error("Anexo não encontrado.");
    }

    // Verificar permissões
    if (
      attachment.report.professionalId !== ctx.user.id &&
      ctx.user.role !== "admin"
    ) {
      throw new Error("Você não tem permissão para deletar este anexo.");
    }

    // Deletar arquivo físico
    await deleteFile(attachment.fileUrl);

    // Registrar na auditoria antes de deletar
    await createAuditLog({
      reportId: attachment.reportId,
      userId: ctx.user.id,
      action: "attachment_deleted",
      attachmentName: attachment.fileName,
    });

    // Deletar registro do banco
    await db
      .delete(reportAttachmentsTable)
      .where(eq(reportAttachmentsTable.id, attachmentId));

    return { success: true };
  });
