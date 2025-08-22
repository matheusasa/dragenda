"use server";

import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { blockedTimesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

export const deleteBlockedTime = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().min(1, "ID é obrigatório"),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const clinicId = ctx.user.clinic!.id;

    // Verificar se o horário bloqueado pertence à clínica
    const blockedTime = await db.query.blockedTimesTable.findFirst({
      where: and(
        eq(blockedTimesTable.id, parsedInput.id),
        eq(blockedTimesTable.clinicId, clinicId)
      ),
    });

    if (!blockedTime) {
      throw new Error("Horário bloqueado não encontrado");
    }

    await db
      .delete(blockedTimesTable)
      .where(eq(blockedTimesTable.id, parsedInput.id));

    return { success: true };
  });
