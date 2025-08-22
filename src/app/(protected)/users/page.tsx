import { redirect } from "next/navigation";

// Página de usuários - redireciona para IAM que é onde gerenciamos usuários
export default function UsersPage() {
  redirect("/iam");
}