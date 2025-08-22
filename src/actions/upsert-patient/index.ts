"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

import { upsertPatientSchema } from "./schema";

export const upsertPatient = protectedWithClinicActionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Processar data de nascimento se fornecida
    const dateOfBirth = parsedInput.dateOfBirth
      ? new Date(parsedInput.dateOfBirth)
      : null;

    // Limpar e formatar CPF (remover pontos e traços)
    const cleanCpf = parsedInput.cpf
      ? parsedInput.cpf.replace(/[.-]/g, "")
      : null;

    // Limpar e formatar CEP (remover traços)
    const cleanZipCode = parsedInput.zipCode
      ? parsedInput.zipCode.replace(/-/g, "")
      : null;

    await db
      .insert(patientsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: ctx.user.clinic.id,
        cpf: cleanCpf,
        dateOfBirth: dateOfBirth,
        zipCode: cleanZipCode,
      })
      .onConflictDoUpdate({
        target: [patientsTable.id],
        set: {
          ...parsedInput,
          cpf: cleanCpf,
          dateOfBirth: dateOfBirth,
          zipCode: cleanZipCode,
        },
      });
    revalidatePath("/patients");
  });
