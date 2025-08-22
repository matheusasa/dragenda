import { protectedActionClient } from "@/lib/next-safe-action.server";
import { z } from "zod";
import { db } from "@/db";
import { reportAttachmentsTable } from "@/db/schema";

const addAttachmentSchema = z.object({
  reportId: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  uploadedBy: z.string(),
});

export const addAttachment = protectedActionClient
  .schema(addAttachmentSchema)
  .action(async ({ parsedInput: data }) => {
    try {
      const [attachment] = await db
        .insert(reportAttachmentsTable)
        .values({
          reportId: data.reportId,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          uploadedBy: data.uploadedBy,
        })
        .returning();

      return {
        success: true,
        data: attachment,
      };
    } catch (error) {
      console.error("Erro ao adicionar anexo:", error);
      return {
        success: false,
        error: "Erro ao salvar anexo no banco de dados",
      };
    }
  });
