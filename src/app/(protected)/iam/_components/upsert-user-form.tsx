"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { inviteUser } from "@/actions/iam/invite-user";
import { updateUser } from "@/actions/iam/update-user";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usersTables } from "@/db/schema";

// Schemas para criação e edição
const inviteUserSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "recepcao", "psicologo"]),
});

const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
});

type UserForEdit = typeof usersTables.$inferSelect & {
  role: "admin" | "recepcao" | "psicologo";
  clinicId: string;
};

interface UpsertUserFormProps {
  user?: UserForEdit;
  clinicId: string;
  onSuccess?: () => void;
  isOpen: boolean;
}

export default function UpsertUserForm({
  user,
  clinicId,
  onSuccess,
  isOpen,
}: UpsertUserFormProps) {
  const isEditing = !!user;

  // Schema dinâmico baseado no modo
  const formSchema = isEditing ? updateUserSchema : inviteUserSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: isEditing
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      : {
          email: "",
          role: "recepcao",
        },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        form.reset({
          id: user.id,
          name: user.name,
          email: user.email,
        });
      } else {
        form.reset({
          email: "",
          role: "recepcao",
        });
      }
    }
  }, [isOpen, form, user, isEditing]);

  const inviteUserAction = useAction(inviteUser, {
    onSuccess: () => {
      toast.success("Usuário adicionado à clínica com sucesso.");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao adicionar usuário.");
    },
  });

  const updateUserAction = useAction(updateUser, {
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso.");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao atualizar usuário.");
    },
  });

  const onSubmit = (values: any) => {
    if (isEditing) {
      updateUserAction.execute(values);
    } else {
      inviteUserAction.execute(values);
    }
  };

  const isPending = inviteUserAction.isPending || updateUserAction.isPending;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Usuário" : "Adicionar Usuário"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Edite as informações do usuário."
            : "Digite o email de um usuário já cadastrado no sistema para adicioná-lo à clínica."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isEditing && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="usuario@exemplo.com"
                    disabled={isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {!isEditing && (
                  <p className="text-xs text-muted-foreground">
                    O usuário deve estar cadastrado no sistema
                  </p>
                )}
              </FormItem>
            )}
          />
          {!isEditing && (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Papel</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um papel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="recepcao">Recepção</SelectItem>
                      <SelectItem value="psicologo">Psicólogo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending
                ? "Salvando..."
                : isEditing
                ? "Salvar"
                : "Adicionar à clínica"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
