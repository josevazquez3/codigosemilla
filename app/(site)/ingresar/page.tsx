import { redirect } from "next/navigation";
import { IngresarClient } from "./ingresar-client";
import { getSessionUser } from "@/lib/auth";

export default async function IngresarPage() {
  const user = await getSessionUser();
  if (user) redirect("/panel");
  return <IngresarClient />;
}
