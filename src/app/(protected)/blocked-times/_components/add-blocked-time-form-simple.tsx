"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";

import { addBlockedTime } from "@/actions/blocked-times/add-blocked-time";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const formSchema = z.object({
  professionalId: z.string().min(1, "Profissional é obrigatório"),
  date: z.date({ message: "Data é obrigatória" }),
  timeFrom: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de horário inválido (HH:MM)"),
  timeTo: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de horário inválido (HH:MM)"),
  reason: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Professional {
  id: string;
  name: string;
}

interface AddBlockedTimeFormProps {
  professionals: Professional[];
  onSuccess?: () => void;
}

export default function AddBlockedTimeForm({
  professionals,
  onSuccess,
}: AddBlockedTimeFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professionalId: "",
      timeFrom: "",
      timeTo: "",
      reason: "",
    },
  });

  const addBlockedTimeAction = useAction(addBlockedTime, {
    onSuccess: () => {
      toast.success("Horário bloqueado com sucesso!");
      form.reset();
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao bloquear horário");
    },
  });

  const onSubmit = (values: FormData) => {
    const submitData = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
      isRecurring: false,
    };

    addBlockedTimeAction.execute(submitData);
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Bloquear Horário</DialogTitle>
        <DialogDescription>
          Adicione um horário bloqueado para um profissional
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="professionalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <UserIcon className="mr-2 inline h-4 w-4" />
                  Profissional
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <CalendarIcon className="mr-2 inline h-4 w-4" />
                  Data
                </FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="timeFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <ClockIcon className="mr-2 inline h-4 w-4" />
                    Horário inicial
                  </FormLabel>
                  <FormControl>
                    <Input type="time" {...field} placeholder="HH:MM" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <ClockIcon className="mr-2 inline h-4 w-4" />
                    Horário final
                  </FormLabel>
                  <FormControl>
                    <Input type="time" {...field} placeholder="HH:MM" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Reunião, Almoço, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={addBlockedTimeAction.isExecuting}
              className="w-full"
            >
              {addBlockedTimeAction.isExecuting
                ? "Bloqueando..."
                : "Bloquear Horário"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
