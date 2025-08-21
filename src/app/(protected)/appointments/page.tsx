import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { DataTable } from "@/components/ui/data-table";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  appointmentsTable,
  doctorsTable,
  patientsTable,
  professionalProfilesTable,
} from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddAppointmentButton from "./_components/add-appointment-button";
import { appointmentsTableColumns } from "./_components/table-columns";

const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const [patients, professionals, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session!.user.clinic!.id),
    }),
    db.query.usersToClinicsTable.findMany({
      where: (row, { eq, or }) =>
        eq(row.clinicId, session!.user.clinic!.id) &&
        or(eq(row.role, "psicologo"), eq(row.role, "admin")),
      with: {
        user: true,
      },
    }),
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, session!.user.clinic!.id),
      with: {
        patient: true,
        professional: true,
      },
    }),
  ]);
  // Buscar perfis profissionais para preencher disponibilidade e preço
  const profiles = await db.query.professionalProfilesTable.findMany({
    where: eq(professionalProfilesTable.clinicId, session!.user.clinic!.id),
  });

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
          <PageActions>
            <AddAppointmentButton
              patients={patients}
              doctors={professionals.map(({ user, role }) => {
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
              })}
            />
          </PageActions>
        </PageHeader>
        <PageContent>
          <DataTable data={appointments} columns={appointmentsTableColumns} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default AppointmentsPage;
