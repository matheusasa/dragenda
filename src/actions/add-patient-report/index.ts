"use server";

import { db } from "@/db";
import { patientReportsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";
import { addPatientReportSchema } from "./schema";
import { eq } from "drizzle-orm";

export const addPatientReport = protectedWithClinicActionClient
  .schema(addPatientReportSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Verificar se já existe um relatório para esta consulta
    const existingReport = await db
      .select({ id: patientReportsTable.id })
      .from(patientReportsTable)
      .where(eq(patientReportsTable.appointmentId, parsedInput.appointmentId))
      .limit(1);

    if (existingReport.length > 0) {
      throw new Error(
        "Já existe um relatório para esta consulta. Cada consulta pode ter apenas um relatório."
      );
    }

    const [report] = await db
      .insert(patientReportsTable)
      .values({
        ...parsedInput,
        professionalId: ctx.user.id, // Usar o ID do usuário logado
      })
      .returning();

    // Criar log de auditoria para criação
    await createAuditLog({
      reportId: report.id,
      userId: ctx.user.id,
      action: "created",
      newContent: parsedInput.content,
      newTitle: parsedInput.title,
    });

    revalidatePath("/reports");
    revalidatePath("/appointments");

    return { reportId: report.id };
  });
