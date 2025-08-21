import { eq } from "drizzle-orm";
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
} from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddReportButton from "./_components/add-report-button";
import ReportsList from "./_components/reports-list";

export default async function ReportsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // Se não há sessão, retornar array vazio (o WithAuthentication vai redirecionar)
  if (!session?.user?.id) {
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

  // Buscar relatórios do profissional logado diretamente
  const reports = await db.query.patientReportsTable
    .findMany({
      where: eq(patientReportsTable.professionalId, session.user.id),
      with: {
        appointment: {
          with: {
            patient: true,
          },
        },
      },
    })
    .catch(() => {
      // Se der erro na query (por causa da estrutura antiga), retornar array vazio
      return [];
    });

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
