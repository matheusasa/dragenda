export const professionalProfilesTable = pgTable("professional_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTables.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  specialty: text("specialty"),
  availableFromWeekDay: integer("available_from_week_day"),
  availableToWeekDay: integer("available_to_week_day"),
  availableFromTime: time("available_from_time"),
  availableToTime: time("available_to_time"),
  appointmentPriceInCents: integer("appointment_price_in_cents"),
  avatarImageUrl: text("avatar_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Definir enums primeiro
export const roleEnum = pgEnum("role", ["admin", "recepcao", "psicologo"]);
export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

// Definir todas as tabelas primeiro
export const usersTables = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionTables = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTables.id, { onDelete: "cascade" }),
});

export const accountTables = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTables.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTables.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull().default("recepcao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctorsTable = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => usersTables.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  avatarImageUrl: text("avatar_image_url"),
  availableFromWeekDay: integer("available_from_week_day").notNull(),
  availableToWeekDay: integer("available_to_week_day").notNull(),
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  specialty: text("specialty").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  cpf: text("cpf").unique(), // CPF do paciente (opcional para menores)
  dateOfBirth: timestamp("date_of_birth"), // Data de nascimento
  // Endereço para NF
  street: text("street"), // Rua/Logradouro
  streetNumber: text("street_number"), // Número
  complement: text("complement"), // Complemento
  neighborhood: text("neighborhood"), // Bairro
  city: text("city"), // Cidade
  state: text("state"), // Estado
  zipCode: text("zip_code"), // CEP
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sex: patientSexEnum("sex").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  professionalId: text("professional_id")
    .notNull()
    .references(() => usersTables.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientReportsTable = pgTable("patient_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  professionalId: text("professional_id")
    .notNull()
    .references(() => usersTables.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointmentsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Tabela para auditoria de relatórios
export const reportAuditLogsTable = pgTable("report_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => patientReportsTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTables.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // 'created', 'updated', 'viewed'
  previousContent: text("previous_content"), // Conteúdo anterior (para updates)
  newContent: text("new_content"), // Novo conteúdo (para updates)
  previousTitle: text("previous_title"), // Título anterior (para updates)
  newTitle: text("new_title"), // Novo título (para updates)
  userAgent: text("user_agent"), // Informações do navegador
  ipAddress: text("ip_address"), // IP do usuário
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela para anexos de relatórios
export const reportAttachmentsTable = pgTable("report_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => patientReportsTable.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(), // Nome original do arquivo
  fileSize: integer("file_size").notNull(), // Tamanho em bytes
  mimeType: text("mime_type").notNull(), // Tipo MIME do arquivo
  fileUrl: text("file_url").notNull(), // URL onde o arquivo está armazenado
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => usersTables.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Definir todas as relations depois
export const usersTableRelations = relations(usersTables, ({ many, one }) => ({
  usersToClinics: many(usersToClinicsTable),
  patientReports: many(patientReportsTable),
  appointments: many(appointmentsTable),
  doctorProfile: one(doctorsTable, {
    fields: [usersTables.id],
    references: [doctorsTable.userId],
  }),
}));

export const usersToClinicsTableRelations = relations(
  usersToClinicsTable,
  ({ one }) => ({
    user: one(usersTables, {
      fields: [usersToClinicsTable.userId],
      references: [usersTables.id],
    }),
    clinic: one(clinicsTable, {
      fields: [usersToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  })
);

export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
}));

export const doctorsTableRelations = relations(
  doctorsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorsTable.clinicId],
      references: [clinicsTable.id],
    }),
    user: one(usersTables, {
      fields: [doctorsTable.userId],
      references: [usersTables.id],
    }),
    appointments: many(appointmentsTable),
  })
);

export const patientsTableRelations = relations(
  patientsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [patientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  })
);

export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [appointmentsTable.patientId],
      references: [patientsTable.id],
    }),
    professional: one(usersTables, {
      fields: [appointmentsTable.professionalId],
      references: [usersTables.id],
    }),
    patientReports: many(patientReportsTable),
  })
);

export const patientReportsRelations = relations(
  patientReportsTable,
  ({ one, many }) => ({
    appointment: one(appointmentsTable, {
      fields: [patientReportsTable.appointmentId],
      references: [appointmentsTable.id],
    }),
    professional: one(usersTables, {
      fields: [patientReportsTable.professionalId],
      references: [usersTables.id],
    }),
    patient: one(patientsTable, {
      fields: [patientReportsTable.patientId],
      references: [patientsTable.id],
    }),
    auditLogs: many(reportAuditLogsTable),
    attachments: many(reportAttachmentsTable),
  })
);

export const reportAuditLogsRelations = relations(
  reportAuditLogsTable,
  ({ one }) => ({
    report: one(patientReportsTable, {
      fields: [reportAuditLogsTable.reportId],
      references: [patientReportsTable.id],
    }),
    user: one(usersTables, {
      fields: [reportAuditLogsTable.userId],
      references: [usersTables.id],
    }),
  })
);

export const reportAttachmentsRelations = relations(
  reportAttachmentsTable,
  ({ one }) => ({
    report: one(patientReportsTable, {
      fields: [reportAttachmentsTable.reportId],
      references: [patientReportsTable.id],
    }),
    uploadedByUser: one(usersTables, {
      fields: [reportAttachmentsTable.uploadedBy],
      references: [usersTables.id],
    }),
  })
);

// Tabela para horários bloqueados
export const blockedTimesTable = pgTable("blocked_times", {
  id: uuid("id").defaultRandom().primaryKey(),
  professionalId: text("professional_id")
    .notNull()
    .references(() => usersTables.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(), // Data específica do bloqueio
  timeFrom: time("time_from").notNull(), // Horário de início
  timeTo: time("time_to").notNull(), // Horário de fim
  reason: text("reason"), // Motivo do bloqueio (opcional)
  isRecurring: boolean("is_recurring").default(false), // Se é recorrente
  recurringDays: text("recurring_days"), // JSON com dias da semana para recorrência
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Relações da tabela blocked_times
export const blockedTimesTableRelations = relations(
  blockedTimesTable,
  ({ one }) => ({
    professional: one(usersTables, {
      fields: [blockedTimesTable.professionalId],
      references: [usersTables.id],
    }),
    clinic: one(clinicsTable, {
      fields: [blockedTimesTable.clinicId],
      references: [clinicsTable.id],
    }),
  })
);
