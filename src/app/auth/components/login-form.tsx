"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres." })
    .max(50),
});
const LoginForm = () => {
  const router = useRouter();
  const formLogin = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmitLogin(values: z.infer<typeof loginSchema>) {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (error) => {
          console.error("Email ou senha inválidos.", error);
        },
      }
    );
  }
  return (
    <Card>
      <Form {...formLogin}>
        <form
          onSubmit={formLogin.handleSubmit(onSubmitLogin)}
          className="space-y-4"
        >
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Faça login na sua conta para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={formLogin.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formLogin.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Sua senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={formLogin.formState.isSubmitting}
            >
              {formLogin.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Entrar"
              )}
            </Button>{" "}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default LoginForm;
