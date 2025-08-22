"use client";

import {
  MoreVerticalIcon,
  TrashIcon,
  FileTextIcon,
  CheckCircle,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useState } from "react";

import { deleteAppointment } from "@/actions/delete-appointment";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";
import { appointmentsTable } from "@/db/schema";
import AddPatientReportForm from "./add-patient-report-form";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  professional: {
    id: string;
    name: string;
    email: string;
  };
  patientReports: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
  }>;
};

interface AppointmentsTableActionsProps {
  appointment: AppointmentWithRelations;
}

const AppointmentsTableActions = ({
  appointment,
}: AppointmentsTableActionsProps) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      toast.success("Agendamento deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar agendamento.");
    },
  });

  const handleDeleteAppointmentClick = () => {
    if (!appointment) return;
    deleteAppointmentAction.execute({ id: appointment.id });
  };

  const hasReport =
    appointment.patientReports && appointment.patientReports.length > 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{appointment.patient.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {hasReport ? (
            <DropdownMenuItem disabled className="text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Relatório já criado
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setIsReportModalOpen(true)}>
              <FileTextIcon className="h-4 w-4 mr-2" />
              Criar relatório
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <TrashIcon />
                Excluir
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Tem certeza que deseja deletar esse agendamento?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser revertida. Isso irá deletar o
                  agendamento permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAppointmentClick}>
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal para criar relatório */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <AddPatientReportForm
          appointmentId={appointment.id}
          patientId={appointment.patient.id}
          isOpen={isReportModalOpen}
          onSuccess={() => {
            setIsReportModalOpen(false);
            // Recarregar a página ou atualizar os dados
            window.location.reload();
          }}
        />
      </Dialog>
    </>
  );
};

export default AppointmentsTableActions;
