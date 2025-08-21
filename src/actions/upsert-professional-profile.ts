"use server";
import { professionalProfilesTable } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function upsertProfessionalProfile(input: {
  id?: string;
  userId: string;
  clinicId: string;
  specialty: string;
  appointmentPriceInCents: number;
  availableFromWeekDay: number;
  availableToWeekDay: number;
  availableFromTime: string;
  availableToTime: string;
}) {
  if (input.id) {
    // Atualiza
    await db
      .update(professionalProfilesTable)
      .set({
        specialty: input.specialty,
        appointmentPriceInCents: input.appointmentPriceInCents,
        availableFromWeekDay: input.availableFromWeekDay,
        availableToWeekDay: input.availableToWeekDay,
        availableFromTime: input.availableFromTime,
        availableToTime: input.availableToTime,
      })
      .where(eq(professionalProfilesTable.id, input.id));
    return { updated: true };
  } else {
    // Cria
    await db.insert(professionalProfilesTable).values({
      userId: input.userId,
      clinicId: input.clinicId,
      specialty: input.specialty,
      appointmentPriceInCents: input.appointmentPriceInCents,
      availableFromWeekDay: input.availableFromWeekDay,
      availableToWeekDay: input.availableToWeekDay,
      availableFromTime: input.availableFromTime,
      availableToTime: input.availableToTime,
    });
    return { created: true };
  }
}
