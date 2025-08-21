"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

const updateRoleSchema = z.object({
  userId: z.string(),
  clinicId: z.string().uuid(),
  role: z.enum(["admin", "recepcao", "psicologo"]),
});

export const updateUserRole = protectedWithClinicActionClient
  .schema(updateRoleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId, clinicId, role } = parsedInput;

    // Verificar se a clínica é a mesma do usuário logado
    if (clinicId !== ctx.user.clinic.id) {
      throw new Error(
        "Você não tem permissão para alterar papéis nesta clínica"
      );
    }

    await db
      .update(usersToClinicsTable)
      .set({ role })
      .where(
        and(
          eq(usersToClinicsTable.userId, userId),
          eq(usersToClinicsTable.clinicId, clinicId)
        )
      );

    revalidatePath("/iam");
  });
