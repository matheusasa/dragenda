import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
} from "@/components/ui/page-container";
import WithAuthentication from "@/hocs/with-authentication";
import WaitingApprovalContent from "./_components/waiting-approval-content";

export default async function WaitingApprovalPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Se não há sessão, deixar o WithAuthentication lidar com isso
  if (!session?.user) {
    return (
      <WithAuthentication allowWithoutRole={true}>
        <PageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Aguardando Aprovação</PageTitle>
              <PageDescription>Carregando...</PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <PageContent>
            <div>Carregando...</div>
          </PageContent>
        </PageContainer>
      </WithAuthentication>
    );
  }

  return (
    <WithAuthentication allowWithoutRole={true}>
      <WaitingApprovalContent />
    </WithAuthentication>
  );
}
