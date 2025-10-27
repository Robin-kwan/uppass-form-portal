<template>
  <v-container
    fluid
    class="pa-4"
  >
    <v-row>
      <v-col
        cols="12"
        md="12"
      >
        <v-card
          class="mb-4"
          variant="elevated"
        >
          <v-card-title>Schema Settings</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="schemaName"
              label="Schema Name"
              hint="Saved as schema.name in JSON"
              persistent-hint
              density="comfortable"
            />
            <v-text-field
              v-model="schemaLabel"
              label="Schema Label"
              hint="Optional display title for the schema"
              persistent-hint
              density="comfortable"
            />
            <v-text-field
              v-model="schemaEndpoint"
              label="Endpoint URL"
              hint="POST URL used by the Form page when submitting"
              persistent-hint
              density="comfortable"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="elevated" @click="addItem">Add Field</v-btn>
            <v-btn color="secondary" variant="tonal" @click="openSaveDialog">Save As</v-btn>
            <v-btn color="secondary" variant="tonal" @click="openLoadDialog">Load</v-btn>
            <v-spacer />
            <v-btn color="primary" variant="elevated" @click="exportJSON">Export JSON</v-btn>
          </v-card-actions>
        </v-card>

        <v-card>
          <v-card-title>Fields (Drag to reorder)</v-card-title>
          <v-card-text>
            <div
              v-if="items.length === 0"
              class="text-medium-emphasis"
            >
              No fields yet. Click "Add Field" to get started.
            </div>
            <VueDraggableNext
              v-model="items"
              item-key="__key"
              handle=".drag-handle"
            >
              <template #item="{ element, index }">
                <v-card
                  class="mb-2"
                  :color="selectedIndex === index ? 'primary' : undefined"
                  :variant="selectedIndex === index ? 'tonal' : 'elevated'"
                >
                  <v-card-text
                    class="d-flex align-center justify-space-between"
                  >
                    <div class="d-flex align-center gap-2">
                      <v-btn
                        icon="mdi-drag"
                        variant="text"
                        class="drag-handle"
                      />
                      <div class="text-body-2">
                        <strong>{{ element.name || "(unnamed)" }}</strong>
                        {{ element.type }}
                      </div>
                    </div>
                    <div class="d-flex align-center gap-2">
                      <v-btn
                        size="small"
                        @click="selectItem(index)"
                        >Edit</v-btn
                      >
                      <v-btn
                        size="small"
                        color="error"
                        @click="removeItem(index)"
                        >Remove</v-btn
                      >
                    </div>
                  </v-card-text>
                </v-card>
              </template>
            </VueDraggableNext>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="12"
      >
        <v-card>
          <v-card-title>Field Editor</v-card-title>
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
                    hint="Determines which input renders (Text/Number/Radio)"
                    persistent-hint
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
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
                    hint="Mark field as required (metadata only)"
                    persistent-hint
                    hide-details="auto"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="currentItem.propsJson"
                    label="Props (JSON)"
                    hint='Component props, e.g. { "maxlength": 100 }'
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
                    hint='Preferred: { "field": "duration", "equals": "full" }. Also supports: duration:required|is:full'
                    persistent-hint
                  />
                </v-col>

                <v-col
                  cols="12"
                  v-if="currentItem.type === 'Radio'"
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
                    variant="tonal"
                    @click="addOption"
                    >Add Option</v-btn
                  >
                </v-col>

                <v-col
                  cols="12"
                  v-if="currentItem.type === 'Number'"
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
                        v-model.number="
                          currentItem.value_constraints.allow_decimal
                        "
                        type="number"
                        label="Allow Decimal Places"
                        hint="0 = integers only; 2 = up to 2 decimal places"
                        persistent-hint
                        min="0"
                        step="1"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions v-if="currentItem">
            <v-btn
              color="primary"
              variant="elevated"
              @click="confirmField"
              >Confirm</v-btn
            >
            <v-spacer />
            <div
              class="text-error"
              v-if="nameError"
            >
              {{ nameError }}
            </div>
          </v-card-actions>
          <v-card-text v-else> Select a field to start editing. </v-card-text>
        </v-card>

        <v-card
          class="mt-4"
          variant="tonal"
        >
          <v-card-title>Live Preview</v-card-title>
          <v-card-text>
            <FormBuilder :schema="previewSchema" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-dialog v-model="saveDialog" max-width="520">
    <v-card>
      <v-card-title>Save Schema As</v-card-title>
      <v-card-text>
        <v-text-field v-model="saveName" label="Name" hint="Unique schema name" persistent-hint />
        <v-text-field v-model="saveLabel" label="Label" hint="Optional display label" persistent-hint />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="saveDialog = false">Cancel</v-btn>
        <v-btn color="primary" @click="confirmSaveAs">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="loadDialog" max-width="640">
    <v-card>
      <v-card-title>Load Saved Schema</v-card-title>
      <v-card-text>
        <div v-if="savedList.length === 0" class="text-medium-emphasis">No saved schemas found.</div>
        <v-select
          v-else
          v-model="selectedSavedName"
          :items="savedList.map(s => s.name)"
          label="Select a schema"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="error" :disabled="!selectedSavedName" @click="deleteSaved(selectedSavedName)">Delete</v-btn>
        <v-spacer />
        <v-btn @click="loadDialog = false">Cancel</v-btn>
        <v-btn color="primary" :disabled="!selectedSavedName" @click="confirmLoadSelected">Load</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import FormBuilder from "../components/FormBuilder.vue";
import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";

type ItemType = "Text" | "Number" | "Radio";

interface EnumOption {
  label: string;
  value: string;
}

interface ItemState {
  __key: string;
  name: string;
  type: ItemType;
  display: { label: string; placeholder?: string };
  required?: boolean;
  props?: Record<string, any>;
  propsJson: string;
  enum?: EnumOption[];
  value_constraints?: { maximum?: number; allow_decimal?: 0 | 1 };
  visibleRaw?: string;
  prefillValue?: string | number;
}

const builderStore = useBuilderStore();
const { schemaName, schemaLabel, schemaEndpoint, items, selectedIndex } = storeToRefs(builderStore);

const typeItems = [
  { label: "Text", value: "Text" },
  { label: "Number", value: "Number" },
  { label: "Radio", value: "Radio" },
];

const newKey = () => Math.random().toString(36).slice(2);

// Unique name validation state and helpers
const editorForm = ref();
const nameError = ref("");
const nameRules = [
  (v: string) => !!(v && v.trim()) || "Name is required",
  (v: string) =>
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(v || "") ||
    "Use letters, numbers, underscore; start with letter/_",
  (v: string) => {
    const name = (v || "").trim();
    const idx = selectedIndex.value;
    if (name === "" || idx === null) return true;
    const dup = items.value.some(
      (it, i) => i !== idx && (it.name || "").trim() === name
    );
    return !dup || "Name must be unique";
  },
];

const trimCurrentName = () => {
  const it =
    selectedIndex.value !== null ? items.value[selectedIndex.value] : null;
  if (!it) return;
  it.name = (it.name || "").trim();
};

const confirmField = async () => {
  nameError.value = "";
  const form: any = editorForm.value;
  if (form && typeof form.validate === "function") {
    const res = await form.validate();
    const valid = typeof res === "object" ? !!res.valid : !!res;
    if (!valid) {
      nameError.value = "Please fix errors above.";
      return;
    }
  }
  // Field is valid and already bound to items.
  nameError.value = "";
};

const makeDefaultItem = (): ItemState => ({
  __key: newKey(),
  name: "",
  type: "Text",
  display: { label: "" },
  required: false,
  props: {},
  propsJson: "{}",
  enum: [],
  value_constraints: { maximum: undefined, allow_decimal: 0 },
  visibleRaw: "",
  prefillValue: "",
});

const genUniqueName = (): string => {
  let i = items.value.length + 1;
  while (true) {
    const candidate = `field_${i}`;
    const exists = items.value.some(
      (it) => (it.name || "").trim() === candidate
    );
    if (!exists) return candidate;
    i++;
  }
};

const addItem = () => {
  const it = makeDefaultItem();
  it.name = genUniqueName();
  items.value.push(it);
  selectedIndex.value = items.value.length - 1;
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
  if (selectedIndex.value === index) selectedIndex.value = null;
};

const selectItem = (index: number) => {
  selectedIndex.value = index;
};

const currentItem = computed(() =>
  selectedIndex.value !== null ? items.value[selectedIndex.value] : null
);

watch(currentItem, (it) => {
  if (!it) return;
  // keep propsJson in sync when props changed externally
  try {
    it.propsJson = JSON.stringify(it.props ?? {}, null, 0);
  } catch {
    // ignore
  }
});

watch(
  () => currentItem.value?.propsJson,
  (json) => {
    const it = currentItem.value;
    if (!it) return;
    try {
      it.props = json ? JSON.parse(json) : {};
    } catch {
      // keep last valid
    }
  }
);

const addOption = () => {
  if (!currentItem.value) return;
  currentItem.value.enum = currentItem.value.enum || [];
  currentItem.value.enum.push({ label: "", value: "" });
};

const removeOption = (i: number) => {
  if (!currentItem.value?.enum) return;
  currentItem.value.enum.splice(i, 1);
};

const toExportSchema = () => {
  const itemsMap: Record<string, any> = {};
  for (const it of items.value) {
    const name = it.name?.trim();
    if (!name) continue;
    if (itemsMap[name]) {
      // later overrides earlier of same name
    }
    let visible: any = undefined;
    const vr = it.visibleRaw?.trim();
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
    const prefill =
      it.prefillValue !== undefined && it.prefillValue !== ""
        ? {
            value:
              it.type === "Number" && !Number.isNaN(Number(it.prefillValue))
                ? Number(it.prefillValue)
                : it.prefillValue,
          }
        : undefined;

    itemsMap[name] = {
      name,
      display: { ...it.display },
      rule: it.required ? "required" : undefined,
      props: it.props ?? {},
      type: it.type,
      enum:
        it.type === "Radio"
          ? it.enum?.filter((o) => o.label || o.value)
          : undefined,
      value_constraints:
        it.type === "Number" ? it.value_constraints : undefined,
      visible,
      prefill,
    };
  }

  return {
    name: schemaName.value,
    label: schemaLabel.value,
    endpoint: schemaEndpoint.value,
    items: itemsMap,
  };
};

const previewSchema = computed(() => toExportSchema());

const saveLocal = () => {
  const data = {
    name: schemaName.value,
    label: schemaLabel.value,
    items: items.value,
    endpoint: schemaEndpoint.value,
  };
  localStorage.setItem("schemaBuilder.schema", JSON.stringify(data));
};

const loadLocal = () => {
  const raw = localStorage.getItem("schemaBuilder.schema");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    schemaName.value = parsed.name || "step";
    schemaLabel.value = parsed.label || "";
    items.value = (parsed.items || []).map((it: any) => ({
      __key: newKey(),
      name: it.name ?? "",
      type: it.type ?? "Text",
      display: it.display ?? { label: "" },
      required:
        typeof it.required === "boolean" ? it.required : it.rule === "required",
      props: it.props ?? {},
      propsJson: JSON.stringify(it.props ?? {}),
      enum: it.enum ?? [],
      value_constraints: it.value_constraints ?? {
        maximum: undefined,
        allow_decimal: 0,
      },
      visibleRaw:
        typeof it.visible === "object"
          ? JSON.stringify(it.visible)
          : it.visible ?? "",
      prefillValue: it.prefill?.value ?? "",
    })) as ItemState[];
  } catch {
    // ignore
  }
};

onMounted(() => {
  loadLocal();
});

const exportJSON = () => {
  const json = JSON.stringify(toExportSchema(), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "schema.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ----- Multiple saved schemas management -----
type SavedEntry = { name: string; label?: string; items: ItemState[] };
const LS_MULTI_KEY = "schemaBuilder.schemas";
const LS_SINGLE_KEY = "schemaBuilder.schema";
const savedList = ref<SavedEntry[]>([]);
const saveDialog = ref(false);
const loadDialog = ref(false);
const saveName = ref("");
const saveLabel = ref("");
const selectedSavedName = ref("");

const readSavedList = (): SavedEntry[] => {
  try {
    const raw = localStorage.getItem(LS_MULTI_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // migrate single entry if present
  try {
    const single = localStorage.getItem(LS_SINGLE_KEY);
    if (single) {
      const parsed = JSON.parse(single);
      const entry: SavedEntry = {
        name: parsed?.name || "step",
        label: parsed?.label || "",
        items: parsed?.items || [],
      };
      localStorage.setItem(LS_MULTI_KEY, JSON.stringify([entry]));
      return [entry];
    }
  } catch {}
  return [];
};

const writeSavedList = (list: SavedEntry[]) => {
  localStorage.setItem(LS_MULTI_KEY, JSON.stringify(list));
};

const refreshSavedList = () => {
  savedList.value = readSavedList();
};

const openSaveDialog = () => {
  saveName.value = schemaName.value;
  saveLabel.value = schemaLabel.value;
  saveDialog.value = true;
};

const confirmSaveAs = () => {
  const name = (saveName.value || "").trim();
  if (!name) return;
  const entry: SavedEntry = { name, label: saveLabel.value, items: items.value };
  const list = readSavedList();
  const idx = list.findIndex((s) => s.name === name);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  writeSavedList(list);
  refreshSavedList();
  schemaName.value = name;
  schemaLabel.value = saveLabel.value;
  saveDialog.value = false;
};

const openLoadDialog = () => {
  refreshSavedList();
  selectedSavedName.value = savedList.value[0]?.name || "";
  loadDialog.value = true;
};

const confirmLoadSelected = () => {
  const name = selectedSavedName.value;
  const entry = savedList.value.find((s) => s.name === name);
  if (!entry) return;
  schemaName.value = entry.name;
  schemaLabel.value = entry.label || "";
  schemaEndpoint.value = entry.endpoint || "";
  items.value = (entry.items || []).map((it: any) => ({
    __key: newKey(),
    name: it.name ?? "",
    type: it.type ?? "Text",
    display: it.display ?? { label: "" },
    required: typeof it.required === "boolean" ? it.required : it.rule === "required",
    props: it.props ?? {},
    propsJson: JSON.stringify(it.props ?? {}),
    enum: it.enum ?? [],
    value_constraints: it.value_constraints ?? { maximum: undefined, allow_decimal: 0 },
    visibleRaw:
      typeof it.visible === "object" ? JSON.stringify(it.visible) : it.visible ?? "",
    prefillValue: it.prefill?.value ?? "",
  })) as ItemState[];
  selectedIndex.value = items.value.length ? 0 : null;
  loadDialog.value = false;
};

const deleteSaved = (name: string) => {
  const list = readSavedList().filter((s) => s.name !== name);
  writeSavedList(list);
  refreshSavedList();
  if (selectedSavedName.value === name) selectedSavedName.value = "";
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>








