"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { usersTables, usersToClinicsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

export const deleteUser = protectedWithClinicActionClient
  .schema(
    z.object({
      userId: z.string(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const { userId } = parsedInput;

    // Verificar se o usuário pertence à mesma clínica
    const userClinicLink = await db.query.usersToClinicsTable.findFirst({
      where: and(
        eq(usersToClinicsTable.userId, userId),
        eq(usersToClinicsTable.clinicId, ctx.user.clinic.id)
      ),
    });

    if (!userClinicLink) {
      throw new Error("Usuário não encontrado ou não pertence à sua clínica");
    }

    // Não permitir deletar o próprio usuário
    if (userId === ctx.user.id) {
      throw new Error("Você não pode deletar sua própria conta");
    }

    // Deletar vínculo com a clínica
    await db
      .delete(usersToClinicsTable)
      .where(
        and(
          eq(usersToClinicsTable.userId, userId),
          eq(usersToClinicsTable.clinicId, ctx.user.clinic.id)
        )
      );

    revalidatePath("/iam");
  });
