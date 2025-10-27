import type { AnyRecord, RawItem } from "~/types/schema";

export const isItemRequired = (item: RawItem): boolean => item?.required === true;

export const isItemVisible = (item: RawItem, formData: AnyRecord): boolean => {
  if (!item?.visible) return true;

  const evalRulesForField = (field: string, rulesStr: string): boolean => {
    return String(rulesStr)
      .split("|")
      .every((r) => {
        const rule = r.trim();
        if (!rule) return true;
        if (rule === "required") {
          const v = formData[field];
          return v !== undefined && v !== null && v !== "";
        }
        if (rule.startsWith("is:")) {
          const expectedValue = rule.slice(3);
          return formData[field] === expectedValue;
        }
        return true; // unknown rule -> ignore
      });
  };

  if (typeof item.visible === "string") {
    // "field:required|field:is:value"
    return item.visible.split("|").every((segment) => {
      const [field, cond, extra] = segment.split(":");
      if (!field || !cond) return true;
      if (cond === "required") return evalRulesForField(field, "required");
      if (cond === "is") return evalRulesForField(field, `is:${extra ?? ""}`);
      if (cond.startsWith("is"))
        return evalRulesForField(field, cond + (extra ? ":" + extra : ""));
      return true;
    });
  }

  const vis: any = item.visible as any;
  if (typeof vis === "object" && ("field" in vis || "equals" in vis)) {
    const vField = String(vis.field || "").trim();
    const expected = vis.equals;
    if (!vField) return true;
    return formData[vField] === expected;
  }

  return Object.entries(item.visible as Record<string, string>).every(
    ([field, rulesStr]) => evalRulesForField(field, rulesStr as string)
  );
};

export const isFilled = (val: any): boolean =>
  val !== undefined && val !== null && val !== "";

