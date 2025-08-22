import dayjs from "dayjs";
import { and, count, desc, eq, gte, lte, sql, sum, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  doctorsTable,
  patientsTable,
  usersToClinicsTable,
  professionalProfilesTable,
  usersTables,
} from "@/db/schema";

interface Params {
  from: string;
  to: string;
  session: {
    user: {
      clinic: {
        id: string;
      };
    };
  };
}

export const getDashboard = async ({ from, to, session }: Params) => {
  const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();
  const [
    [totalRevenue],
    [totalAppointments],
    [totalPatients],
    [totalDoctors],
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
  ] = await Promise.all([
    db
      .select({
        total: sum(appointmentsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to))
        )
      ),
    db
      .select({
        total: count(),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to))
        )
      ),
    db
      .select({
        total: count(),
      })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, session.user.clinic.id)),
    // Contar total de profissionais
    db
      .select({
        total: count(),
      })
      .from(usersToClinicsTable)
      .where(
        and(
          eq(usersToClinicsTable.clinicId, session.user.clinic.id),
          inArray(usersToClinicsTable.role, ["psicologo", "admin"])
        )
      ),
    // Top profissionais com mais agendamentos
    db
      .select({
        id: usersTables.id,
        name: usersTables.name,
        avatarImageUrl: professionalProfilesTable.avatarImageUrl,
        specialty: professionalProfilesTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(usersToClinicsTable)
      .innerJoin(usersTables, eq(usersToClinicsTable.userId, usersTables.id))
      .leftJoin(
        professionalProfilesTable,
        eq(professionalProfilesTable.userId, usersTables.id)
      )
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.professionalId, usersTables.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to))
        )
      )
      .where(
        and(
          eq(usersToClinicsTable.clinicId, session.user.clinic.id),
          inArray(usersToClinicsTable.role, ["psicologo", "admin"])
        )
      )
      .groupBy(
        usersTables.id,
        usersTables.name,
        professionalProfilesTable.avatarImageUrl,
        professionalProfilesTable.specialty
      )
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(10),
    // Top especialidades
    db
      .select({
        specialty: professionalProfilesTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .innerJoin(
        professionalProfilesTable,
        eq(appointmentsTable.professionalId, professionalProfilesTable.userId)
      )
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to))
        )
      )
      .groupBy(professionalProfilesTable.specialty)
      .orderBy(desc(count(appointmentsTable.id))),
    db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        gte(appointmentsTable.date, dayjs().startOf("day").toDate())
      ),
      with: {
        patient: true,
        professional: true,
        patientReports: true,
      },
      orderBy: [appointmentsTable.date],
      limit: 10,
    }),
    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
        appointments: count(appointmentsTable.id),
        revenue:
          sql<number>`COALESCE(SUM(${appointmentsTable.appointmentPriceInCents}), 0)`.as(
            "revenue"
          ),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, chartStartDate),
          lte(appointmentsTable.date, chartEndDate)
        )
      )
      .groupBy(sql`DATE(${appointmentsTable.date})`)
      .orderBy(sql`DATE(${appointmentsTable.date})`),
  ]);
  return {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors, // Profissionais com mais agendamentos
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
  };
};
