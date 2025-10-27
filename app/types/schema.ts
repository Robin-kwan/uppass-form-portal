export type AnyRecord = Record<string, any>;

export type FieldType = "Text" | "Number" | "Radio" | "Select";

export interface EnumOption {
  label: string;
  value: string;
}

export interface DisplayMeta {
  label?: string;
  placeholder?: string;
  hint?: string;
}

export interface ValueConstraints {
  maximum?: number;
  minimum?: number;
  allow_decimal?: number; // number of decimal places allowed (0 = integer only)
  allow_negative?: boolean; // allow minus sign
}

// The schema format consumed by FormBuilder and produced by export
export interface RawItem {
  name: string;
  type: FieldType;
  display?: DisplayMeta;
  required?: boolean; // true when field is required
  enum?: EnumOption[]; // for Radio and Select
  visible?: string | Record<string, string> | { field: string; equals: any };
  rules?: Record<string, any>; // validation/UI rules (e.g., { maxlength: 280 })
  prefill?: { value?: any };
  value_constraints?: ValueConstraints;
}

export interface RawSchema {
  name: string;
  label?: string;
  endpoint?: string;
  // Accept either array or object map of items
  items: RawItem[] | Record<string, RawItem>;
}

// Saved schema for the Builder UI (extends RawSchema, keeps item list with editor helpers)
export interface SavedItem extends RawItem {
  __key: string; // stable key for drag/drop
  rulesJson: string; // text area for editing rules as JSON
  visibleRaw?: string; // raw string or JSON entered by user
  prefillValue?: string | number; // editor input before normalization into prefill.value
}

export interface SavedSchema extends Omit<RawSchema, "items"> {
  items: SavedItem[];
}
