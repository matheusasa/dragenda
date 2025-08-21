"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { appointmentsTable, usersToClinicsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

export const getUserAppointments = protectedWithClinicActionClient.action(
  async ({ ctx }) => {
    // Verificar se o usuário é psicólogo
    const userClinicLink = await db.query.usersToClinicsTable.findFirst({
      where: and(
        eq(usersToClinicsTable.userId, ctx.user.id),
        eq(usersToClinicsTable.clinicId, ctx.user.clinic.id)
      ),
    });

    if (
      !userClinicLink ||
      (userClinicLink.role !== "psicologo" && userClinicLink.role !== "admin")
    ) {
      throw new Error("Usuário não é um psicólogo");
    }

    // Buscar appointments onde o usuário é o profissional responsável
    const appointments = await db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.professionalId, ctx.user.id),
      with: {
        patient: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (appointments, { desc }) => [desc(appointments.date)],
    });

    // Mapear para o formato esperado pelo frontend
    return appointments.map((appointment) => ({
      id: appointment.id,
      date: appointment.date,
      patient: {
        id: appointment.patient.id,
        name: appointment.patient.name,
      },
    }));
  }
);
