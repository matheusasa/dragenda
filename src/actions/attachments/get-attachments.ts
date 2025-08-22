"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { reportAttachmentsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

const getAttachmentsSchema = z.object({
  reportId: z.string().uuid("ID do relatório inválido"),
});

export const getReportAttachments = protectedWithClinicActionClient
  .schema(getAttachmentsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { reportId } = parsedInput;

    // Buscar anexos do relatório
    const attachments = await db.query.reportAttachmentsTable.findMany({
      where: eq(reportAttachmentsTable.reportId, reportId),
      with: {
        uploadedByUser: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (attachments, { desc }) => [desc(attachments.createdAt)],
    });

    return attachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      fileUrl: attachment.fileUrl,
      uploadedBy: attachment.uploadedByUser,
      createdAt: attachment.createdAt,
    }));
  });
