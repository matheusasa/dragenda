"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { usersTables } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
});

export const updateUser = protectedWithClinicActionClient
  .schema(updateUserSchema)
  .action(async ({ parsedInput }) => {
    const { id, name, email } = parsedInput;

    // Verificar se email já está em uso por outro usuário
    const existingUser = await db.query.usersTables.findFirst({
      where: eq(usersTables.email, email),
    });

    if (existingUser && existingUser.id !== id) {
      throw new Error("Este email já está sendo usado por outro usuário.");
    }

    // Atualizar usuário
    await db
      .update(usersTables)
      .set({
        name,
        email,
      })
      .where(eq(usersTables.id, id));

    revalidatePath("/iam");
  });
