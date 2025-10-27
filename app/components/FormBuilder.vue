<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div
        v-for="(item, index) in itemsList"
        :key="item.name ?? index"
      >
        <template v-if="isVisible(item)">
          <div class="mb-4">
            <!-- Text -->
            <v-text-field
              v-if="item.type === ItemEnum.text"
              v-model="formData[item.name]"
              :label="labelWithAsterisk(item)"
              :placeholder="item.display?.placeholder"
              :counter="textMaxLength(item) || undefined"
              :maxlength="textMaxLength(item) || undefined"
              :rules="textRules(item)"
              :hint="item.display?.hint"
              :persistent-hint="!!item.display?.hint"
              :required="isRequired(item)"
            />
            <!-- Number -->
            <v-text-field
              v-if="item.type === ItemEnum.number"
              :model-value="formData[item.name]"
              :label="labelWithAsterisk(item)"
              :placeholder="item.display?.placeholder"
              :type="allowDecimal(item) ? 'number' : 'text'"
              :step="numberStep(item)"
              :inputmode="numberInputMode(item)"
              :pattern="numberPattern(item)"
              :max="maxValue(item) ?? undefined"
              :min="minValue(item) ?? undefined"
              :rules="numberRules(item)"
              @update:modelValue="(val: any) => onNumberInput(item, val)"
              :hint="item.display?.hint"
              :persistent-hint="!!item.display?.hint"
              :required="isRequired(item)"
            />
            <!-- Radio -->
            <v-radio-group
              v-if="item.type === ItemEnum.radio"
              v-model="formData[item.name]"
              :label="labelWithAsterisk(item)"
              :required="isRequired(item)"
              :class="{ 'ml-n2': item.display?.label }"
            >
              <v-radio
                v-for="option in item.enum"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </v-radio-group>
            <!-- Select -->
            <v-select
              v-if="item.type === ItemEnum.select"
              v-model="formData[item.name]"
              :label="labelWithAsterisk(item)"
              :placeholder="item.display?.placeholder"
              :items="item.enum || []"
              item-title="label"
              item-value="value"
              :hint="item.display?.hint"
              :persistent-hint="!!item.display?.hint"
              :required="isRequired(item)"
            />
          </div>
        </template>
      </div>
      <v-btn
        v-if="showSubmit"
        type="submit"
        color="primary"
        class="mt-4"
        >Submit</v-btn
      >
    </form>
  </div>
</template>

<script setup lang="ts">
import type { RawSchema, RawItem } from "~/types/schema";
import { isItemVisible, isItemRequired } from "~/composables/visibility";

enum ItemEnum {
  radio = "Radio",
  select = "Select",
  text = "Text",
  number = "Number",
}

const props = defineProps<{
  schema: RawSchema;
  modelValue?: Record<string, any>;
  showSubmit?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: Record<string, any>): void;
  (e: "submit", v: Record<string, any>): void;
}>();

const formData = ref<Record<string, any>>(
  props.modelValue ? { ...props.modelValue } : {}
);

// Normalize items to an array for rendering regardless of source shape
const itemsList = computed<RawItem[]>(() => {
  const items = props.schema.items as any;
  return Array.isArray(items) ? items : Object.values(items ?? {});
});

// Initialize form data with any provided prefill values
onMounted(() => {
  for (const item of itemsList.value) {
    if (
      item?.name &&
      item?.prefill?.value !== undefined &&
      formData.value[item.name] === undefined
    ) {
      formData.value[item.name] = item.prefill.value;
    }
  }
});

// Keep formData in sync with v-model from parent
watch(
  formData,
  (val) => {
    emit("update:modelValue", { ...val });
  },
  { deep: true }
);

const isVisible = (item: RawItem): boolean =>
  isItemVisible(item, formData.value as any);

const handleSubmit = (): void => {
  emit("submit", { ...formData.value }); // Logic to handle form submission
};
// Required helpers for red asterisk
const isRequired = (item: RawItem): boolean => isItemRequired(item);
const labelWithAsterisk = (item: RawItem): string | undefined => {
  const base = item.display?.label as string | undefined;
  if (!base) return base;
  return isRequired(item) ? base + "*" : base;
};

// Text field helpers
const textMaxLength = (item: RawItem): number | undefined =>
  (item as any)?.rules?.maxlength ?? undefined;

const textRules = (item: RawItem) => {
  const rulesArr: Array<(v: any) => true | string> = [];
  const max = textMaxLength(item);
  if (typeof max === "number" && Number.isFinite(max)) {
    rulesArr.push((v: any) => {
      const len = (v ?? "").toString().length;
      return len <= max || `Maximum length is ${max} characters`;
    });
  }
  if (isRequired(item)) {
    rulesArr.push((v: any) => {
      const has = v !== undefined && v !== null && v !== "";
      return has || "This field is required";
    });
  }
  return rulesArr;
};

// Number field helpers
const decimalPlacesAllowed = (item: RawItem): number =>
  Math.max(0, Number(item?.value_constraints?.allow_decimal ?? 0)) || 0;
const allowDecimal = (item: RawItem): boolean => decimalPlacesAllowed(item) > 0;
const maxValue = (item: RawItem): number | undefined =>
  item?.value_constraints?.maximum ?? undefined;
const minValue = (item: RawItem): number | undefined =>
  item?.value_constraints?.minimum ?? undefined;
const numberStep = (item: RawItem): string => {
  const dp = decimalPlacesAllowed(item);
  if (dp <= 0) return "1";
  return String(1 / Math.pow(10, dp));
};

const allowNegative = (item: RawItem): boolean =>
  !!item?.value_constraints?.allow_negative;
const numberInputMode = (item: RawItem): string => {
  if (allowDecimal(item)) return "decimal";
  return allowNegative(item) ? "decimal" : "numeric";
};

const numberPattern = (item: RawItem): string | undefined => {
  if (allowDecimal(item)) return undefined; // pattern not reliable with type=number
  return allowNegative(item) ? "^-?\\d*$" : "\\d*";
};

const numberRules = (item: RawItem) => {
  const rulesArr: Array<(v: any) => true | string> = [];
  if (isRequired(item)) {
    rulesArr.push((v: any) => {
      const has = v !== undefined && v !== null && v !== "";
      return has || "This field is required";
    });
  }
  rulesArr.push((v: any) => {
    if (v === "" || v === null || v === undefined) return true;
    const t = typeof v === "string" ? v.replace(",", ".") : v;
    return !Number.isNaN(Number(t)) || "Must be a number";
  });
  if (!allowDecimal(item)) {
    rulesArr.push((v: any) => {
      if (v === "" || v === null || v === undefined) return true;
      const t = typeof v === "string" ? v.replace(",", ".") : v;
      return Number.isInteger(Number(t)) || "Must be an integer";
    });
  }
  if (allowDecimal(item)) {
    const dp = decimalPlacesAllowed(item);
    rulesArr.push((v: any) => {
      if (v === "" || v === null || v === undefined) return true;
      const s = String(v).replace(",", ".");
      const i = s.indexOf(".");
      if (i < 0) return true;
      const places = s.length - i - 1;
      return places <= dp || `Up to ${dp} decimal place${dp === 1 ? "" : "s"}`;
    });
  }
  const max = maxValue(item);
  if (typeof max === "number" && Number.isFinite(max)) {
    rulesArr.push((v: any) => {
      if (v === "" || v === null || v === undefined) return true;
      const t = typeof v === "string" ? v.replace(",", ".") : v;
      return Number(t) <= max || `Maximum value is ${max}`;
    });
  }
  const min = minValue(item);
  if (typeof min === "number" && Number.isFinite(min)) {
    rulesArr.push((v: any) => {
      if (v === "" || v === null || v === undefined) return true;
      const t = typeof v === "string" ? v.replace(",", ".") : v;
      return Number(t) >= min || `Minimum value is ${min}`;
    });
  }
  return rulesArr;
};

const onNumberInput = (item: RawItem, raw: any) => {
  let str = raw === null || raw === undefined ? "" : String(raw);
  if (str === "") {
    formData.value[item.name] = "";
    return;
  }
  // Normalize locale decimal comma to dot
  str = str.replace(",", ".");
  if (!allowDecimal(item)) {
    // Only allow integers: block updates containing non-digits
    const re = allowNegative(item) ? /^-?\d*$/ : /^\d*$/;
    if (!re.test(str)) {
      return;
    }
    if (allowNegative(item) && str === "-") {
      // allow transient minus while typing
      formData.value[item.name] = str;
      return;
    }
  } else {
    const dp = decimalPlacesAllowed(item);
    const re = new RegExp(
      `^${allowNegative(item) ? "-?" : ""}\\d*(?:\\.\\d{0,${dp}})?$`
    );
    if (!re.test(str)) {
      return;
    }
    if (str === "-" || str === "." || str === "-.") {
      // allow transient states while typing
      formData.value[item.name] = str;
      return;
    }
  }
  let parsed = Number(str);
  if (Number.isNaN(parsed)) {
    // Keep last valid value; do not update
    return;
  }
  const max = maxValue(item);
  const min = minValue(item);
  if (typeof max === "number" && Number.isFinite(max)) {
    parsed = Math.min(parsed, max);
  }
  if (typeof min === "number" && Number.isFinite(min)) {
    parsed = Math.max(parsed, min);
  }
  formData.value[item.name] = parsed;
};
</script>

<style scoped>
/* Add any necessary styles here */
</style>
