"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";

interface Appointment {
  id: string;
  date: Date;
  patient: {
    id: string;
    name: string;
    phone?: string;
  };
  professional: {
    id: string;
    name: string;
  };
  clinicId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
}

const AppointmentDetailsModal = ({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: AppointmentDetailsModalProps) => {
  if (!appointment) return null;

  const appointmentDate = new Date(appointment.date);
  const endDate = new Date(appointmentDate);
  endDate.setHours(appointmentDate.getHours() + 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes do Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Paciente */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm text-muted-foreground">
                PACIENTE
              </span>
            </div>
            <div className="ml-6">
              <p className="font-medium text-lg">{appointment.patient.name}</p>
              {appointment.patient.phone && (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {appointment.patient.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações do Profissional */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm text-muted-foreground">
                PROFISSIONAL
              </span>
            </div>
            <div className="ml-6">
              <p className="font-medium text-lg">
                {appointment.professional.name}
              </p>
            </div>
          </div>

          <Separator />

          {/* Informações de Data e Hora */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm text-muted-foreground">
                DATA E HORA
              </span>
            </div>
            <div className="ml-6 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg">
                  {format(appointmentDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg">
                  {format(appointmentDate, "HH:mm")} -{" "}
                  {format(endDate, "HH:mm")}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status e Metadata */}
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Criado em:</span>{" "}
                {format(
                  new Date(appointment.createdAt),
                  "dd/MM/yyyy 'às' HH:mm",
                  {
                    locale: ptBR,
                  }
                )}
              </p>
              {appointment.updatedAt !== appointment.createdAt && (
                <p>
                  <span className="font-medium">Atualizado em:</span>{" "}
                  {format(
                    new Date(appointment.updatedAt),
                    "dd/MM/yyyy 'às' HH:mm",
                    {
                      locale: ptBR,
                    }
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            {onEdit && (
              <Button
                onClick={() => onEdit(appointment)}
                className="flex-1"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(appointment)}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;
