"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { addPatientReport } from "@/actions/add-patient-report";
import { updateReport } from "@/actions/reports/update-report";
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
import {
  patientReportsTable,
  appointmentsTable,
  patientsTable,
} from "@/db/schema";
import { addPatientReportSchema } from "@/actions/add-patient-report/schema";
import { DynamicRichTextEditorImproved } from "./dynamic-rich-text-editor-improved";
import { useUserAppointments } from "./use-user-appointments";

type ReportWithRelations = typeof patientReportsTable.$inferSelect & {
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
  };
};

// Schema para edição (sem campos obrigatórios de IDs)
const updateReportSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

interface UpsertReportFormProps {
  report?: ReportWithRelations;
  isOpen: boolean;
  onSuccess?: () => void;
  defaultPatientId?: string;
  defaultAppointmentId?: string;
}

const UpsertReportForm = ({
  report,
  isOpen,
  onSuccess,
  defaultPatientId,
  defaultAppointmentId,
}: UpsertReportFormProps) => {
  const isEditing = !!report;
  const { appointments, loading } = useUserAppointments();
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");

  // Schema dinâmico baseado no modo
  const formSchema = isEditing ? updateReportSchema : addPatientReportSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: isEditing
      ? {
          id: report.id,
          title: report.title,
          content: report.content,
        }
      : {
          patientId: defaultPatientId || "",
          appointmentId: defaultAppointmentId || "",
          title: "",
          content: "",
        },
  });

  // Atualizar campos quando uma consulta for selecionada
  useEffect(() => {
    if (selectedAppointment && !isEditing) {
      const appointment = appointments.find(
        (apt) => apt.id === selectedAppointment
      );
      if (appointment) {
        form.setValue("appointmentId", appointment.id);
        form.setValue("patientId", appointment.patient.id);
      }
    }
  }, [selectedAppointment, appointments, isEditing, form]);

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        form.reset({
          id: report.id,
          title: report.title,
          content: report.content,
        });
      } else {
        form.reset({
          patientId: defaultPatientId || "",
          appointmentId: defaultAppointmentId || "",
          title: "",
          content: "",
        });
        setSelectedAppointment(defaultAppointmentId || "");
      }
    }
  }, [isOpen, form, report, isEditing, defaultPatientId, defaultAppointmentId]);

  const addReportAction = useAction(addPatientReport, {
    onSuccess: () => {
      toast.success("Relatório criado com sucesso.");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao criar relatório.");
    },
  });

  const updateReportAction = useAction(updateReport, {
    onSuccess: () => {
      toast.success("Relatório atualizado com sucesso.");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao atualizar relatório.");
    },
  });

  const onSubmit = (values: any) => {
    if (isEditing) {
      updateReportAction.execute(values);
    } else {
      addReportAction.execute(values);
    }
  };

  const isPending = addReportAction.isPending || updateReportAction.isPending;

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Relatório" : "Novo Relatório"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Edite as informações do relatório."
            : "Selecione uma consulta para criar o relatório."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <FormField
              control={form.control}
              name="appointmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consulta</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      setSelectedAppointment(value);
                      field.onChange(value);
                    }}
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loading
                              ? "Carregando consultas..."
                              : appointments.length === 0
                              ? "Nenhuma consulta encontrada"
                              : "Selecione uma consulta"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointments.map((appointment) => (
                        <SelectItem key={appointment.id} value={appointment.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {appointment.patient.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {format(
                                new Date(appointment.date),
                                "dd/MM/yyyy 'às' HH:mm",
                                {
                                  locale: ptBR,
                                }
                              )}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {appointments.length === 0 && !loading && (
                    <p className="text-xs text-muted-foreground">
                      Você precisa ter consultas agendadas para criar relatórios
                    </p>
                  )}
                </FormItem>
              )}
            />
          )}

          {!isEditing && (
            <>
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID do Paciente</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Selecionado automaticamente"
                        {...field}
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título do relatório" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conteúdo</FormLabel>
                <FormControl>
                  <DynamicRichTextEditorImproved
                    content={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Digite o conteúdo do relatório aqui..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending || (!isEditing && !selectedAppointment)}
              className="w-full"
            >
              {isPending
                ? "Salvando..."
                : isEditing
                ? "Salvar alterações"
                : "Criar relatório"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertReportForm;
