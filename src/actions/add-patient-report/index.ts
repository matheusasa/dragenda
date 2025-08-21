"use server";

import { db } from "@/db";
import { patientReportsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";
import { addPatientReportSchema } from "./schema";

export const addPatientReport = protectedWithClinicActionClient
  .schema(addPatientReportSchema)
  .action(async ({ parsedInput }) => {
    await db.insert(patientReportsTable).values({
      ...parsedInput,
    });
    revalidatePath("/appointments");
  });
