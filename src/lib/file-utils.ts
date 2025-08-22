// Utilitários de arquivo que podem ser usados no cliente
import { FileText, Image, FileSpreadsheet, File } from "lucide-react";

/**
 * Formata o tamanho do arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Obtém o ícone apropriado baseado no tipo MIME
 */
export function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return Image;
  }

  if (
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType === "text/plain"
  ) {
    return FileText;
  }

  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return FileSpreadsheet;
  }

  return File;
}

/**
 * Verifica se o arquivo é uma imagem
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/**
 * Obtém a extensão do arquivo baseada no nome
 */
export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

/**
 * Valida se o tipo de arquivo é permitido
 */
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  return allowedTypes.includes(mimeType);
}

/**
 * Valida o tamanho do arquivo
 */
export function isValidFileSize(
  size: number,
  maxSizeInMB: number = 10
): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return size <= maxSizeInBytes;
}
