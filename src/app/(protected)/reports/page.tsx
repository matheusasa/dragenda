import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  appointmentsTable,
  patientReportsTable,
  patientsTable,
  patientProfessionalLinksTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { DataTable } from "@/components/ui/data-table";
import AddPatientReportForm from "../appointments/_components/add-patient-report-form";

// Colunas da tabela de relatórios
const columns = [
  {
    accessorKey: "patient.name",
    header: "Paciente",
    cell: (row: any) => row.row.original.patient.name,
  },
  {
    accessorKey: "appointment.date",
    header: "Data da Consulta",
    cell: (row: any) =>
      new Date(row.row.original.appointment.date).toLocaleString("pt-BR"),
  },
  {
    accessorKey: "title",
    header: "Título do Relatório",
  },
  {
    accessorKey: "actions",
    header: "Ações",
    cell: (row: any) => row.row.original.actions,
  },
];

export default async function ReportsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  //   if (!session || session.user.role !== "psicologo") {
  //     redirect("/dashboard");
  //   }

  // Buscar vínculos do profissional logado
  const links = await db.query.patientProfessionalLinksTable.findMany({
    where: eq(patientProfessionalLinksTable.professionalId, session!.user.id),
  });
  const patientIds = links.map((link) => link.patientId);

  // Buscar agendamentos dos pacientes vinculados
  const appointments = await db.query.appointmentsTable.findMany({
    where: inArray(appointmentsTable.patientId, patientIds),
    with: {
      patient: true,
    },
  });

  // Buscar relatórios já existentes
  const reports = await db.query.patientReportsTable.findMany({
    where: eq(patientReportsTable.professionalId, session!.user.id),
  });

  // Montar dados para a tabela
  const data = appointments.map((appointment) => {
    const report = reports.find((r) => r.appointmentId === appointment.id);
    return {
      id: appointment.id,
      patient: appointment.patient,
      appointment,
      title: report?.title || "",
      actions: (
        <AddPatientReportForm
          patientId={appointment.patientId}
          professionalId={session!.user.id}
          appointmentId={appointment.id}
          isOpen={false} // Troque para controle de modal se quiser
        />
      ),
    };
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Relatórios de Consultas</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
