"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import UpsertReportForm from "./upsert-report-form";

interface AddReportButtonProps {
  patientId?: string;
  appointmentId?: string;
}

const AddReportButton = ({
  patientId,
  appointmentId,
}: AddReportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo relatório
        </Button>
      </DialogTrigger>
      <UpsertReportForm
        onSuccess={() => setIsOpen(false)}
        isOpen={isOpen}
        defaultPatientId={patientId}
        defaultAppointmentId={appointmentId}
      />
    </Dialog>
  );
};

export default AddReportButton;
