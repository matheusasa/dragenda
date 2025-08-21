"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { usersTables, usersToClinicsTable } from "@/db/schema";
import IAMTableActions from "./table-actions";

type UserWithRole = typeof usersTables.$inferSelect & {
  role: "admin" | "recepcao" | "psicologo";
  clinicId: string;
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin":
      return "Administrador";
    case "recepcao":
      return "Recepção";
    case "psicologo":
      return "Psicólogo";
    default:
      return role;
  }
};

const getRoleVariant = (role: string) => {
  switch (role) {
    case "admin":
      return "destructive" as const;
    case "psicologo":
      return "default" as const;
    case "recepcao":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

export const iamTableColumns: ColumnDef<UserWithRole>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Papel",
    cell: (params) => {
      const user = params.row.original;
      return (
        <Badge variant={getRoleVariant(user.role)}>
          {getRoleLabel(user.role)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const user = params.row.original;
      return <IAMTableActions user={user} />;
    },
  },
];
