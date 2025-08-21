"use client";

import { TrashIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    clinic: string;
  };
  onEdit?: (user: any) => void;
  onDelete?: (user: any) => void;
}

const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
  const userInitials = user.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{user.name}</h3>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2">
        <Badge variant="outline">Papel: {user.role}</Badge>
        <Badge variant="outline">Clínica: {user.clinic}</Badge>
      </CardContent>
      <Separator />
      <CardFooter className="flex gap-2">
        <Button className="w-full" onClick={() => onEdit?.(user)}>
          Editar
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onDelete?.(user)}
        >
          <TrashIcon />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserCard;
