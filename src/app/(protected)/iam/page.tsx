import WithAuthentication from "@/hocs/with-authentication";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import AddUserButton from "./_components/add-user-button";
import { inArray } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { usersTables, usersToClinicsTable } from "@/db/schema";
import UserCard from "./_components/UserCard";

export default async function IAMPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Buscar todos os vínculos da clínica
  const links = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.clinicId, session!.user.clinic!.id),
  });

  // Buscar os usuários correspondentes
  const userIds = links.map((l) => l.userId);

  const users = await db.query.usersTables.findMany({
    where: inArray(usersTables.id, userIds),
  });

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Médicos</PageTitle>
            <PageDescription>
              Gerencie os médicos da sua clínica
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddUserButton clinicId={session!.user.clinic!.id} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="grid grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={{
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: "Médico", // or fetch actual role if available
                  clinic: session!.user.clinic!.name, // or another clinic identifier
                }}
              />
            ))}
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
