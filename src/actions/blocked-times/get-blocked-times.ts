"use server";

import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { blockedTimesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

export const getBlockedTimes = protectedWithClinicActionClient
  .schema(
    z.object({
      professionalId: z.string().optional(),
      date: z.string().date().optional(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const clinicId = ctx.user.clinic!.id;

    let whereConditions = [eq(blockedTimesTable.clinicId, clinicId)];

    if (parsedInput.professionalId) {
      whereConditions.push(
        eq(blockedTimesTable.professionalId, parsedInput.professionalId)
      );
    }

    if (parsedInput.date) {
      whereConditions.push(
        eq(blockedTimesTable.date, new Date(parsedInput.date))
      );
    }

    const blockedTimes = await db.query.blockedTimesTable.findMany({
      where: and(...whereConditions),
      with: {
        professional: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (table, { asc }) => [asc(table.date), asc(table.timeFrom)],
    });

    return blockedTimes.map((blockedTime) => ({
      ...blockedTime,
      recurringDays: blockedTime.recurringDays
        ? JSON.parse(blockedTime.recurringDays)
        : null,
    }));
  });
