"use server";

import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  appointmentsTable,
  usersToClinicsTable,
  patientReportsTable,
  patientsTable,
} from "@/db/schema";
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
    // e que ainda não possuem relatórios
    const appointments = await db
      .select({
        id: appointmentsTable.id,
        date: appointmentsTable.date,
        patient: {
          id: patientsTable.id,
          name: patientsTable.name,
        },
      })
      .from(appointmentsTable)
      .innerJoin(
        patientsTable,
        eq(appointmentsTable.patientId, patientsTable.id)
      )
      .leftJoin(
        patientReportsTable,
        eq(appointmentsTable.id, patientReportsTable.appointmentId)
      )
      .where(
        and(
          eq(appointmentsTable.professionalId, ctx.user.id),
          isNull(patientReportsTable.appointmentId) // Apenas consultas sem relatórios
        )
      )
      .orderBy(appointmentsTable.date);

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
