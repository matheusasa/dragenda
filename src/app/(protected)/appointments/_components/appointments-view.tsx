"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Calendar, Table, Plus } from "lucide-react";
import CalendarView from "./calendar-view";
import AppointmentDetailsModal from "./appointment-details-modal";
import QuickAppointmentModal from "./quick-appointment-modal";
import AddAppointmentButton from "./add-appointment-button";
import ProfessionalFilter from "./professional-filter";
import { appointmentsTableColumns } from "./table-columns";
import { appointmentsTable } from "@/db/schema";

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

// Tipo que corresponde ao que é esperado pela tabela
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

interface Patient {
  id: string;
  name: string;
  phone?: string;
}

interface Doctor {
  id: string;
  name: string;
  availableFromWeekDay: number;
  availableToWeekDay: number;
  availableFromTime: string;
  availableToTime: string;
  appointmentPriceInCents: number;
}

interface AppointmentsViewProps {
  appointments: AppointmentWithRelations[];
  patients: Patient[];
  doctors: Doctor[];
  onRefresh?: () => void;
}

const AppointmentsView = ({
  appointments,
  patients,
  doctors,
  onRefresh,
}: AppointmentsViewProps) => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>(
    doctors.map((d) => d.id) // Inicialmente todos selecionados
  );

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setIsQuickModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleCloseQuickModal = () => {
    setIsQuickModalOpen(false);
    setSelectedSlot(null);
  };

  const handleSuccessAction = () => {
    onRefresh?.();
  };

  // Converter doctors para o formato esperado pelo QuickAppointmentModal
  const professionals = doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
  }));

  // Calcular contagem de agendamentos por profissional
  const appointmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((apt) => {
      counts[apt.professional.id] = (counts[apt.professional.id] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  // Filtrar appointments por profissionais selecionados para a tabela
  const filteredAppointmentsForTable = useMemo(() => {
    if (selectedProfessionals.length === 0) {
      return appointments;
    }
    return appointments.filter((apt) =>
      selectedProfessionals.includes(apt.professional.id)
    );
  }, [appointments, selectedProfessionals]);

  // Converter appointments para o formato esperado pelo CalendarView
  const calendarAppointments: Appointment[] = appointments.map((apt) => ({
    id: apt.id,
    date: apt.date,
    patient: {
      id: apt.patient.id,
      name: apt.patient.name,
      phone: apt.patient.phoneNumber,
    },
    professional: {
      id: apt.professional.id,
      name: apt.professional.name,
    },
    clinicId: apt.clinicId,
    createdAt: apt.createdAt,
    updatedAt: apt.updatedAt || apt.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Agendamentos</h1>
          <span className="text-muted-foreground">
            (
            {selectedProfessionals.length === 0
              ? appointments.length
              : filteredAppointmentsForTable.length}
            )
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ProfessionalFilter
            professionals={professionals}
            selectedProfessionals={selectedProfessionals}
            onSelectionChange={setSelectedProfessionals}
            appointmentCounts={appointmentCounts}
          />
          <AddAppointmentButton patients={patients} doctors={doctors} />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <CalendarView
              appointments={calendarAppointments}
              professionals={professionals}
              selectedProfessionals={selectedProfessionals}
              onSelectAppointment={handleSelectAppointment}
              onSelectSlot={handleSelectSlot}
            />
          </div>
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            💡 <strong>Dica:</strong> Clique em um horário vazio para criar um
            novo agendamento rapidamente, ou clique em um agendamento existente
            para ver os detalhes.
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <DataTable
            data={filteredAppointmentsForTable}
            columns={appointmentsTableColumns}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes do Agendamento */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onEdit={(appointment) => {
          // TODO: Implementar edição
          console.log("Editar agendamento:", appointment);
        }}
        onDelete={(appointment) => {
          // TODO: Implementar exclusão
          console.log("Excluir agendamento:", appointment);
        }}
      />

      {/* Modal de Agendamento Rápido */}
      <QuickAppointmentModal
        selectedSlot={selectedSlot}
        isOpen={isQuickModalOpen}
        onClose={handleCloseQuickModal}
        patients={patients}
        professionals={professionals}
        onSuccess={handleSuccessAction}
      />
    </div>
  );
};

export default AppointmentsView;
