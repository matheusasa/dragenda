"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { patientReportsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

const deleteReportSchema = z.object({
  id: z.string().uuid(),
});

export const deleteReport = protectedWithClinicActionClient
  .schema(deleteReportSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;

    // Verificar se o relatório pertence ao usuário logado
    const report = await db.query.patientReportsTable.findFirst({
      where: eq(patientReportsTable.id, id),
    });

    if (!report) {
      throw new Error("Relatório não encontrado.");
    }

    if (report.professionalId !== ctx.user.id) {
      throw new Error("Você não tem permissão para deletar este relatório.");
    }

    await db.delete(patientReportsTable).where(eq(patientReportsTable.id, id));

    revalidatePath("/reports");
  });
