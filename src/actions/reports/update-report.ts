"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { patientReportsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";
import { createAuditLog } from "@/lib/audit";

const updateReportSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

export const updateReport = protectedWithClinicActionClient
  .schema(updateReportSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, title, content } = parsedInput;

    // Buscar o relatório atual para comparação
    const currentReport = await db.query.patientReportsTable.findFirst({
      where: eq(patientReportsTable.id, id),
    });

    if (!currentReport) {
      throw new Error("Relatório não encontrado.");
    }

    if (currentReport.professionalId !== ctx.user.id) {
      throw new Error("Você não tem permissão para editar este relatório.");
    }

    // Atualizar o relatório
    await db
      .update(patientReportsTable)
      .set({
        title,
        content,
        updatedAt: new Date(),
      })
      .where(eq(patientReportsTable.id, id));

    // Criar log de auditoria para atualização
    await createAuditLog({
      reportId: id,
      userId: ctx.user.id,
      action: "updated",
      previousContent: currentReport.content,
      newContent: content,
      previousTitle: currentReport.title,
      newTitle: title,
    });

    revalidatePath("/reports");

    return { success: true };
  });
