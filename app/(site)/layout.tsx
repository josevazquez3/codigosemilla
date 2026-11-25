import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LeavesBackdrop } from "@/components/ui/LeavesBackdrop";
import { getSessionUser } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <>
      <LeavesBackdrop />
      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <Header loggedIn={Boolean(user)} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
