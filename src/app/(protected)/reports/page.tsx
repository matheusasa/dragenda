import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

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
  patientReportsTable,
  patientsTable,
  usersTables,
} from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddReportButton from "./_components/add-report-button";
import ReportsList from "./_components/reports-list";

export default async function ReportsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // Se não há sessão, retornar array vazio (o WithAuthentication vai redirecionar)
  if (!session?.user?.id || !session?.user?.clinic?.id) {
    return (
      <WithAuthentication mustHaveClinic>
        <PageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Relatórios</PageTitle>
              <PageDescription>
                Gerencie os relatórios das consultas realizadas
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <PageContent>
            <ReportsList reports={[]} />
          </PageContent>
        </PageContainer>
      </WithAuthentication>
    );
  }

  const clinicId = session.user.clinic.id;

  // Buscar relatórios baseado no role do usuário
  let reports;

  if (session.user.role === "admin") {
    // Admin vê todos os relatórios da clínica
    // Buscar todos os relatórios e depois filtrar pela clínica através do appointment
    const allReports = await db.query.patientReportsTable
      .findMany({
        with: {
          appointment: {
            with: {
              patient: true,
            },
          },
        },
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      })
      .catch(() => {
        return [];
      });

    // Filtrar apenas relatórios da clínica do admin
    reports = allReports.filter(
      (report) => report.appointment.clinicId === clinicId
    );
  } else {
    // Psicólogo vê apenas seus próprios relatórios
    reports = await db.query.patientReportsTable
      .findMany({
        where: eq(patientReportsTable.professionalId, session.user.id),
        with: {
          appointment: {
            with: {
              patient: true,
            },
          },
        },
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      })
      .catch(() => {
        // Se der erro na query, retornar array vazio
        return [];
      });
  }

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Relatórios de Consultas</PageTitle>
            <PageDescription>
              Gerencie os relatórios das suas consultas realizadas
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddReportButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          <ReportsList reports={reports} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
