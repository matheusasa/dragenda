import {
  Activity,
  Baby,
  Bone,
  Brain,
  Eye,
  Hand,
  Heart,
  Hospital,
  Stethoscope,
} from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopSpecialtiesProps {
  topSpecialties: {
    specialty: string | null;
    appointments: number;
  }[];
}

const getSpecialtyIcon = (specialty: string | null) => {
  if (!specialty) return Stethoscope; // Ícone padrão para especialidade null

  const specialtyLower = specialty.toLowerCase();

  if (specialtyLower.includes("cardiolog")) return Heart;
  if (
    specialtyLower.includes("ginecolog") ||
    specialtyLower.includes("obstetri")
  )
    return Baby;
  if (specialtyLower.includes("pediatr")) return Activity;
  if (specialtyLower.includes("dermatolog")) return Hand;
  if (
    specialtyLower.includes("ortoped") ||
    specialtyLower.includes("traumatolog")
  )
    return Bone;
  if (specialtyLower.includes("oftalmolog")) return Eye;
  if (
    specialtyLower.includes("neurolog") ||
    specialtyLower.includes("psicolog") ||
    specialtyLower.includes("psiquiatr")
  )
    return Brain;

  return Stethoscope;
};

export default function TopSpecialties({
  topSpecialties,
}: TopSpecialtiesProps) {
  const maxAppointments =
    topSpecialties.length > 0
      ? Math.max(...topSpecialties.map((i) => i.appointments))
      : 0;

  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hospital className="text-muted-foreground" />
            <CardTitle className="text-base">Especialidades</CardTitle>
          </div>
        </div>

        {/* specialtys List */}
        <div className="space-y-6">
          {topSpecialties.length > 0 ? (
            topSpecialties.map((specialty) => {
              const Icon = getSpecialtyIcon(specialty.specialty);
              // Porcentagem de ocupação da especialidade baseando-se no maior número de agendamentos
              const progressValue =
                (specialty.appointments / maxAppointments) * 100;

              return (
                <div
                  key={specialty.specialty || "sem-especialidade"}
                  className="flex items-center gap-2"
                >
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                    <Icon className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex w-full flex-col justify-center">
                    <div className="flex w-full justify-between">
                      <h3 className="text-sm">
                        {specialty.specialty || "Sem especialidade"}
                      </h3>
                      <div className="text-right">
                        <span className="text-muted-foreground text-sm font-medium">
                          {specialty.appointments} agend.
                        </span>
                      </div>
                    </div>
                    <Progress value={progressValue} className="w-full" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Hospital className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">
                Nenhuma especialidade encontrada no período
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Cadastre profissionais com especialidades para ver as
                estatísticas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
