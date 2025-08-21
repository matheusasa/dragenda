import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schema";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  plugins: [
    customSession(async ({ user, session }) => {
      try {
        // Buscar o vínculo usuário-clínica
        const userClinicLink = await db.query.usersToClinicsTable.findFirst({
          where: eq(schema.usersToClinicsTable.userId, user.id),
        });

        if (!userClinicLink) {
          return {
            user: {
              ...user,
              role: undefined,
              clinic: undefined,
            },
            session,
          };
        }

        // Buscar os dados da clínica separadamente
        const clinic = await db.query.clinicsTable.findFirst({
          where: eq(schema.clinicsTable.id, userClinicLink.clinicId),
        });

        return {
          user: {
            ...user,
            role: userClinicLink.role,
            clinic: clinic ? { id: clinic.id, name: clinic.name } : undefined,
          },
          session,
        };
      } catch (error) {
        console.error("Erro no customSession:", error);
        return {
          user: {
            ...user,
            role: undefined,
            clinic: undefined,
          },
          session,
        };
      }
    }),
  ],
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionTable",
  },
  account: {
    modelName: "accountTable",
  },
  verification: {
    modelName: "verificationTable",
  },
  emailAndPassword: {
    enabled: true,
  },
});
