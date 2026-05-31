import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-display text-primary mb-4">POS AI</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Platform Point of Sale, Inventory, dan Manajemen Bisnis terintegrasi.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-border bg-surface hover:bg-muted font-medium transition-colors"
          >
            Daftar
          </Link>
        </div>
      </div>
    </main>
  );
}
