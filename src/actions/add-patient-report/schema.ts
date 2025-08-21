import { z } from "zod";

export const addPatientReportSchema = z.object({
  patientId: z.string().uuid({ message: "Paciente é obrigatório." }),
  professionalId: z.string().uuid({ message: "Profissional é obrigatório." }),
  appointmentId: z.string().uuid({ message: "Consulta é obrigatória." }),
  title: z.string().min(1, { message: "Título é obrigatório." }),
  content: z.string().min(1, { message: "Conteúdo é obrigatório." }),
});

export type AddPatientReportSchema = z.infer<typeof addPatientReportSchema>;
