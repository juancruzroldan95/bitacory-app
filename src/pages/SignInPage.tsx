import { SignInForm } from "@/components/chat/SignInForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Bitacory</h1>
          <p className="mt-2 text-muted-foreground">
            Asistente de chat con IA. Iniciá sesión para comenzar.
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
