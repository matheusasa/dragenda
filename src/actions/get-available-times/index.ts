"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  appointmentsTable,
  professionalProfilesTable,
  blockedTimesTable,
} from "@/db/schema";
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

    // Buscar horários bloqueados para o profissional na data específica
    const blockedTimes = await db.query.blockedTimesTable.findMany({
      where: (table, { eq, and, or }) =>
        and(
          eq(table.professionalId, parsedInput.doctorId),
          or(
            // Bloqueio específico para esta data
            eq(table.date, new Date(parsedInput.date)),
            // Bloqueio recorrente que inclui o dia da semana atual
            and(
              eq(table.isRecurring, true)
              // Verificaremos o recurringDays no JavaScript
            )
          )
        ),
    });

    const appointmentsOnSelectedDate = appointments
      .filter((appointment) => {
        return dayjs(appointment.date).isSame(parsedInput.date, "day");
      })
      .map((appointment) => dayjs(appointment.date).format("HH:mm:ss"));

    // Processar horários bloqueados
    const blockedTimesOnDate: string[] = [];
    const currentDayOfWeek = dayjs(parsedInput.date).day();

    blockedTimes.forEach((blocked) => {
      let isBlockedOnThisDate = false;

      // Se é um bloqueio específico para esta data
      if (dayjs(blocked.date).isSame(parsedInput.date, "day")) {
        isBlockedOnThisDate = true;
      }

      // Se é um bloqueio recorrente e inclui o dia da semana atual
      if (blocked.isRecurring && blocked.recurringDays) {
        try {
          const recurringDays = JSON.parse(blocked.recurringDays);
          if (
            Array.isArray(recurringDays) &&
            recurringDays.includes(currentDayOfWeek)
          ) {
            isBlockedOnThisDate = true;
          }
        } catch (e) {
          // Ignorar erro de parse do JSON
        }
      }

      if (isBlockedOnThisDate) {
        // Gerar todos os slots de tempo entre timeFrom e timeTo
        const timeFromMinutes =
          parseInt(blocked.timeFrom.split(":")[0]) * 60 +
          parseInt(blocked.timeFrom.split(":")[1]);
        const timeToMinutes =
          parseInt(blocked.timeTo.split(":")[0]) * 60 +
          parseInt(blocked.timeTo.split(":")[1]);

        // Adicionar todos os slots de 30 minutos no intervalo bloqueado
        for (
          let minutes = timeFromMinutes;
          minutes < timeToMinutes;
          minutes += 30
        ) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const timeString = `${hours.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:00`;
          blockedTimesOnDate.push(timeString);
        }
      }
    });
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
      const isAppointmentBooked = appointmentsOnSelectedDate.includes(time);
      const isTimeBlocked = blockedTimesOnDate.includes(time);

      return {
        value: time,
        available: !isAppointmentBooked && !isTimeBlocked,
        label: time.substring(0, 5),
        blockedReason: isTimeBlocked ? "Horário bloqueado" : undefined,
      };
    });
  });
