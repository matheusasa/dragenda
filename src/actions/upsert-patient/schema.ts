import { z } from "zod";

// Regex para validação de CPF (formato: 000.000.000-00 ou 00000000000)
const cpfRegex = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{11})$/;

// Regex para validação de CEP (formato: 00000-000 ou 00000000)
const cepRegex = /^(\d{5}-?\d{3}|\d{8})$/;

export const upsertPatientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  phoneNumber: z.string().trim().min(1, {
    message: "Número de telefone é obrigatório.",
  }),
  sex: z.enum(["male", "female"], {
    message: "Sexo é obrigatório.",
  }),
  // Novos campos para NF
  cpf: z
    .string()
    .optional()
    .refine((val) => !val || cpfRegex.test(val), {
      message: "CPF deve ter formato válido (000.000.000-00).",
    }),
  dateOfBirth: z.string().optional(), // ISO date string
  // Endereço
  street: z.string().optional(),
  streetNumber: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z
    .string()
    .optional()
    .refine((val) => !val || cepRegex.test(val), {
      message: "CEP deve ter formato válido (00000-000).",
    }),
});

export type UpsertPatientSchema = z.infer<typeof upsertPatientSchema>;
