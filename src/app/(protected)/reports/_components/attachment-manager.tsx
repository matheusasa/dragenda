"use client";

import { useState, useRef, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  File,
  X,
  Download,
  Trash2,
  Eye,
  FileText,
  Image,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getReportAttachments } from "@/actions/attachments/get-attachments";
import { deleteReportAttachment } from "@/actions/attachments/delete-attachment";
import {
  formatFileSize,
  getFileIcon,
  isAllowedFileType,
  isValidFileSize,
} from "@/lib/file-utils";

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}

interface AttachmentManagerProps {
  reportId: string;
  canEdit?: boolean;
}

const AttachmentManager = ({
  reportId,
  canEdit = false,
}: AttachmentManagerProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Actions
  const getAttachmentsAction = useAction(getReportAttachments, {
    onSuccess: (result) => {
      setAttachments(result.data || []);
    },
  });

  const deleteAttachmentAction = useAction(deleteReportAttachment, {
    onSuccess: () => {
      toast.success("Anexo removido com sucesso!");
      loadAttachments();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao remover anexo");
    },
  });

  const loadAttachments = () => {
    getAttachmentsAction.execute({ reportId });
  };

  // Carregar anexos na inicialização
  useEffect(() => {
    loadAttachments();
  }, [reportId]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleFileUpload(file);
  };

  const handleDelete = (attachmentId: string) => {
    if (confirm("Tem certeza que deseja remover este anexo?")) {
      deleteAttachmentAction.execute({ attachmentId });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validações usando as funções utilitárias
    if (!isValidFileSize(file.size)) {
      toast.error("Arquivo muito grande. Máximo: 10MB");
      return;
    }

    if (!isAllowedFileType(file.type)) {
      toast.error("Tipo de arquivo não suportado");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Criar FormData para upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("reportId", reportId);

      // Fazer upload para API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro no upload");
      }

      const result = await response.json();

      if (result.success) {
        // Upload bem-sucedido, recarregar anexos
        loadAttachments();
        toast.success("Arquivo enviado com sucesso!");
      } else {
        throw new Error(result.error || "Erro no upload");
      }
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error("Erro ao enviar arquivo");
      console.error("Erro no upload:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIconComponent = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (mimeType === "application/pdf") return <FileText className="h-4 w-4" />;
    if (mimeType.includes("word")) return <FileText className="h-4 w-4" />;
    if (mimeType.includes("sheet"))
      return <FileSpreadsheet className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Anexos ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {canEdit && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt"
            />

            {isUploading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4 animate-bounce" />
                  Enviando arquivo...
                </div>
                <Progress value={uploadProgress} />
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Escolher Arquivo
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    ou arraste e solte arquivos aqui
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos: JPG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT (máx. 10MB)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lista de Anexos */}
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex-shrink-0">
                {getFileIconComponent(attachment.mimeType)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {attachment.fileName}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(attachment.fileSize)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Enviado por {attachment.uploadedBy.name} em{" "}
                  {format(
                    new Date(attachment.createdAt),
                    "dd/MM/yyyy 'às' HH:mm",
                    {
                      locale: ptBR,
                    }
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.fileUrl, "_blank")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = attachment.fileUrl;
                    link.download = attachment.fileName;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {attachments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum anexo encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttachmentManager;
