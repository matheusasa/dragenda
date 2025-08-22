"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  ClockIcon,
  RepeatIcon,
  TrashIcon,
  UserIcon,
  AlertCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { getBlockedTimes } from "@/actions/blocked-times/get-blocked-times";
import { deleteBlockedTime } from "@/actions/blocked-times/delete-blocked-time";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BlockedTime {
  id: string;
  date: Date;
  timeFrom: string;
  timeTo: string;
  reason: string | null;
  isRecurring: boolean | null;
  recurringDays: number[] | null;
  professional: {
    id: string;
    name: string;
  };
}

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function BlockedTimesList() {
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);

  const getBlockedTimesAction = useAction(getBlockedTimes, {
    onSuccess: ({ data }) => {
      setBlockedTimes(data);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao carregar horários bloqueados");
    },
  });

  const deleteBlockedTimeAction = useAction(deleteBlockedTime, {
    onSuccess: () => {
      toast.success("Horário desbloqueado com sucesso!");
      // Recarregar a lista
      getBlockedTimesAction.execute({});
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao desbloquear horário");
    },
  });

  useEffect(() => {
    getBlockedTimesAction.execute({});
  }, []);

  const handleDelete = (id: string) => {
    deleteBlockedTimeAction.execute({ id });
  };

  const formatRecurringDays = (days: number[] | null) => {
    if (!days || days.length === 0) return null;
    return days.map((day) => WEEK_DAYS[day]).join(", ");
  };

  if (getBlockedTimesAction.status === "executing") {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          Carregando horários bloqueados...
        </div>
      </div>
    );
  }

  if (blockedTimes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircleIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-center">
            Nenhum horário bloqueado encontrado
          </p>
          <p className="text-muted-foreground text-sm text-center mt-1">
            Use o botão "Bloquear Horário" para adicionar horários indisponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {blockedTimes.map((blockedTime) => (
        <Card key={blockedTime.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                {blockedTime.professional.name}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deleteBlockedTimeAction.status === "executing"}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Desbloquear horário?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O horário ficará
                      disponível novamente para agendamentos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(blockedTime.id)}
                    >
                      Desbloquear
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              {format(new Date(blockedTime.date), "PPP", { locale: ptBR })}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              {blockedTime.timeFrom.substring(0, 5)} às{" "}
              {blockedTime.timeTo.substring(0, 5)}
            </div>

            {blockedTime.isRecurring && blockedTime.recurringDays && (
              <div className="flex items-center gap-2 text-sm">
                <RepeatIcon className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className="text-xs">
                  Repete: {formatRecurringDays(blockedTime.recurringDays)}
                </Badge>
              </div>
            )}

            {blockedTime.reason && (
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                <strong>Motivo:</strong> {blockedTime.reason}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
