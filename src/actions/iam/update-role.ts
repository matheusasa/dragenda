"use server";
import { db } from "@/db";
import { usersToClinicsTable, roleEnum } from "@/db/schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

export const updateRoleSchema = z.object({
  userId: z.string(),
  clinicId: z.string().uuid(),
  role: z.enum(["admin", "recepcao", "psicologo"]),
});

export async function updateUserRole(input: {
  userId: string;
  clinicId: string;
  role: "admin" | "recepcao" | "psicologo";
}) {
  const { userId, clinicId, role } = input;
  await db
    .update(usersToClinicsTable)
    .set({ role })
    .where(
      and(
        eq(usersToClinicsTable.userId, userId),
        eq(usersToClinicsTable.clinicId, clinicId)
      )
    );
}
