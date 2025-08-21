"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  patientReportsTable,
  appointmentsTable,
  patientsTable,
} from "@/db/schema";
import ReportsTableActions from "./table-actions";

type ReportWithRelations = typeof patientReportsTable.$inferSelect & {
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
  };
};

export const reportsTableColumns: ColumnDef<ReportWithRelations>[] = [
  {
    id: "patient",
    accessorKey: "appointment.patient.name",
    header: "Paciente",
    cell: (params) => {
      const report = params.row.original;
      return report.appointment.patient.name;
    },
  },
  {
    id: "appointmentDate",
    accessorKey: "appointment.date",
    header: "Data da Consulta",
    cell: (params) => {
      const report = params.row.original;
      return format(
        new Date(report.appointment.date),
        "dd/MM/yyyy 'às' HH:mm",
        {
          locale: ptBR,
        }
      );
    },
  },
  {
    id: "title",
    accessorKey: "title",
    header: "Título do Relatório",
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Criado em",
    cell: (params) => {
      const report = params.row.original;
      return format(new Date(report.createdAt), "dd/MM/yyyy", {
        locale: ptBR,
      });
    },
  },
  {
    id: "status",
    header: "Status",
    cell: (params) => {
      const report = params.row.original;
      const isUpdated = report.updatedAt && report.updatedAt > report.createdAt;
      return (
        <Badge variant={isUpdated ? "secondary" : "default"}>
          {isUpdated ? "Editado" : "Original"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const report = params.row.original;
      return <ReportsTableActions report={report} />;
    },
  },
];
