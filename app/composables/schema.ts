import type { SavedSchema, RawSchema, SavedItem, AnyRecord } from "~/types/schema";

export const convertSavedToSchema = (entry: SavedSchema): RawSchema => {
  if (!Array.isArray(entry.items)) return entry;
  const itemsMap: AnyRecord = {};
  for (const it of (entry.items as SavedItem[]) || []) {
    const name = (it?.name || "").trim();
    if (!name) continue;
    let visible: any = undefined;
    let vr: string = it?.visibleRaw?.toString?.().trim?.() || "";
    if (!vr) {
      const vAlt: any = (it as any)?.visible;
      if (vAlt !== undefined && vAlt !== null) {
        vr = typeof vAlt === "object" ? JSON.stringify(vAlt) : String(vAlt);
      }
    }
    if (vr) {
      if (vr.startsWith("{")) {
        try {
          visible = JSON.parse(vr);
        } catch {
          visible = vr;
        }
      } else {
        visible = vr;
      }
    }
    const isNumber = it?.type === "Number";
    const prefillVal = it?.prefillValue;
    const prefill =
      prefillVal !== undefined && prefillVal !== ""
        ? {
            value:
              isNumber && !Number.isNaN(Number(prefillVal))
                ? Number(prefillVal)
                : prefillVal,
          }
        : undefined;
    itemsMap[name] = {
      name,
      display: { ...(it?.display || {}) },
      required: !!it?.required,
      rules: it?.rules || undefined,
      type: it?.type,
      enum:
        it?.type === "Radio" || it?.type === "Select"
          ? (it?.enum || []).filter((o: any) => o?.label || o?.value)
          : undefined,
      value_constraints:
        it?.type === "Number" ? it?.value_constraints || {} : undefined,
      visible,
      prefill,
    };
  }
  return {
    name: entry.name,
    label: entry.label,
    endpoint: entry.endpoint,
    items: itemsMap,
  };
};
