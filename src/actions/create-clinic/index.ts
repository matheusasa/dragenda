"use server";

import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const createClinic = async (name: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado.");
  }

  try {
    const [clinic] = await db
      .insert(clinicsTable)
      .values({
        name,
      })
      .returning();

    if (!clinic?.id) {
      throw new Error("Erro ao criar clínica - ID não retornado.");
    }

    await db.insert(usersToClinicsTable).values({
      userId: session.user.id,
      clinicId: clinic.id,
      role: "admin", // Quem cria a clínica é admin
    });
  } catch (error) {
    console.error("Erro ao criar clínica:", error);
    throw new Error("Erro interno do servidor ao criar clínica.");
  }
};
