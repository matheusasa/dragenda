import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  appointmentsTable,
  doctorsTable,
  patientsTable,
  professionalProfilesTable,
  usersToClinicsTable,
} from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AppointmentsView from "./_components/appointments-view";

const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Se não há sessão, o WithAuthentication vai redirecionar
  if (!session?.user?.clinic?.id) {
    return (
      <WithAuthentication mustHaveClinic>
        <PageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Agendamentos</PageTitle>
              <PageDescription>
                Gerencie os agendamentos da sua clínica
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <PageContent>
            <div>Carregando...</div>
          </PageContent>
        </PageContainer>
      </WithAuthentication>
    );
  }

  const clinicId = session.user.clinic!.id;

  const [patients, professionals, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, clinicId),
    }),
    db.query.usersToClinicsTable.findMany({
      where: (row, { eq, or }) =>
        eq(row.clinicId, clinicId) &&
        or(eq(row.role, "psicologo"), eq(row.role, "admin")),
      with: {
        user: true,
      },
    }),
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, clinicId),
      with: {
        patient: true,
        professional: true,
        patientReports: true, // Incluir relatórios da consulta
      },
    }),
  ]);

  // Buscar perfis profissionais para preencher disponibilidade e preço
  const profiles = await db.query.professionalProfilesTable.findMany({
    where: eq(professionalProfilesTable.clinicId, clinicId),
  });

  const doctors = professionals.map(({ user, role }) => {
    const prof = profiles.find((pr) => pr.userId === user.id);
    return {
      id: user.id,
      name: user.name,
      availableFromWeekDay: prof?.availableFromWeekDay ?? 0,
      availableToWeekDay: prof?.availableToWeekDay ?? 6,
      availableFromTime: prof?.availableFromTime ?? "",
      availableToTime: prof?.availableToTime ?? "",
      appointmentPriceInCents: prof?.appointmentPriceInCents ?? 0,
    };
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageContent>
          <AppointmentsView
            appointments={appointments}
            patients={patients}
            doctors={doctors}
          />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default AppointmentsPage;
