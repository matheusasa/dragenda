"use client";

import { Button } from "@/components/ui/button";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
} from "@/components/ui/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, UserCheck, Mail, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function WaitingApprovalContent() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth");
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Aguardando Aprovação</PageTitle>
          <PageDescription>
            Seu cadastro foi realizado com sucesso
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">
                Cadastro Pendente de Aprovação
              </CardTitle>
              <CardDescription>
                Sua conta foi criada com sucesso, mas ainda precisa ser aprovada
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <UserCheck className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Próximos passos:
                    </p>
                    <p>
                      Um administrador da clínica precisa registrar você no
                      sistema IAM e atribuir uma função (psicólogo, secretário
                      ou administrador).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Entre em contato:
                    </p>
                    <p>
                      Solicite ao administrador da clínica que registre sua
                      conta no sistema de gerenciamento de usuários (IAM).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-4">
                  Você pode fazer logout e tentar novamente mais tarde, ou
                  aguardar a aprovação.
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    Verificar Novamente
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleSignOut}
                    className="flex-1"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Fazer Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}
