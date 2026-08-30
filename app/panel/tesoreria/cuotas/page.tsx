import { redirect } from "next/navigation";

export default function CuotasRedirectPage() {
  redirect("/panel/tesoreria/pagos-mes");
}
