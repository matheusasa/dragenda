"use server";
import { z } from "zod";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";
import { upsertProfessionalProfile } from "./upsert-professional-profile.server";

export const upsertProfessionalProfileAction = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().optional(),
      userId: z.string().optional(),
      specialty: z.string(),
      appointmentPriceInCents: z.number(),
      availableFromWeekDay: z.number(),
      availableToWeekDay: z.number(),
      availableFromTime: z.string(),
      availableToTime: z.string(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    // Definir userId: usar valor do input ou do usuário autenticado
    const userId = parsedInput.userId ?? ctx.user.id;
    return upsertProfessionalProfile({
      id: parsedInput.id,
      userId,
      clinicId: ctx.user.clinic.id,
      specialty: parsedInput.specialty,
      appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      availableFromWeekDay: parsedInput.availableFromWeekDay,
      availableToWeekDay: parsedInput.availableToWeekDay,
      availableFromTime: parsedInput.availableFromTime,
      availableToTime: parsedInput.availableToTime,
    });
  });
