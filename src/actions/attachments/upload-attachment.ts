"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { reportAttachmentsTable, patientReportsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";
import { uploadFile, FileUploadError } from "@/lib/file-upload";

const uploadAttachmentSchema = z.object({
  reportId: z.string().uuid("ID do relatório inválido"),
});

export const uploadReportAttachment = protectedWithClinicActionClient
  .schema(uploadAttachmentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { reportId } = parsedInput;

    // Verificar se o relatório existe e se o usuário tem permissão
    const report = await db.query.patientReportsTable.findFirst({
      where: eq(patientReportsTable.id, reportId),
    });

    if (!report) {
      throw new Error("Relatório não encontrado.");
    }

    // Apenas o profissional que criou o relatório ou admins podem adicionar anexos
    if (report.professionalId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new Error(
        "Você não tem permissão para adicionar anexos a este relatório."
      );
    }

    return { reportId, canUpload: true };
  });

// Action para processar o upload após validação
const processUploadSchema = z.object({
  reportId: z.string().uuid(),
  file: z.any(), // FormData será processado pelo cliente
});

export const processAttachmentUpload = protectedWithClinicActionClient
  .schema(
    z.object({
      reportId: z.string().uuid(),
      fileName: z.string(),
      fileSize: z.number(),
      mimeType: z.string(),
      fileUrl: z.string(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const { reportId, fileName, fileSize, mimeType, fileUrl } = parsedInput;

    // Verificar novamente se o relatório existe e permissões
    const report = await db.query.patientReportsTable.findFirst({
      where: eq(patientReportsTable.id, reportId),
    });

    if (!report) {
      throw new Error("Relatório não encontrado.");
    }

    if (report.professionalId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new Error(
        "Você não tem permissão para adicionar anexos a este relatório."
      );
    }

    // Salvar anexo no banco
    const [attachment] = await db
      .insert(reportAttachmentsTable)
      .values({
        reportId,
        fileName,
        fileSize,
        mimeType,
        fileUrl,
        uploadedBy: ctx.user.id,
      })
      .returning();

    return attachment;
  });
