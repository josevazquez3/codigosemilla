import { EmptyState } from "@/components/panel/ui";
import { WhatsAppButton } from "@/components/panel/WhatsAppButton";
import { formatDate, formatMoney, type PanelPayment, type PanelUser } from "@/lib/panel-data";
import { applyTemplate, currentMonthLabel, splitName, whatsappUrl } from "@/lib/site-settings";
import type { SiteSettings } from "@/lib/site-settings";

export function isBankTransfer(method: string) {
  return method.toLowerCase().includes("transfer");
}

export function TreasuryPaymentsTable({
  payments,
  users,
  settings,
  empty,
  showContact = false,
}: {
  payments: PanelPayment[];
  users?: PanelUser[];
  settings?: SiteSettings;
  empty: string;
  showContact?: boolean;
}) {
  const usersById = new Map((users ?? []).map((user) => [user.id, user]));

  if (payments.length === 0) {
    return <EmptyState>{empty}</EmptyState>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#e3eee0] text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
            <th className="py-3 font-medium">Persona</th>
            <th className="py-3 font-medium">Monto</th>
            <th className="py-3 font-medium">Medio</th>
            <th className="py-3 font-medium">Fecha</th>
            <th className="py-3 font-medium">Referencia</th>
            {showContact ? <th className="py-3 font-medium">Contacto</th> : null}
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-[#f0f5ee]">
              <td className="py-3">
                <p className="font-medium text-primary">{payment.userName}</p>
                {payment.notes ? (
                  <p className="text-xs text-muted-foreground">{payment.notes}</p>
                ) : null}
              </td>
              <td className="py-3 text-primary">
                {formatMoney(payment.amountCents, payment.currency)}
              </td>
              <td className="py-3 text-muted-foreground">{payment.method}</td>
              <td className="py-3 text-muted-foreground">{formatDate(payment.paidAt)}</td>
              <td className="py-3 text-muted-foreground">{payment.reference || "—"}</td>
              {showContact && settings ? (
                <td className="py-3">
                  <WhatsAppButton
                    href={(() => {
                      const user = usersById.get(payment.userId);
                      if (!user?.phone) return "";
                      const names = splitName(user.name);
                      return whatsappUrl(
                        user.phone,
                        applyTemplate(settings.messagePaymentMonth, {
                          ...names,
                          mes: currentMonthLabel(),
                        }),
                      );
                    })()}
                  />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
