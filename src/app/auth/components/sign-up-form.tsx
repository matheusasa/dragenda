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
const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres." })
    .max(50),
  email: z.string().email({ message: "Email inválido." }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres." })
    .max(50),
});

const SignUpForm = () => {
  const formRegister = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmitRegister(values: z.infer<typeof registerSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <Card>
      <Form {...formRegister}>
        <form
          onSubmit={formRegister.handleSubmit(onSubmitRegister)}
          className="space-y-4"
        >
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>Crie uma conta para continuar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={formRegister.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRegister.control}
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
              control={formRegister.control}
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
              Registrar-se
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SignUpForm;
