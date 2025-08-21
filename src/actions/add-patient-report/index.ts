"use server";

import { db } from "@/db";
import { patientReportsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";
import { addPatientReportSchema } from "./schema";

export const addPatientReport = protectedWithClinicActionClient
  .schema(addPatientReportSchema)
  .action(async ({ parsedInput, ctx }) => {
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
