import { eq, inArray } from "drizzle-orm";
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
import { usersTables, usersToClinicsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddUserButton from "./_components/add-user-button";
import { iamTableColumns } from "./_components/table-columns";

type UserWithRole = typeof usersTables.$inferSelect & {
  role: "admin" | "recepcao" | "psicologo";
  clinicId: string;
};

export default async function IAMPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Se não há sessão ou clínica, retornar componente vazio (o WithAuthentication vai redirecionar)
  if (!session?.user?.clinic?.id) {
    return (
      <WithAuthentication mustHaveClinic>
        <PageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Gerenciar Usuários</PageTitle>
              <PageDescription>
                Gerencie os usuários e permissões da sua clínica
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <PageContent>
            <DataTable<UserWithRole, unknown>
              data={[]}
              columns={iamTableColumns}
            />
          </PageContent>
        </PageContainer>
      </WithAuthentication>
    );
  }

  // Buscar todos os vínculos da clínica
  const links = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.clinicId, session.user.clinic.id),
  });

  // Buscar os usuários correspondentes
  const userIds = links.map((l) => l.userId);

  const users = await db.query.usersTables.findMany({
    where: inArray(usersTables.id, userIds),
  });

  // Combinar dados dos usuários com seus papéis
  const usersWithRoles = users.map((user) => {
    const link = links.find((l) => l.userId === user.id);
    return {
      ...user,
      role: link?.role || ("recepcao" as const),
      clinicId: session.user.clinic!.id,
    };
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Gerenciar Usuários</PageTitle>
            <PageDescription>
              Gerencie os usuários e permissões da sua clínica
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddUserButton clinicId={session.user.clinic.id} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <DataTable<UserWithRole, unknown>
            data={usersWithRoles}
            columns={iamTableColumns}
          />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
