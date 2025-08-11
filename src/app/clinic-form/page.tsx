"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ClinicForm from "./components/clinic-form";

const PageClinicForm = () => {
  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Formulário de Clínica</DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo para criar uma nova clínica.
          </DialogDescription>
        </DialogHeader>
        <ClinicForm />
      </DialogContent>
    </Dialog>
  );
};

export default PageClinicForm;
