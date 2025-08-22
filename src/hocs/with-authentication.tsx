// Higher ORder Component
// É um componente que recebe um componente e o renderiza
// mas antes de renderizá-lo, executa alguma ação
// ou, passa alguma prop extra pra esse componente

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

const WithAuthentication = async ({
  children,
  mustHavePlan = false,
  mustHaveClinic = false,
  allowWithoutRole = false,
}: {
  children: React.ReactNode;
  mustHavePlan?: boolean;
  mustHaveClinic?: boolean;
  allowWithoutRole?: boolean;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/auth");
  }

  // Verificar se o usuário tem uma role atribuída
  // Se não tiver role e não está na página de waiting-approval, redirecionar
  if (!allowWithoutRole && !session.user.role) {
    redirect("/waiting-approval");
  }

  if (mustHaveClinic && !session.user.clinic) {
    redirect("/clinic-form");
  }
  return children;
};

export default WithAuthentication;
