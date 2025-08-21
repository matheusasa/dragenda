"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { patientReportsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const viewReportSchema = z.object({
  reportId: z.string().min(1, "ID do relatório é obrigatório"),
});

export const logReportView = protectedWithClinicActionClient
  .schema(viewReportSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Verificar se o relatório existe e se o usuário tem permissão de visualizá-lo
    const report = await db.query.patientReportsTable.findFirst({
      where: eq(patientReportsTable.id, parsedInput.reportId),
    });

    if (!report) {
      throw new Error("Relatório não encontrado.");
    }

    // Apenas o profissional que criou o relatório ou admins podem visualizá-lo
    if (report.professionalId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new Error("Você não tem permissão para visualizar este relatório.");
    }

    await createAuditLog({
      reportId: parsedInput.reportId,
      userId: ctx.user.id,
      action: "viewed",
    });

    return { success: true };
  });
