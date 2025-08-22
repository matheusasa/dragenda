"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
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
import { addPatientReportSchema } from "@/actions/add-patient-report/schema";
import { addPatientReport } from "@/actions/add-patient-report";
import { DynamicRichTextEditorImproved } from "../../reports/_components/dynamic-rich-text-editor-improved";
import { useEffect } from "react";

interface AddPatientReportFormProps {
  patientId: string;
  appointmentId: string;
  isOpen: boolean;
  onSuccess?: () => void;
}

export default function AddPatientReportForm({
  patientId,
  appointmentId,
  isOpen,
  onSuccess,
}: AddPatientReportFormProps) {
  const form = useForm<z.infer<typeof addPatientReportSchema>>({
    resolver: zodResolver(addPatientReportSchema),
    defaultValues: {
      patientId,
      appointmentId,
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        patientId,
        appointmentId,
        title: "",
        content: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const createReportAction = useAction(addPatientReport, {
    onSuccess: () => {
      toast.success("Relatório salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar relatório.");
    },
  });

  const onSubmit = (values: z.infer<typeof addPatientReportSchema>) => {
    createReportAction.execute(values);
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Novo relatório</DialogTitle>
        <DialogDescription>
          Preencha o relatório da consulta realizada.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Título do relatório" />
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
            <Button type="submit" disabled={createReportAction.isPending}>
              {createReportAction.isPending
                ? "Salvando..."
                : "Salvar relatório"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
