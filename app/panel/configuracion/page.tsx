import { SettingsBoard } from "@/components/panel/SettingsBoard";
import { getMercadoPagoStatus } from "@/lib/mp-settings";
import { getSettings } from "@/lib/panel-data";

export default async function ConfiguracionPage() {
  const [settings, mercadoPago] = await Promise.all([getSettings(), getMercadoPagoStatus()]);

  return (
    <section className="mx-auto max-w-6xl">
      <SettingsBoard settings={settings} mercadoPago={mercadoPago} />
    </section>
  );
}
