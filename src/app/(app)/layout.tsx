import { Protected } from "@/components/protected";
import { CategoriaProvider } from "@/lib/categoria-context";
import { Navbar } from "@/components/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected>
      <CategoriaProvider>
        <div className="min-h-screen bg-bg-primary">
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
        </div>
      </CategoriaProvider>
    </Protected>
  );
}
