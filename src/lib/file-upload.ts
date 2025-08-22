import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Configurações de upload
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export interface UploadResult {
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
}

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileUploadError";
  }
}

/**
 * Verifica se o diretório de upload existe, se não, cria
 */
async function ensureUploadDir(): Promise<void> {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Valida o arquivo enviado
 */
function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileUploadError(
      `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new FileUploadError(`Tipo de arquivo não permitido: ${file.type}`);
  }
}

/**
 * Gera um nome único para o arquivo
 */
function generateFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const uuid = randomUUID();
  return `${uuid}${ext}`;
}

/**
 * Faz upload de um arquivo para o sistema local
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  validateFile(file);
  await ensureUploadDir();

  const fileName = generateFileName(file.name);
  const filePath = path.join(UPLOAD_DIR, fileName);

  try {
    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Salvar arquivo no disco
    await fs.writeFile(filePath, buffer);

    return {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileUrl: `/api/files/${fileName}`, // URL para acessar o arquivo
    };
  } catch (error) {
    throw new FileUploadError(
      `Erro ao salvar arquivo: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

/**
 * Remove um arquivo do sistema
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extrair nome do arquivo da URL
    const fileName = fileUrl.split("/").pop();
    if (!fileName) {
      throw new Error("Nome do arquivo inválido");
    }

    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    // Não falhar se o arquivo não existir
  }
}

/**
 * Verifica se um arquivo existe
 */
export async function fileExists(fileUrl: string): Promise<boolean> {
  try {
    const fileName = fileUrl.split("/").pop();
    if (!fileName) return false;

    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtém informações sobre um arquivo
 */
export async function getFileInfo(
  fileUrl: string
): Promise<{ size: number } | null> {
  try {
    const fileName = fileUrl.split("/").pop();
    if (!fileName) return null;

    const filePath = path.join(UPLOAD_DIR, fileName);
    const stats = await fs.stat(filePath);

    return {
      size: stats.size,
    };
  } catch {
    return null;
  }
}

/**
 * Formata o tamanho do arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Obtém ícone baseado no tipo de arquivo
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("word")) return "📝";
  if (mimeType === "text/plain") return "📄";
  return "📎";
}
