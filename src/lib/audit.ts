"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { reportAuditLogsTable } from "@/db/schema";

interface AuditLogData {
  reportId: string;
  userId: string;
  action: "created" | "updated" | "viewed";
  previousContent?: string;
  newContent?: string;
  previousTitle?: string;
  newTitle?: string;
}

export async function createAuditLog(data: AuditLogData) {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "Unknown";
  const xForwardedFor = headersList.get("x-forwarded-for");
  const xRealIp = headersList.get("x-real-ip");

  // Tentar obter o IP real do usuário
  const ipAddress = xForwardedFor
    ? xForwardedFor.split(",")[0].trim()
    : xRealIp || "Unknown";

  try {
    await db.insert(reportAuditLogsTable).values({
      reportId: data.reportId,
      userId: data.userId,
      action: data.action,
      previousContent: data.previousContent,
      newContent: data.newContent,
      previousTitle: data.previousTitle,
      newTitle: data.newTitle,
      userAgent,
      ipAddress,
    });
  } catch (error) {
    console.error("Erro ao criar log de auditoria:", error);
    // Não falhar a operação principal se o log de auditoria falhar
  }
}

export async function getAuditLogs(reportId: string) {
  return await db.query.reportAuditLogsTable.findMany({
    where: (logs, { eq }) => eq(logs.reportId, reportId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
  });
}
