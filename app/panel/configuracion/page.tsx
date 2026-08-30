import { SettingsBoard } from "@/components/panel/SettingsBoard";
import { getSettings } from "@/lib/panel-data";

export default async function ConfiguracionPage() {
  const settings = await getSettings();

  return (
    <section className="mx-auto max-w-6xl">
      <SettingsBoard settings={settings} />
    </section>
  );
}
