"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  patientReportsTable,
  appointmentsTable,
  patientsTable,
} from "@/db/schema";
import { logReportView } from "@/actions/reports/log-report-view";
import { getReportAuditLogs } from "@/actions/reports/get-audit-logs";
import {
  History,
  Eye,
  Edit,
  Plus,
  Paperclip,
  FileText,
  Trash2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import AttachmentManager from "./attachment-manager";

type ReportWithRelations = typeof patientReportsTable.$inferSelect & {
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
  };
};

interface ViewReportDialogProps {
  report: ReportWithRelations;
  isOpen: boolean;
}

const ViewReportDialog = ({ report, isOpen }: ViewReportDialogProps) => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const { data: session } = authClient.useSession();

  const isUpdated = report.updatedAt && report.updatedAt > report.createdAt;
  const isAdmin = session?.user?.role === "admin";

  const logViewAction = useAction(logReportView);
  const getAuditLogsAction = useAction(getReportAuditLogs, {
    onSuccess: (result) => {
      setAuditLogs(result.data || []);
      setLoadingAudit(false);
    },
    onError: () => {
      setLoadingAudit(false);
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Registrar que o usuário visualizou o relatório
      logViewAction.execute({ reportId: report.id });

      // Carregar logs de auditoria apenas se for admin
      if (isAdmin) {
        setLoadingAudit(true);
        getAuditLogsAction.execute({ reportId: report.id });
      }
    }
  }, [isOpen, report.id, isAdmin]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "updated":
        return <Edit className="h-4 w-4 text-blue-600" />;
      case "viewed":
        return <Eye className="h-4 w-4 text-gray-600" />;
      case "attachment_added":
        return <Paperclip className="h-4 w-4 text-green-600" />;
      case "attachment_deleted":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "created":
        return "Criado";
      case "updated":
        return "Editado";
      case "viewed":
        return "Visualizado";
      case "attachment_added":
        return "Anexo Adicionado";
      case "attachment_deleted":
        return "Anexo Removido";
      default:
        return action;
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {report.title}
          <Badge variant={isUpdated ? "secondary" : "default"}>
            {isUpdated ? "Editado" : "Original"}
          </Badge>
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="content" className="flex-1 overflow-hidden">
        <TabsList
          className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="attachments">
            <Paperclip className="mr-2 h-4 w-4" />
            Anexos
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="audit">
              <History className="mr-2 h-4 w-4" />
              Auditoria ({auditLogs.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="content" className="mt-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">
                  Paciente:
                </span>
                <p>{report.appointment.patient.name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Data da Consulta:
                </span>
                <p>
                  {format(
                    new Date(report.appointment.date),
                    "dd/MM/yyyy 'às' HH:mm",
                    {
                      locale: ptBR,
                    }
                  )}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Criado em:
                </span>
                <p>
                  {format(new Date(report.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              {isUpdated && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Última edição:
                  </span>
                  <p>
                    {format(
                      new Date(report.updatedAt!),
                      "dd/MM/yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Conteúdo do Relatório:</h4>
              <div
                className="prose prose-sm max-w-none border rounded-md p-4 bg-muted/20"
                dangerouslySetInnerHTML={{ __html: report.content }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attachments" className="mt-4 overflow-y-auto">
          <AttachmentManager reportId={report.id} canEdit={true} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="audit" className="mt-4 overflow-hidden">
            <ScrollArea className="h-[400px]">
              {loadingAudit ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">
                    Carregando histórico...
                  </p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">
                    Nenhum evento registrado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 bg-muted/20"
                    >
                      <div className="flex items-start gap-3">
                        {getActionIcon(log.action)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {getActionLabel(log.action)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              por {log.user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(log.createdAt),
                                "dd/MM/yyyy 'às' HH:mm",
                                {
                                  locale: ptBR,
                                }
                              )}
                            </span>
                          </div>

                          {log.action === "updated" && (
                            <div className="text-sm space-y-2 mt-2">
                              {log.previousTitle !== log.newTitle && (
                                <div>
                                  <span className="font-medium">
                                    Título alterado:
                                  </span>
                                  <div className="bg-red-50 border-l-4 border-red-200 p-2 my-1">
                                    <span className="text-red-700">
                                      - {log.previousTitle}
                                    </span>
                                  </div>
                                  <div className="bg-green-50 border-l-4 border-green-200 p-2">
                                    <span className="text-green-700">
                                      + {log.newTitle}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {log.previousContent !== log.newContent && (
                                <div>
                                  <span className="font-medium">
                                    Conteúdo alterado
                                  </span>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Conteúdo foi modificado (visualizar
                                    diferenças no histórico detalhado)
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {(log.action === "attachment_added" ||
                            log.action === "attachment_deleted") &&
                            log.newContent && (
                              <div className="text-sm mt-2">
                                <div
                                  className={`border-l-4 p-2 rounded ${
                                    log.action === "attachment_added"
                                      ? "bg-green-50 border-green-200"
                                      : "bg-red-50 border-red-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span
                                      className={
                                        log.action === "attachment_added"
                                          ? "text-green-700"
                                          : "text-red-700"
                                      }
                                    >
                                      {log.newContent}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <p>IP: {log.ipAddress}</p>
                            <p>Navegador: {log.userAgent}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </DialogContent>
  );
};

export default ViewReportDialog;
