import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SignOutButton from "./components/sign-out-button";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/auth");
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session?.user.name}!</p>
      <p>Email: {session?.user.email}</p>
      <SignOutButton />
    </div>
  );
};

export default DashboardPage;
