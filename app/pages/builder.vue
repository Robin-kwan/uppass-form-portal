<template>
  <v-container class="pa-6">
    <v-row>
      <v-col
        cols="12"
        md="12"
      >
        <v-card
          class="mb-6"
          variant="elevated"
        >
          <v-card-title>Schema Settings</v-card-title>
          <v-card-text class="mt-4">
            <v-text-field
              v-model="schemaName"
              label="Schema Name"
              hint="Saved as schema.name in JSON"
              persistent-hint
              density="comfortable"
              class="mb-4"
            />
            <v-text-field
              v-model="schemaLabel"
              label="Schema Label"
              hint="Optional display title for the schema"
              persistent-hint
              density="comfortable"
              class="mb-4"
            />
            <v-text-field
              v-model="schemaEndpoint"
              label="Endpoint URL"
              hint="POST URL used by the Form page when submitting"
              persistent-hint
              density="comfortable"
              class="mb-4"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              variant="elevated"
              @click="openSaveDialog"
              prepend-icon="mdi-content-save"
              >Save As</v-btn
            >
            <v-btn
              color="primary"
              variant="tonal"
              @click="openLoadDialog"
              prepend-icon="mdi-view-list"
              >Load</v-btn
            >
            <v-spacer />
            <v-btn
              color="primary"
              variant="outlined"
              @click="exportJSON"
              prepend-icon="mdi-file-export"
              >Export</v-btn
            >
          </v-card-actions>
        </v-card>

        <v-card>
          <v-card-title>Fields (Drag to reorder)</v-card-title>
          <v-card-text class="mt-4">
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
              @change="onDragChanged"
            >
              <template
                v-for="(element, index) in items"
                :key="element.__key"
              >
                <v-card
                  class="mb-2"
                  :color="selectedIndex === index ? 'black' : undefined"
                  :variant="selectedIndex === index ? 'outlined' : 'elevated'"
                >
                  <v-card-text
                    class="d-flex align-center justify-space-between"
                  >
                    <div class="d-flex align-center gap-4">
                      <v-btn
                        icon="mdi-drag"
                        variant="text"
                        class="drag-handle"
                      />
                      <div class="text-body-2">
                        <strong>{{ element.name || "(unnamed)" }}</strong> -
                        {{ element.type }}
                      </div>
                    </div>
                    <div class="d-flex align-center gap-2">
                      <v-btn
                        size="small"
                        color="primary"
                        variant="tonal"
                        prepend-icon="mdi-file-edit"
                        @click="selectItem(index)"
                        >Edit</v-btn
                      >
                      <v-btn
                        size="small"
                        color="error"
                        variant="text"
                        @click="removeItem(index)"
                        prepend-icon="mdi-delete"
                        >Remove</v-btn
                      >
                    </div>
                  </v-card-text>
                </v-card>
              </template>
            </VueDraggableNext>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              variant="elevated"
              @click="addItem"
              prepend-icon="mdi-plus-circle"
              >Add Field</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="12"
      >
        <v-card>
          <v-card-title class="mb-4">Field Editor</v-card-title>
          <FieldEditor
            :current-item="currentItem"
            :type-items="typeItems"
          />
        </v-card>

        <v-card class="mt-6">
          <v-card-title>Live Preview</v-card-title>
          <v-card-text class="mt-4">
            <FormBuilder :schema="previewSchema" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-dialog
    v-model="saveDialog"
    max-width="520"
  >
    <v-card>
      <v-card-title>Save Schema As</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="saveName"
          label="Name"
          hint="Unique schema name"
          persistent-hint
          class="mb-4"
        />
        <v-text-field
          v-model="saveLabel"
          label="Label"
          hint="Optional display label"
          persistent-hint
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          @click="saveDialog = false"
          variant="outlined"
          prepend-icon="mdi-close-circle"
          >Cancel</v-btn
        >
        <v-btn
          color="primary"
          @click="confirmSaveAs"
          variant="elevated"
          prepend-icon="mdi-content-save"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="loadDialog"
    max-width="640"
  >
    <v-card>
      <v-card-title>Load Saved Schema</v-card-title>
      <v-card-text>
        <div
          v-if="savedList.length === 0"
          class="text-medium-emphasis"
        >
          No saved schemas found.
        </div>
        <v-select
          v-else
          v-model="selectedSavedName"
          :items="savedList.map((s) => s.name)"
          label="Select a schema"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="text"
          color="error"
          :disabled="!selectedSavedName"
          @click="deleteSaved(selectedSavedName)"
          prepend-icon="mdi-delete"
          >Delete</v-btn
        >
        <v-spacer />
        <v-btn
          @click="loadDialog = false"
          prepend-icon="mdi-close-circle"
          variant="outlined"
          >Cancel</v-btn
        >
        <v-btn
          color="primary"
          :disabled="!selectedSavedName"
          variant="elevated"
          @click="confirmLoadSelected"
          prepend-icon="mdi-view-list"
          >Load</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import FormBuilder from "../components/FormBuilder.vue";
import FieldEditor from "../components/builder/FieldEditor.vue";
import { useBuilderStore } from "../stores/builder";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import type {
  SavedItem as ItemState,
  SavedSchema as SavedEntry,
  AnyRecord,
  SavedItem,
  FieldType as ItemType,
} from "~/types/schema";

definePageMeta({
  name: "Schema Builder Page",
});

// Types moved to ~/types/schema

const builderStore = useBuilderStore();
const { schemaName, schemaLabel, schemaEndpoint, items, selectedIndex } =
  storeToRefs(builderStore);

const route = useRoute();

const typeItems: Array<{ label: string; value: ItemType }> = [
  { label: "Text", value: "Text" },
  { label: "Number", value: "Number" },
  { label: "Radio", value: "Radio" },
  { label: "Select", value: "Select" },
];

const newKey = () => Math.random().toString(36).slice(2);

// editor validation handled inside FieldEditor component

const makeDefaultItem = (): ItemState => ({
  __key: newKey(),
  name: "",
  type: "Text",
  display: { label: "" },
  required: false,
  rules: {},
  rulesJson: "{}",
  enum: [],
  value_constraints: {
    maximum: undefined,
    minimum: undefined,
    allow_decimal: 0,
    allow_negative: false,
  },
  visibleRaw: "",
  prefillValue: "",
});

const LS_MULTI_KEY = "schemaBuilder.schemas";
const savedList = ref<SavedEntry[]>([]);
const saveDialog = ref(false);
const loadDialog = ref(false);
const saveName = ref("");
const saveLabel = ref("");
const selectedSavedName = ref("");

const genUniqueName = (): string => {
  let i = items.value.length + 1;
  while (true) {
    const candidate = `field_${i}`;
    const exists = items.value.some(
      (it: AnyRecord) => (it.name || "").trim() === candidate
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

// Keep selection stable across drag/reorder using persistent __key
const selectedKey = ref<string | null>(null);

watch(selectedIndex, (idx) => {
  if (idx === null) {
    selectedKey.value = null;
  } else {
    const it = items.value[idx];
    selectedKey.value = it ? it.__key : null;
  }
});

const onDragChanged = () => {
  if (!selectedKey.value) return;
  const idx = items.value.findIndex(
    (it: SavedItem) => it.__key === selectedKey.value
  );
  selectedIndex.value = idx >= 0 ? idx : null;
};

const currentItem = computed((): ItemState | null =>
  selectedIndex.value !== null ? items.value[selectedIndex.value] : null
);

const toExportSchema = () => {
  const itemsMap: Record<string, any> = {};
  for (const it of items.value) {
    const name = it.name?.trim() || "schema";
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
      required: !!it.required,
      rules: it.rules ?? {},
      type: it.type,
      enum:
        it.type === "Radio" || it.type === "Select"
          ? it.enum?.filter((o: AnyRecord) => o.label || o.value)
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
  } as const;
};

const previewSchema = computed(() => toExportSchema());

const loadLocal = () => {
  const raw = localStorage.getItem("schemaBuilder.schemas");
  if (!raw) return;
  try {
    const schemas = JSON.parse(raw);
    const parsed = schemas.filter(
      (p: SavedEntry) => p.name === (route.query.name as string)
    )[0];
    if (!parsed) return;
    schemaName.value = parsed.name;
    schemaLabel.value = parsed.label;
    schemaEndpoint.value = parsed.endpoint;
    items.value = (parsed.items || []).map((it: any) => ({
      __key: newKey(),
      name: it.name ?? "",
      type: it.type ?? "Text",
      display: it.display ?? { label: "" },
      required: !!it.required,
      rules: it.rules ?? {},
      rulesJson: JSON.stringify(it.rules ?? {}),
      enum: it.enum ?? [],
      value_constraints: it.value_constraints
        ? {
            maximum: it.value_constraints.maximum,
            minimum: it.value_constraints.minimum,
            allow_decimal: it.value_constraints.allow_decimal ?? 0,
            allow_negative:
              typeof it.value_constraints.allow_negative === "boolean"
                ? it.value_constraints.allow_negative
                : it.value_constraints.allow_negative === 1,
          }
        : {
            maximum: undefined,
            minimum: undefined,
            allow_decimal: 0,
            allow_negative: false,
          },
      visibleRaw:
        it.visibleRaw !== undefined && it.visibleRaw !== null
          ? String(it.visibleRaw)
          : typeof it.visible === "object"
          ? JSON.stringify(it.visible)
          : it.visible ?? "",
      prefillValue: it.prefill?.value ?? "",
    })) as ItemState[];
  } catch {
    // ignore
  }
};

const exportJSON = () => {
  const json = JSON.stringify(toExportSchema(), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const fname = (schemaName.value || "schema").trim() || "schema";
  a.download = `${fname}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const readSavedList = (): SavedEntry[] => {
  try {
    const raw = localStorage.getItem(LS_MULTI_KEY);
    if (raw) return JSON.parse(raw);
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
  const entry: SavedEntry = {
    name,
    label: saveLabel.value,
    endpoint: schemaEndpoint.value,
    items: items.value,
  };
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
  items.value = (entry.items || []).map((it: any) => ({
    __key: newKey(),
    name: it.name ?? "",
    type: it.type ?? "Text",
    display: it.display ?? { label: "" },
    required: !!it.required,
    rules: it.rules ?? {},
    rulesJson: JSON.stringify(it.rules ?? {}),
    enum: it.enum ?? [],
    value_constraints: it.value_constraints
      ? {
          maximum: it.value_constraints.maximum,
          minimum: it.value_constraints.minimum,
          allow_decimal: it.value_constraints.allow_decimal ?? 0,
          allow_negative:
            typeof it.value_constraints.allow_negative === "boolean"
              ? it.value_constraints.allow_negative
              : it.value_constraints.allow_negative === 1,
        }
      : {
          maximum: undefined,
          minimum: undefined,
          allow_decimal: 0,
          allow_negative: false,
        },
    visibleRaw:
      it.visibleRaw !== undefined && it.visibleRaw !== null
        ? String(it.visibleRaw)
        : typeof it.visible === "object"
        ? JSON.stringify(it.visible)
        : it.visible ?? "",
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

onMounted(() => {
  if (route.query.name) {
    try {
      loadLocal();
    } catch {}
  }
});

watch(currentItem, (it) => {
  if (!it) return;
  // keep rulesJson in sync when rules changed externally
  try {
    it.rulesJson = JSON.stringify(it.rules ?? {}, null, 0);
  } catch {
    // ignore
  }
});

watch(
  () => currentItem.value?.rulesJson,
  (json) => {
    const it = currentItem.value;
    if (!it) return;
    try {
      it.rules = json ? JSON.parse(json) : {};
    } catch {
      // keep last valid
    }
  }
);
</script>

<style scoped></style>
