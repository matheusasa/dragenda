import { Button } from "@/components/ui/button";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

const MedicosPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Médicos</PageTitle>

          <PageDescription>Gerencie os médicos da sua clínica</PageDescription>
        </PageHeaderContent>

        <PageActions>
          <Button>Adicionar Médico</Button>
        </PageActions>
      </PageHeader>
      <PageContent>
        {/* Aqui você pode adicionar o conteúdo da página, como uma lista de médicos */}
        <p>Lista de médicos será exibida aqui.</p>
      </PageContent>
    </PageContainer>
  );
};

export default MedicosPage;
