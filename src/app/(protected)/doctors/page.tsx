import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
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
import DoctorCard from "./_components/doctor-card";
import AddDoctorButton from "./_components/add-doctor-button";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const clinicId = session?.user.clinic?.id;
  if (!clinicId) {
    return <p>Clínica não encontrada.</p>;
  }

  // Buscar profissionais (roles 'psicologo' ou 'admin')
  const usersToClinics = await db.query.usersToClinicsTable.findMany({
    where: (row, { eq, inArray }) =>
      eq(row.clinicId, clinicId) && inArray(row.role, ["psicologo", "admin"]),
    with: { user: true },
  });

  const userIds = usersToClinics.map((uc) => uc.userId);
  const profiles = await db.query.professionalProfilesTable.findMany({
    where: (p, { eq, inArray }) =>
      eq(p.clinicId, clinicId) && inArray(p.userId, userIds),
  });

  const professionals = usersToClinics.map(({ user, userId }) => ({
    user,
    professionalProfile: profiles.find((pr) => pr.userId === userId) ?? null,
  }));

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Profissionais</PageTitle>
            <PageDescription>
              Gerencie os profissionais da sua clínica
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddDoctorButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          {professionals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professionals.map(({ user, professionalProfile }) => (
                <DoctorCard
                  key={user.id}
                  user={user}
                  professionalProfile={professionalProfile}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhum profissional encontrado.
            </p>
          )}
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default DoctorsPage;
