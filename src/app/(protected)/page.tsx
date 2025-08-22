import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const MainPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Se não há usuário, redirecionar para login
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // Se o usuário não tem role, redirecionar para waiting-approval
  if (!session.user.role) {
    redirect("/waiting-approval");
  }

  // Se o usuário não tem clínica, redirecionar para criar clínica
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  // Se tem tudo, redirecionar para dashboard
  redirect("/dashboard");
};

export default MainPage;
