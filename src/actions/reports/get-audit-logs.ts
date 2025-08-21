"use server";

import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";
import { getAuditLogs } from "@/lib/audit";
import { z } from "zod";

const getAuditLogsSchema = z.object({
  reportId: z.string().min(1, "ID do relatório é obrigatório"),
});

export const getReportAuditLogs = protectedWithClinicActionClient
  .schema(getAuditLogsSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Verificar se o usuário é admin
    if (ctx.user.role !== "admin") {
      throw new Error(
        "Acesso negado. Apenas administradores podem visualizar logs de auditoria."
      );
    }

    const auditLogs = await getAuditLogs(parsedInput.reportId);

    return auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      user: {
        name: log.user.name,
        email: log.user.email,
      },
      previousContent: log.previousContent,
      newContent: log.newContent,
      previousTitle: log.previousTitle,
      newTitle: log.newTitle,
      userAgent: log.userAgent,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
    }));
  });
