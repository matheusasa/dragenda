"use client";

import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock, User, Phone } from "lucide-react";

// Configuração do localizador para português
const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// Tipos
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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment & { color?: string };
}

interface CalendarViewProps {
  appointments: Appointment[];
  professionals?: { id: string; name: string }[];
  selectedProfessionals?: string[];
  onSelectAppointment?: (appointment: Appointment) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

const CalendarView = ({
  appointments,
  professionals = [],
  selectedProfessionals = [],
  onSelectAppointment,
  onSelectSlot,
}: CalendarViewProps) => {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  // Filtrar appointments pelos profissionais selecionados
  const filteredAppointments = useMemo(() => {
    if (selectedProfessionals.length === 0) {
      return appointments;
    }
    return appointments.filter((apt) =>
      selectedProfessionals.includes(apt.professional.id)
    );
  }, [appointments, selectedProfessionals]);

  // Converter appointments para eventos do calendário
  const events: CalendarEvent[] = useMemo(() => {
    return filteredAppointments.map((appointment, index) => {
      const startDate = new Date(appointment.date);
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1); // Assumindo 1 hora por consulta

      // Gerar cor baseada no profissional
      const professionalIndex = professionals.findIndex(
        (p) => p.id === appointment.professional.id
      );
      const colors = [
        "#3b82f6", // blue
        "#ef4444", // red
        "#10b981", // emerald
        "#f59e0b", // amber
        "#8b5cf6", // violet
        "#ec4899", // pink
        "#06b6d4", // cyan
        "#84cc16", // lime
      ];
      const color = colors[professionalIndex % colors.length] || "#6b7280";

      return {
        id: appointment.id,
        title: `${appointment.patient.name} - ${appointment.professional.name}`,
        start: startDate,
        end: endDate,
        resource: { ...appointment, color },
      };
    });
  }, [filteredAppointments, professionals]);

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onSelectAppointment?.(event.resource);
    },
    [onSelectAppointment]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      onSelectSlot?.(slotInfo);
    },
    [onSelectSlot]
  );

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  // Componente customizado para header dos dias
  const CustomDayHeader = ({ date }: { date: Date }) => {
    const dayNumber = format(date, "dd");
    const dayName = format(date, "EEEE", { locale: ptBR });
    const isToday =
      format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

    return (
      <div
        className={`flex flex-col items-center p-2 ${
          isToday ? "bg-primary/10 rounded-t-lg" : ""
        }`}
      >
        <div
          className={`text-2xl font-bold ${
            isToday ? "text-primary" : "text-foreground"
          }`}
        >
          {dayNumber}
        </div>
        <div
          className={`text-xs uppercase tracking-wide ${
            isToday ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {dayName}
        </div>
      </div>
    );
  };

  // Componente customizado para exibir eventos
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const appointment = event.resource;

    return (
      <div
        className="p-1 text-xs h-full rounded"
        style={{ backgroundColor: appointment.color || "hsl(var(--primary))" }}
      >
        <div className="font-medium truncate text-white">
          {appointment.patient.name}
        </div>
        <div className="text-white/80 truncate">
          {appointment.professional.name}
        </div>
      </div>
    );
  };

  // Componente customizado para toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("PREV")}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("TODAY")}
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("NEXT")}
          >
            →
          </Button>
        </div>

        <h2 className="text-lg font-semibold">{label}</h2>

        <div className="flex gap-1">
          <Button
            variant={view === Views.MONTH ? "default" : "outline"}
            size="sm"
            onClick={() => onView(Views.MONTH)}
          >
            Mês
          </Button>
          <Button
            variant={view === Views.WEEK ? "default" : "outline"}
            size="sm"
            onClick={() => onView(Views.WEEK)}
          >
            Semana
          </Button>
          <Button
            variant={view === Views.DAY ? "default" : "outline"}
            size="sm"
            onClick={() => onView(Views.DAY)}
          >
            Dia
          </Button>
        </div>
      </div>
    );
  };

  const messages = {
    allDay: "Dia todo",
    previous: "Anterior",
    next: "Próximo",
    today: "Hoje",
    month: "Mês",
    week: "Semana",
    day: "Dia",
    agenda: "Agenda",
    date: "Data",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "Não há eventos neste período.",
    showMore: (total: number) => `+${total} mais`,
  };

  // Gerar legenda de cores para profissionais visíveis
  const visibleProfessionals = professionals.filter(
    (p) =>
      selectedProfessionals.length === 0 || selectedProfessionals.includes(p.id)
  );

  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];

  return (
    <div className="h-[600px] w-full">
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-event {
          background-color: transparent !important;
          border: none !important;
          border-radius: 4px;
          padding: 0;
          color: inherit;
        }
        .rbc-event:hover {
          background-color: transparent !important;
        }
        .rbc-selected {
          background-color: transparent !important;
        }
        .rbc-today {
          background-color: hsl(var(--muted) / 0.3);
        }
        .rbc-header {
          background-color: transparent;
          padding: 0;
          font-weight: 500;
          border-bottom: 1px solid hsl(var(--border));
          height: auto;
          min-height: 60px;
        }
        .rbc-time-view .rbc-header {
          border-right: 1px solid hsl(var(--border));
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid hsl(var(--border));
        }
        .rbc-time-slot {
          border-top: 1px solid hsl(var(--border) / 0.3);
        }
        .rbc-day-slot .rbc-time-slot {
          border-right: 1px solid hsl(var(--border));
        }
        .rbc-current-time-indicator {
          background-color: hsl(var(--destructive));
          height: 2px;
        }
        .rbc-toolbar {
          display: none; /* Usaremos nossa toolbar customizada */
        }
      `}</style>

      <CustomToolbar
        label={format(date, view === Views.MONTH ? "MMMM yyyy" : "dd/MM/yyyy", {
          locale: ptBR,
        })}
        onNavigate={(action: string) => {
          if (action === "PREV") {
            const newDate = new Date(date);
            if (view === Views.MONTH) {
              newDate.setMonth(date.getMonth() - 1);
            } else if (view === Views.WEEK) {
              newDate.setDate(date.getDate() - 7);
            } else {
              newDate.setDate(date.getDate() - 1);
            }
            handleNavigate(newDate);
          } else if (action === "NEXT") {
            const newDate = new Date(date);
            if (view === Views.MONTH) {
              newDate.setMonth(date.getMonth() + 1);
            } else if (view === Views.WEEK) {
              newDate.setDate(date.getDate() + 7);
            } else {
              newDate.setDate(date.getDate() + 1);
            }
            handleNavigate(newDate);
          } else if (action === "TODAY") {
            handleNavigate(new Date());
          }
        }}
        onView={handleViewChange}
      />

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100% - 80px)" }}
        view={view}
        date={date}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        popup
        messages={messages}
        culture="pt-BR"
        components={{
          event: EventComponent,
          month: {
            header: CustomDayHeader,
          },
          week: {
            header: CustomDayHeader,
          },
        }}
        step={30}
        timeslots={2}
        min={new Date(2024, 0, 1, 7, 0)} // 7:00 AM
        max={new Date(2024, 0, 1, 22, 0)} // 10:00 PM
        formats={{
          timeGutterFormat: (date: Date) => format(date, "HH:mm"),
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`,
          dayHeaderFormat: (date: Date) => "", // Vazio porque usamos componente customizado
          dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, "dd/MM", { locale: ptBR })} - ${format(
              end,
              "dd/MM",
              { locale: ptBR }
            )}`,
        }}
      />

      {/* Legenda de cores */}
      {visibleProfessionals.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            Legenda:
          </span>
          {visibleProfessionals.map((professional, index) => {
            const color = colors[index % colors.length];
            return (
              <div key={professional.id} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground">
                  {professional.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
