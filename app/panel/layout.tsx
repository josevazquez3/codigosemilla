import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Panel de membresía",
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/ingresar");

  return <PanelShell user={user}>{children}</PanelShell>;
}
