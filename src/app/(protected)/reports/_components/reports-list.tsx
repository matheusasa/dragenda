"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  appointmentsTable,
  patientReportsTable,
  patientsTable,
} from "@/db/schema";

import { reportsTableColumns } from "./table-columns";

type ReportWithRelations = typeof patientReportsTable.$inferSelect & {
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
  };
};

interface ReportsListProps {
  reports: ReportWithRelations[];
}

export default function ReportsList({ reports }: ReportsListProps) {
  const [patientNameFilter, setPatientNameFilter] = useState("");

  const filteredReports = useMemo(() => {
    if (!patientNameFilter.trim()) {
      return reports;
    }

    return reports.filter((report) =>
      report.appointment.patient.name
        .toLowerCase()
        .includes(patientNameFilter.toLowerCase())
    );
  }, [reports, patientNameFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por nome do paciente..."
            value={patientNameFilter}
            onChange={(e) => setPatientNameFilter(e.target.value)}
            className="pl-8 w-[300px]"
          />
        </div>
        {patientNameFilter && (
          <p className="text-sm text-muted-foreground">
            {filteredReports.length} de {reports.length} relatórios encontrados
          </p>
        )}
      </div>
      <DataTable data={filteredReports} columns={reportsTableColumns} />
    </div>
  );
}
