<template>
  <v-container class="pa-6">
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-card
          variant="elevated"
          class="h-100 d-flex flex-column"
        >
          <v-card-title>Import JSON</v-card-title>
          <v-card-text>
            Import a schema JSON to open it directly in the form.
          </v-card-text>
          <v-card-actions class="mt-auto">
            <v-btn
              color="primary"
              @click="triggerImport"
              >Import JSON</v-btn
            >
            <input
              ref="importDom"
              type="file"
              accept="application/json,.json"
              @change="onImportChange"
              style="display: none"
            />
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-card
          variant="elevated"
          class="h-100"
        >
          <v-card-title>Schema Builder</v-card-title>
          <v-card-text>
            Create and configure schema fields, reorder via drag-and-drop, then
            export JSON.
          </v-card-text>
          <v-card-actions>
            <NuxtLink to="/builder"
              ><v-btn color="primary">Open Builder</v-btn></NuxtLink
            >
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card variant="elevated">
          <v-card-title>Saved Schemas</v-card-title>
          <v-card-text>
            <v-alert
              v-if="!savedList.length"
              type="info"
              density="comfortable"
            >
              No saved schemas found.
            </v-alert>
            <v-table v-else>
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-left">Label</th>
                  <th class="text-left">Fields</th>
                  <th class="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="entry in savedList"
                  :key="entry.name"
                >
                  <td>{{ entry.name }}</td>
                  <td>{{ entry.label || "-" }}</td>
                  <td>{{ entryFieldCount(entry) }}</td>
                  <td>
                    <div class="d-flex align-center gap-2">
                      <NuxtLink
                        :to="`/form?name=${encodeURIComponent(entry.name)}`"
                        ><v-btn
                          size="small"
                          color="primary"
                          @click="resetData()"
                          prepend-icon="mdi-eye"
                          >Open</v-btn
                        ></NuxtLink
                      >
                      <NuxtLink
                        :to="`/builder?name=${encodeURIComponent(entry.name)}`"
                        ><v-btn
                          class="ml-2"
                          color="primary"
                          size="small"
                          prepend-icon="mdi-file-edit"
                          variant="tonal"
                          >Edit</v-btn
                        ></NuxtLink
                      >
                      <v-btn
                        class="ml-2"
                        size="small"
                        color="primary"
                        @click="exportEntry(entry)"
                        variant="outlined"
                        prepend-icon="mdi-file-export"
                      >
                        Export</v-btn
                      >
                      <v-btn
                        class="ml-2"
                        size="small"
                        color="error"
                        variant="text"
                        prepend-icon="mdi-delete"
                        @click="deleteEntry(entry)"
                        >Delete</v-btn
                      >
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  name: "Homepage",
});
import type { AnyRecord } from "~/types/schema";
import { convertSavedToSchema } from "~/composables/schema";
const LS_MULTI_KEY = "schemaBuilder.schemas";
const savedList = ref<AnyRecord[]>([]);
const importFile = ref<File | null>(null);
const { resetData } = useFormStore();
const readSavedList = (): AnyRecord[] => {
  try {
    const raw = localStorage.getItem(LS_MULTI_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const entryFieldCount = (entry: AnyRecord) =>
  Array.isArray(entry.items)
    ? entry.items.length
    : Object.keys(entry.items || {}).length;

const toExportPayload = (entry: AnyRecord): AnyRecord =>
  Array.isArray(entry.items) ? (convertSavedToSchema(entry as any) as AnyRecord) : entry;

const exportEntry = (entry: AnyRecord) => {
  const payload = toExportPayload(entry);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${entry.name || "schema"}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const deleteEntry = (entry: AnyRecord) => {
  if (
    !confirm(
      `Are you sure you want to delete the saved schema "${entry.name}"? This action cannot be undone.`
    )
  )
    return;
  const list = readSavedList().filter((e) => e.name !== entry.name);
  localStorage.setItem(LS_MULTI_KEY, JSON.stringify(list));
  savedList.value = list;
};

onMounted(() => {
  savedList.value = readSavedList();
});

const importSchema = async () => {
  const f = importFile.value;
  if (!f) return;
  try {
    const text = await f.text();
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || !data.items)
      throw new Error("Invalid schema: missing items");
    localStorage.setItem("schemaBuilder.tempImport", JSON.stringify(data));
    resetData();
    await navigateTo("/form");
  } catch (e) {
    alert("Invalid JSON schema file.");
  } finally {
    importFile.value = null;
  }
};
// Import via button + hidden input
const importDom = ref<HTMLInputElement | null>(null);
const triggerImport = () => {
  importDom.value?.click();
};
const onImportChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const f = input?.files?.[0];
  if (f) {
    importFile.value = f;
    importSchema();
  }
  if (importDom.value) importDom.value.value = "";
};
</script>
