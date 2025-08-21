"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { usersTables, usersToClinicsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

const inviteUserSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "recepcao", "psicologo"]),
});

export const inviteUser = protectedWithClinicActionClient
  .schema(inviteUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { email, role } = parsedInput;

    // Verificar se o usuário existe
    const existingUser = await db.query.usersTables.findFirst({
      where: eq(usersTables.email, email),
    });

    if (!existingUser) {
      throw new Error(
        "Usuário não encontrado. O usuário deve se cadastrar primeiro no sistema."
      );
    }

    // Verificar se já existe vínculo com a clínica
    const existingLink = await db.query.usersToClinicsTable.findFirst({
      where: eq(usersToClinicsTable.userId, existingUser.id),
    });

    if (existingLink) {
      if (existingLink.clinicId === ctx.user.clinic.id) {
        throw new Error("Usuário já está vinculado a esta clínica.");
      } else {
        throw new Error("Usuário já está vinculado a outra clínica.");
      }
    }

    // Criar vínculo
    await db.insert(usersToClinicsTable).values({
      userId: existingUser.id,
      clinicId: ctx.user.clinic.id,
      role,
    });

    revalidatePath("/iam");
  });
