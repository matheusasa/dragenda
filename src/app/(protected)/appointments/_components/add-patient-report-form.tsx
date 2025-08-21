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
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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

  // TipTap Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: form.getValues("content"),
    onUpdate: ({ editor }) => {
      form.setValue("content", editor.getHTML());
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
      editor?.commands.setContent("");
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
            render={() => (
              <FormItem>
                <FormLabel>Conteúdo</FormLabel>
                <FormControl>
                  <div className="border rounded-md min-h-[150px] p-2">
                    <EditorContent editor={editor} />
                  </div>
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
