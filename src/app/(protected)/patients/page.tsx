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
import { patientsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddPatientButton from "./_components/add-patient-button";
import { patientsTableColumns } from "./_components/table-columns";

const PatientsPage = async () => {
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
              <PageTitle>Pacientes</PageTitle>
              <PageDescription>
                Gerencie os pacientes da sua clínica
              </PageDescription>
            </PageHeaderContent>
            <PageActions>
              <AddPatientButton />
            </PageActions>
          </PageHeader>
          <PageContent>
            <div>Carregando...</div>
          </PageContent>
        </PageContainer>
      </WithAuthentication>
    );
  }

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinic.id),
  });
  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Pacientes</PageTitle>
            <PageDescription>
              Gerencie os pacientes da sua clínica
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddPatientButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          <DataTable data={patients} columns={patientsTableColumns} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default PatientsPage;
