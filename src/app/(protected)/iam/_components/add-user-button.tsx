"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import UpsertUserForm from "./upsert-user-form";

const AddUserButton = ({ clinicId }: { clinicId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar usuario
        </Button>
      </DialogTrigger>
      <UpsertUserForm onSuccess={() => setIsOpen(false)} clinicId={clinicId} />
    </Dialog>
  );
};

export default AddUserButton;
