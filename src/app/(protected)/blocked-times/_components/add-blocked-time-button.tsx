"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import AddBlockedTimeForm from "./add-blocked-time-form";

interface Professional {
  id: string;
  name: string;
}

interface AddBlockedTimeButtonProps {
  professionals: Professional[];
  onSuccess?: () => void;
}

export default function AddBlockedTimeButton({
  professionals,
  onSuccess,
}: AddBlockedTimeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Bloquear Horário
        </Button>
      </DialogTrigger>
      <AddBlockedTimeForm
        professionals={professionals}
        onSuccess={handleSuccess}
      />
    </Dialog>
  );
}
