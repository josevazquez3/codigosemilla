import { panelNav } from "@/lib/panel-nav";

export function moduleFromPath(path: string) {
  const clean = path.split("?")[0] || "/panel";
  const pairs: Array<[string, string]> = [];

  for (const item of panelNav) {
    if (item.href) pairs.push([item.href, item.label]);
    for (const child of item.children ?? []) {
      pairs.push([child.href, child.label]);
    }
  }
  pairs.sort((a, b) => b[0].length - a[0].length);

  const match = pairs.find(([href]) => clean === href || clean.startsWith(`${href}/`));
  return {
    key: match?.[0] ?? clean,
    label: match?.[1] ?? "Inicio",
  };
}
