"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, professionalProfilesTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/time";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action.server";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = protectedWithClinicActionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string().date(), // YYYY-MM-DD,
    })
  )
  .action(async ({ parsedInput }) => {
    // Buscar perfil profissional pelo userId
    const profile = await db.query.professionalProfilesTable.findFirst({
      where: eq(professionalProfilesTable.userId, parsedInput.doctorId),
    });
    if (!profile) {
      throw new Error("Perfil profissional não encontrado");
    }
    // Extrair valores de disponibilidade com fallback para evitar null
    const availableFromWeekDay = profile.availableFromWeekDay ?? 0;
    const availableToWeekDay = profile.availableToWeekDay ?? 6;
    const availableFromTime = profile.availableFromTime ?? "00:00:00";
    const availableToTime = profile.availableToTime ?? "23:59:59";
    const selectedDayOfWeek = dayjs(parsedInput.date).day();
    const doctorIsAvailable =
      selectedDayOfWeek >= availableFromWeekDay &&
      selectedDayOfWeek <= availableToWeekDay;
    if (!doctorIsAvailable) {
      return [];
    }
    const appointments = await db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.professionalId, parsedInput.doctorId),
    });
    const appointmentsOnSelectedDate = appointments
      .filter((appointment) => {
        return dayjs(appointment.date).isSame(parsedInput.date, "day");
      })
      .map((appointment) => dayjs(appointment.date).format("HH:mm:ss"));
    const timeSlots = generateTimeSlots();

    const availableFrom = dayjs()
      .utc()
      .set("hour", Number(availableFromTime.split(":")[0]))
      .set("minute", Number(availableFromTime.split(":")[1]))
      .set("second", 0)
      .local();
    const availableTo = dayjs()
      .utc()
      .set("hour", Number(availableToTime.split(":")[0]))
      .set("minute", Number(availableToTime.split(":")[1]))
      .set("second", 0)
      .local();
    const profileTimeSlots = timeSlots.filter((time) => {
      const date = dayjs()
        .utc()
        .set("hour", Number(time.split(":")[0]))
        .set("minute", Number(time.split(":")[1]))
        .set("second", 0);

      return (
        date.format("HH:mm:ss") >= availableFrom.format("HH:mm:ss") &&
        date.format("HH:mm:ss") <= availableTo.format("HH:mm:ss")
      );
    });
    return profileTimeSlots.map((time) => {
      return {
        value: time,
        available: !appointmentsOnSelectedDate.includes(time),
        label: time.substring(0, 5),
      };
    });
  });
