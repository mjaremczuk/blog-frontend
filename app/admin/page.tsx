import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminForm from "@/components/AdminForm";

// Ensure page is evaluated dynamically at request time
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Server-side authentication check
  if (!token) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel Administratora</h1>
          <p className="text-sm text-muted-foreground">Dodaj nowy artykuł na swoim blogu.</p>
        </div>
      </div>
      
      <hr className="border-border" />
      
      <AdminForm token={token} />
    </div>
  );
}
