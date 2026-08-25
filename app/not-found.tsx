import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">
      <div className="text-center">
        <h1 className="mb-4 font-heading text-4xl">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Esta página no existe.
        </p>
        <Link href="/" className="text-primary underline hover:text-primary/90">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
