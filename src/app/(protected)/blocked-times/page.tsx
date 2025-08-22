import { eq, inArray } from "drizzle-orm";
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
import { usersToClinicsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddBlockedTimeButton from "./_components/add-blocked-time-button";
import BlockedTimesList from "./_components/blocked-times-list";

const BlockedTimesPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const clinicId = session?.user.clinic?.id;

  if (!clinicId) {
    return <p>Clínica não encontrada.</p>;
  }

  // Buscar profissionais da clínica
  const usersToClinics = await db.query.usersToClinicsTable.findMany({
    where: (row, { eq, inArray }) =>
      eq(row.clinicId, clinicId) && inArray(row.role, ["psicologo", "admin"]),
    with: { user: true },
  });

  const professionals = usersToClinics.map(({ user }) => ({
    id: user.id,
    name: user.name,
  }));

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Horários Bloqueados</PageTitle>
            <PageDescription>
              Gerencie os horários bloqueados para seus profissionais
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddBlockedTimeButton professionals={professionals} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <BlockedTimesList />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default BlockedTimesPage;
