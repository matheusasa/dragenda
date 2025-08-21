"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { getUserAppointments } from "@/actions/reports/get-user-appointments";

interface AppointmentWithPatient {
  id: string;
  date: Date;
  patient: {
    id: string;
    name: string;
  };
}

export function useUserAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const getUserAppointmentsAction = useAction(getUserAppointments, {
    onSuccess: (result) => {
      setAppointments(result.data || []);
      setLoading(false);
    },
    onError: (error) => {
      console.error("Erro ao buscar agendamentos:", error);
      setAppointments([]);
      setLoading(false);
    },
  });

  useEffect(() => {
    getUserAppointmentsAction.execute();
  }, []);

  return {
    appointments,
    loading,
    refetch: () => getUserAppointmentsAction.execute(),
  };
}
