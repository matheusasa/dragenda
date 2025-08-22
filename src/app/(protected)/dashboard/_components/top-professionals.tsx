import { Stethoscope } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface TopProfessionalsProps {
  doctors: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    specialty: string | null;
    appointments: number;
  }[];
}

export default function TopProfessionals({ doctors }: TopProfessionalsProps) {
  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-muted-foreground" />
            <CardTitle className="text-base">Profissionais</CardTitle>
          </div>
        </div>

        {/* Professionals List */}
        <div className="space-y-6">
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-100 text-lg font-medium text-gray-600">
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm">{doctor.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {doctor.specialty || "Sem especialidade"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-sm font-medium">
                    {doctor.appointments} agend.
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">
                Nenhum profissional encontrado no período
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Cadastre profissionais e agendamentos para ver as estatísticas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
