export const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold font-serif mb-4">Bienvenido a Bitacory</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-lg">
        Tu espacio seguro para escribir, conversar y reflexionar.
      </p>
      <a 
        href="/auth/login" 
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Ingresar
      </a>
    </div>
  );
};
