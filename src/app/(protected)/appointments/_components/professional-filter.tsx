"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, User, CheckCircle2, Circle } from "lucide-react";

interface Professional {
  id: string;
  name: string;
}

interface ProfessionalFilterProps {
  professionals: Professional[];
  selectedProfessionals: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  appointmentCounts?: Record<string, number>;
}

const ProfessionalFilter = ({
  professionals,
  selectedProfessionals,
  onSelectionChange,
  appointmentCounts = {},
}: ProfessionalFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectAll = () => {
    onSelectionChange(professionals.map((p) => p.id));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleToggleProfessional = (professionalId: string) => {
    const isSelected = selectedProfessionals.includes(professionalId);
    if (isSelected) {
      onSelectionChange(
        selectedProfessionals.filter((id) => id !== professionalId)
      );
    } else {
      onSelectionChange([...selectedProfessionals, professionalId]);
    }
  };

  const allSelected = selectedProfessionals.length === professionals.length;
  const noneSelected = selectedProfessionals.length === 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtrar Psicólogos
          {!noneSelected && (
            <Badge variant="secondary" className="ml-2">
              {selectedProfessionals.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Selecionar Psicólogos
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={allSelected}
              >
                Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={noneSelected}
              >
                Nenhum
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {professionals.map((professional) => {
              const isSelected = selectedProfessionals.includes(
                professional.id
              );
              const count = appointmentCounts[professional.id] || 0;

              return (
                <div
                  key={professional.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-muted p-2 rounded-md"
                  onClick={() => handleToggleProfessional(professional.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => {}} // Controlado pelo onClick do div
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {professional.name}
                      </span>
                      {count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {count}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}

            {professionals.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Nenhum psicólogo encontrado
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default ProfessionalFilter;
