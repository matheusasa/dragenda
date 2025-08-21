"use client";

import { EditIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteUser } from "@/actions/iam/delete-user";
import { updateUserRole } from "@/actions/iam/update-role";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usersTables } from "@/db/schema";

import UpsertUserForm from "./upsert-user-form";

interface IAMTableActionsProps {
  user: typeof usersTables.$inferSelect & {
    role: "admin" | "recepcao" | "psicologo";
    clinicId: string;
  };
}

const IAMTableActions = ({ user }: IAMTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const deleteUserAction = useAction(deleteUser, {
    onSuccess: () => {
      toast.success("Usuário removido da clínica com sucesso.");
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao remover usuário.");
    },
  });

  const updateRoleAction = useAction(updateUserRole, {
    onSuccess: () => {
      toast.success("Papel do usuário atualizado com sucesso.");
      setIsUpdatingRole(false);
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao atualizar papel.");
      setIsUpdatingRole(false);
    },
  });

  const handleDeleteUserClick = () => {
    deleteUserAction.execute({ userId: user.id });
  };

  const handleRoleChange = (newRole: "admin" | "recepcao" | "psicologo") => {
    if (newRole === user.role) return;

    setIsUpdatingRole(true);
    updateRoleAction.execute({
      userId: user.id,
      clinicId: user.clinicId,
      role: newRole,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1">
            <label className="text-xs font-medium text-muted-foreground">
              Alterar papel:
            </label>
            <Select
              value={user.role}
              onValueChange={handleRoleChange}
              disabled={isUpdatingRole}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="recepcao">Recepção</SelectItem>
                <SelectItem value="psicologo">Psicólogo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setUpsertDialogIsOpen(true)}>
            <EditIcon className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <TrashIcon className="mr-2 h-4 w-4" />
                Remover da clínica
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Tem certeza que deseja remover este usuário?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá remover o usuário "{user.name}" da clínica. O
                  usuário perderá acesso a esta clínica, mas sua conta será
                  mantida.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUserClick}>
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>{" "}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogIsOpen}>
        <UpsertUserForm
          isOpen={upsertDialogIsOpen}
          user={user}
          clinicId={user.clinicId}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      </Dialog>
    </>
  );
};

export default IAMTableActions;
