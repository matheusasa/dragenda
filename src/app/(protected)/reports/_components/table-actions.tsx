"use client";

import { EditIcon, EyeIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteReport } from "@/actions/reports/delete-report";
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
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  patientReportsTable,
  appointmentsTable,
  patientsTable,
} from "@/db/schema";
import UpsertReportForm from "./upsert-report-form";
import ViewReportDialog from "./view-report-dialog";

type ReportWithRelations = typeof patientReportsTable.$inferSelect & {
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
  };
};

interface ReportsTableActionsProps {
  report: ReportWithRelations;
}

const ReportsTableActions = ({ report }: ReportsTableActionsProps) => {
  const [editDialogIsOpen, setEditDialogIsOpen] = useState(false);
  const [viewDialogIsOpen, setViewDialogIsOpen] = useState(false);

  const deleteReportAction = useAction(deleteReport, {
    onSuccess: () => {
      toast.success("Relatório deletado com sucesso.");
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao deletar relatório.");
    },
  });

  const handleDeleteReportClick = () => {
    deleteReportAction.execute({ id: report.id });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setViewDialogIsOpen(true)}>
            <EyeIcon className="mr-2 h-4 w-4" />
            Visualizar
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setEditDialogIsOpen(true)}>
            <EditIcon className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <TrashIcon className="mr-2 h-4 w-4" />
                Deletar
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Tem certeza que deseja deletar este relatório?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O relatório "{report.title}"
                  será permanentemente removido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteReportClick}>
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogIsOpen} onOpenChange={setEditDialogIsOpen}>
        <UpsertReportForm
          isOpen={editDialogIsOpen}
          report={report}
          onSuccess={() => setEditDialogIsOpen(false)}
        />
      </Dialog>

      <Dialog open={viewDialogIsOpen} onOpenChange={setViewDialogIsOpen}>
        <ViewReportDialog isOpen={viewDialogIsOpen} report={report} />
      </Dialog>
    </>
  );
};

export default ReportsTableActions;
