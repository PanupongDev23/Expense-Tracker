import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const registered = params.registered === "1";

  return <LoginForm registered={registered} />;
}
