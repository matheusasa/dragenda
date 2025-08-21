import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { db } from "@/db";
import { clinicsTable } from "@/db/schema";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { createClinic } from "@/actions/create-clinic";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
const clinicSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório." }),
});
const ClinicForm = () => {
  const form = useForm({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmitClinic = async (values: z.infer<typeof clinicSchema>) => {
    try {
      console.log("Criando clínica com nome:", values.name);
      await createClinic(values.name);
      toast.success("Clínica criada com sucesso!");
    } catch (error) {
      if (isRedirectError(error)) {
        // Redirecionamento é esperado após sucesso
        return;
      }
      console.error("Erro ao criar clínica:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar clínica"
      );
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitClinic)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Clínica</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o nome da clínica" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Criar clínica"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
};

export default ClinicForm;
