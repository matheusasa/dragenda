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
      const clinics = await db.query.usersToClinicsTable.findMany({
        where: eq(schema.usersToClinicsTable.userId, user.id),
      });
      const clinic = clinics[0];
      const clinicName = await db.query.clinicsTable
        .findFirst({
          where: eq(schema.clinicsTable.id, clinic?.clinicId),
        })
        .then((clinic) => clinic?.name || null);
      return {
        user: {
          ...user,
          clinic: { id: clinic?.clinicId || null, name: clinicName },
        },
        session,
      };
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
