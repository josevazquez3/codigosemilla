import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSessionUser } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <>
      <Header loggedIn={Boolean(user)} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
