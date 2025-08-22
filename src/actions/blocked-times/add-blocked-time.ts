"use server";

import { z } from "zod";
import { db } from "@/db";
import { blockedTimesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

const addBlockedTimeSchema = z.object({
  professionalId: z.string().min(1, "Profissional é obrigatório"),
  date: z.string().date("Data inválida"),
  timeFrom: z.string().regex(/^\d{2}:\d{2}$/, "Horário de início inválido"),
  timeTo: z.string().regex(/^\d{2}:\d{2}$/, "Horário de fim inválido"),
  reason: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringDays: z.array(z.number().min(0).max(6)).optional(), // Array de dias da semana (0-6)
});

export const addBlockedTime = protectedWithClinicActionClient
  .schema(addBlockedTimeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const clinicId = ctx.user.clinic!.id;

    // Validar se o horário de fim é maior que o de início
    const timeFromMinutes =
      parseInt(parsedInput.timeFrom.split(":")[0]) * 60 +
      parseInt(parsedInput.timeFrom.split(":")[1]);
    const timeToMinutes =
      parseInt(parsedInput.timeTo.split(":")[0]) * 60 +
      parseInt(parsedInput.timeTo.split(":")[1]);

    if (timeToMinutes <= timeFromMinutes) {
      throw new Error("Horário de fim deve ser maior que o horário de início");
    }

    const blockedTime = await db
      .insert(blockedTimesTable)
      .values({
        professionalId: parsedInput.professionalId,
        clinicId,
        date: new Date(parsedInput.date),
        timeFrom: `${parsedInput.timeFrom}:00`,
        timeTo: `${parsedInput.timeTo}:00`,
        reason: parsedInput.reason,
        isRecurring: parsedInput.isRecurring,
        recurringDays: parsedInput.recurringDays
          ? JSON.stringify(parsedInput.recurringDays)
          : null,
      })
      .returning();

    return blockedTime[0];
  });
