"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { reportAuditLogsTable } from "@/db/schema";

interface AuditLogData {
  reportId: string;
  userId: string;
  action:
    | "created"
    | "updated"
    | "viewed"
    | "attachment_added"
    | "attachment_deleted";
  previousContent?: string;
  newContent?: string;
  previousTitle?: string;
  newTitle?: string;
  attachmentName?: string; // Nome do arquivo para ações de anexo
  attachmentSize?: number; // Tamanho do arquivo para ações de anexo
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
    // Para ações de anexo, incluir informações no conteúdo
    let logContent = data.newContent;
    if (data.action === "attachment_added" && data.attachmentName) {
      logContent = `Anexo adicionado: ${data.attachmentName}${
        data.attachmentSize ? ` (${formatFileSize(data.attachmentSize)})` : ""
      }`;
    } else if (data.action === "attachment_deleted" && data.attachmentName) {
      logContent = `Anexo removido: ${data.attachmentName}`;
    }

    await db.insert(reportAuditLogsTable).values({
      reportId: data.reportId,
      userId: data.userId,
      action: data.action,
      previousContent: data.previousContent,
      newContent: logContent,
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

// Função helper para formatar tamanho de arquivo
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
