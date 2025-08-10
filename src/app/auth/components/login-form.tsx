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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres." })
    .max(50),
});
const LoginForm = () => {
  const formLogin = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmitLogin(values: z.infer<typeof loginSchema>) {
    // Handle login logic here
    console.log(values);
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
                    <Input placeholder="Sua senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Entrar
            </Button>{" "}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default LoginForm;
