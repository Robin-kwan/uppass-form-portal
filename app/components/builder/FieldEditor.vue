<template>
  <v-card-text v-if="currentItem">
    <v-form ref="editorForm">
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="currentItem.name"
            label="Field Name (unique)"
            hint="Used as items[<name>] and form key"
            persistent-hint
            :rules="nameRules"
            @blur="trimCurrentName"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-select
            v-model="currentItem.type"
            :items="typeItems"
            label="Field Type"
            item-title="label"
            item-value="value"
            hint="Determines which input renders (Text/Number/Radio/Select)"
            persistent-hint
          />
        </v-col>

        <v-col
          cols="12"
          md="6"
          v-if="currentItem.display"
        >
          <v-text-field
            v-model="currentItem.display.label"
            label="Label"
            hint="Shown above the input"
            persistent-hint
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
          v-if="currentItem.display"
        >
          <v-text-field
            v-model="currentItem.display.placeholder"
            label="Placeholder"
            hint="Shown inside the input (where supported)"
            persistent-hint
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
          v-if="currentItem.display"
        >
          <v-text-field
            v-model="currentItem.display.hint"
            label="Hint"
            hint="Helper text shown under the input"
            persistent-hint
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
          class="d-flex align-center"
        >
          <v-checkbox
            v-model="currentItem.required"
            label="Required"
            hint="Mark field as required"
            persistent-hint
            hide-details="auto"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="currentItem.rulesJson"
            label="Rules (JSON)"
            hint='Validation/UI rules, e.g. { "maxlength": 100 }'
            persistent-hint
          />
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="currentItem.prefillValue"
            label="Prefill Value"
            hint="Initial value; use a number for Number type"
            persistent-hint
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="currentItem.visibleRaw"
            label="Visible Rules (string or JSON object)"
            hint='Preferred: { "field": "duration", "equals": "full" }'
            persistent-hint
          />
        </v-col>

        <v-col
          cols="12"
          v-if="currentItem.type === 'Radio' || currentItem.type === 'Select'"
        >
          <v-divider class="my-2" />
          <div class="text-subtitle-2 mb-2">Options</div>
          <div
            v-for="(opt, i) in currentItem.enum"
            :key="i"
            class="d-flex align-center mb-2 gap-2"
          >
            <v-text-field
              v-model="opt.label"
              label="Label"
              density="comfortable"
              hide-details
              class="mr-2"
            />
            <v-text-field
              v-model="opt.value"
              label="Value"
              density="comfortable"
              hide-details
              class="mr-2"
            />
            <v-btn
              icon="mdi-delete"
              variant="text"
              color="error"
              @click="removeOption(i)"
            />
          </div>
          <v-btn
            size="small"
            variant="elevated"
            color="primary"
            prepend-icon="mdi-plus-circle"
            @click="addOption"
            >Add Option</v-btn
          >
        </v-col>

        <v-col
          cols="12"
          v-if="currentItem.type === 'Number' && currentItem.value_constraints"
        >
          <v-divider class="my-2" />
          <div class="text-subtitle-2 mb-2">Number Constraints</div>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model.number="currentItem.value_constraints.maximum"
                label="Maximum"
                type="number"
                hint="Optional upper bound"
                persistent-hint
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model.number="currentItem.value_constraints.minimum"
                label="Minimum"
                type="number"
                hint="Optional lower bound"
                persistent-hint
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                :model-value="
                  String(currentItem.value_constraints.allow_decimal ?? '')
                "
                type="text"
                inputmode="numeric"
                pattern="\\d*"
                label="Allow Decimal Places"
                hint="0 = integers only; 2 = up to 2 decimal places"
                persistent-hint
                @update:modelValue="onUpdateAllowDecimalPlaces"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="currentItem.value_constraints.allow_negative"
                inset
                color="primary"
                label="Allow Negative Numbers"
                hint="Enable to allow a leading minus sign"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </v-card-text>
  <v-card-text v-else> Select a field to start editing. </v-card-text>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type {
  SavedItem as ItemState,
  FieldType as ItemType,
} from "~/types/schema";

const props = defineProps<{
  currentItem: ItemState | null;
  typeItems: Array<{ label: string; value: ItemType }>;
}>();

const editorForm = ref();

const nameRules = [
  (v: string) => !!(v && v.trim()) || "Name is required",
  (v: string) =>
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(v || "") ||
    "Use letters, numbers, underscore; start with letter/_",
];

const trimCurrentName = () => {
  if (!props.currentItem) return;
  props.currentItem.name = (props.currentItem.name || "").trim();
};

const addOption = () => {
  if (!props.currentItem) return;
  props.currentItem.enum = props.currentItem.enum || [];
  props.currentItem.enum.push({ label: "", value: "" });
};

const removeOption = (i: number) => {
  if (!props.currentItem?.enum) return;
  props.currentItem.enum.splice(i, 1);
};

const onUpdateAllowDecimalPlaces = (val: any) => {
  const it = props.currentItem;
  if (!it || !it.value_constraints) return;
  const digitsOnly = String(val ?? "").replace(/\D+/g, "");
  const parsed = digitsOnly === "" ? 0 : parseInt(digitsOnly, 10);
  it.value_constraints.allow_decimal = Number.isFinite(parsed) ? parsed : 0;
};
</script>

<style scoped></style>
