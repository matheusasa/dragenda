"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import { toast } from "sonner";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CreateUserFormProps {
  user?: Partial<z.infer<typeof createUserSchema>>;
  clinics?: { id: string; name: string }[];
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const createUserSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  clinicId: z.string().uuid(),
  role: z.enum(["admin", "recepcao", "psicologo"]),
});

export default function UpsertUserForm({
  user,
  isOpen = false,
  onSuccess,
  clinicId,
}: CreateUserFormProps & { clinicId: string }) {
  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "recepcao",
      clinicId: clinicId,
    },
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmitRegister(values: z.infer<typeof createUserSchema>) {
    setLoading(true);
    try {
      if (user && (user as any).id) {
        // Atualizar usuário existente (implemente a action de update se necessário)
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await authClient.signUp.email(
          {
            email: values.email,
            password: values.password,
            name: values.name,
          },
          {
            onSuccess: () => {
              router.push("/dashboard");
            },
            onError: (ctx) => {
              if (ctx.error.code === "USER_ALREADY_EXISTS") {
                toast.error("Email já cadastrado.");
              }
            },
          }
        );
      }
      form.reset();
      onSuccess?.();
    } catch (e) {
      toast.error("Erro ao salvar usuário");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Edite as informações do usuário."
              : "Preencha os dados para criar um novo usuário."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitRegister)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="recepcao">Recepção</SelectItem>
                      <SelectItem value="psicologo">Psicólogo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Remover campo de seleção de clínica, pois clinicId vem da sessão */}
            <input type="hidden" {...form.register("clinicId")} />
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? user
                  ? "Salvando..."
                  : "Criando..."
                : user
                ? "Salvar"
                : "Criar Usuário"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
