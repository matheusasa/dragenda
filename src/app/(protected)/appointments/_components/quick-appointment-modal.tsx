"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addAppointment } from "@/actions/add-appointment";

const quickAppointmentSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  professionalId: z.string().min(1, "Selecione um profissional"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Hora é obrigatória"),
});

interface Patient {
  id: string;
  name: string;
  phone?: string;
}

interface Professional {
  id: string;
  name: string;
}

interface QuickAppointmentModalProps {
  selectedSlot: { start: Date; end: Date } | null;
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  professionals: Professional[];
  onSuccess?: () => void;
}

const QuickAppointmentModal = ({
  selectedSlot,
  isOpen,
  onClose,
  patients,
  professionals,
  onSuccess,
}: QuickAppointmentModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof quickAppointmentSchema>>({
    resolver: zodResolver(quickAppointmentSchema),
    defaultValues: {
      patientId: "",
      professionalId: "",
      date: selectedSlot ? format(selectedSlot.start, "yyyy-MM-dd") : "",
      time: selectedSlot ? format(selectedSlot.start, "HH:mm") : "",
    },
  });

  const addAppointmentAction = useAction(addAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      form.reset();
      onClose();
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao criar agendamento");
    },
    onExecute: () => {
      setIsLoading(true);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (values: z.infer<typeof quickAppointmentSchema>) => {
    const dateTime = new Date(`${values.date}T${values.time}:00`);

    addAppointmentAction.execute({
      patientId: values.patientId,
      doctorId: values.professionalId, // Corrigindo para doctorId
      date: dateTime,
      time: values.time,
      appointmentPriceInCents: 0, // Valor padrão
    });
  };

  // Atualizar valores padrão quando o slot mudar
  useEffect(() => {
    if (selectedSlot && isOpen) {
      form.setValue("date", format(selectedSlot.start, "yyyy-MM-dd"));
      form.setValue("time", format(selectedSlot.start, "HH:mm"));
    }
  }, [selectedSlot, isOpen, form]);

  if (!selectedSlot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Slot Selecionado */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              Horário selecionado
            </div>
            <p className="font-medium">
              {format(selectedSlot.start, "EEEE, dd 'de' MMMM", {
                locale: ptBR,
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(selectedSlot.start, "HH:mm")} -{" "}
              {format(selectedSlot.end, "HH:mm")}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Paciente
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              {patient.phone && (
                                <div className="text-xs text-muted-foreground">
                                  {patient.phone}
                                </div>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professionalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profissional
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem
                            key={professional.id}
                            value={professional.id}
                          >
                            {professional.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Agendando..." : "Agendar"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAppointmentModal;
