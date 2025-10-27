<template>
  <v-container class="pa-6">
    <v-row>
      <v-col
        cols="12"
        md="12"
      >
        <v-card>
          <v-card-title
            v-if="schema"
            class="mb-4"
            ><span class="font-bold">{{ schema?.label }} </span><br />
            <p class="text-error text-[0.75rem]">
              All fields marked with * are required.
            </p></v-card-title
          >

          <v-card-text>
            <div
              v-if="!schema"
              class="text-medium-emphasis"
            >
              No schema loaded. Go to
              <NuxtLink
                to="/"
                class="underline"
                >Home</NuxtLink
              >
              to select or import a schema.
            </div>
            <div v-else>
              <FormBuilder
                :schema="schema"
                v-model="formData"
                :showSubmit="false"
                @submit="onSubmit"
              />
              <v-btn
                class="mt-4"
                color="primary"
                :disabled="!schema || submitting || !canSubmit"
                @click="onSubmit"
              >
                Submit
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-model="submittedOpen"
      max-width="700"
    >
      <v-card>
        <v-card-title>Submitted Data</v-card-title>
        <v-card-text>
          <div class="text-subtitle-2 mb-2">Payload</div>
          <pre style="white-space: pre-wrap">{{ prettyFormData }}</pre>
          <div
            v-if="submitResult"
            class="mt-4"
          >
            <div class="text-subtitle-2 mb-2">
              Response ({{ submitResult.status }})
            </div>
            <pre style="white-space: pre-wrap">{{ submitResult.body }}</pre>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="black"
            prepend-icon="mdi-close-circle"
            variant="tonal"
            @click="submittedOpen = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import FormBuilder from "../components/FormBuilder.vue";
import { useFormStore } from "~/stores/form";
import type { AnyRecord, RawItem, SavedSchema } from "~/types/schema";
import { storeToRefs } from "pinia";
import { convertSavedToSchema } from "~/composables/schema";
import {
  isItemVisible,
  isItemRequired,
  isFilled,
} from "~/composables/visibility";

definePageMeta({
  name: "Form Page",
});

// Using shared AnyRecord from ~/types/schema

const formStore = useFormStore();
const { schema, formData } = storeToRefs(formStore);
const message = ref("");
const messageType = ref<"success" | "warning" | "error" | "info">("info");
const submittedOpen = ref(false);
const submitting = ref(false);
const submitResult = ref<null | { status: number; body: string }>(null);
const route = useRoute();

const setMessage = (
  text: string,
  type: "success" | "warning" | "error" | "info" = "info"
) => {
  message.value = text;
  messageType.value = type;
};

const loadFromQueryOrTemp = () => {
  const qname = (route.query.name as string) || "";
  if (qname) {
    try {
      const raw = localStorage.getItem("schemaBuilder.schemas");
      if (raw) {
        const list = JSON.parse(raw) as SavedSchema[];
        const entry = list.find((s) => qname === s.name);
        console.log(entry);
        if (entry) {
          const data = Array.isArray(entry.items)
            ? convertSavedToSchema(entry)
            : entry;
          schema.value = data;
          setMessage(`Loaded saved schema: ${entry.name}`, "success");
          return;
        }
      }
    } catch {}
  }
  const tempRaw = localStorage.getItem("schemaBuilder.tempImport");
  if (tempRaw) {
    try {
      const data = JSON.parse(tempRaw);
      schema.value = data;
      setMessage("Imported schema from file.", "success");
    } catch {}
    return;
  }
  schema.value = null;
};

const onSubmit = async () => {
  const payload = { ...formData.value };
  submittedOpen.value = true;
  submitResult.value = null;
  const endpoint = schema.value?.endpoint;
  if (!endpoint) return;
  try {
    submitting.value = true;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let bodyText = "";
    try {
      bodyText = await res.text();
    } catch {
      bodyText = "";
    }
    submitResult.value = { status: res.status, body: bodyText };
    setMessage(
      res.ok ? "Submitted successfully" : "Submission failed",
      res.ok ? "success" : "error"
    );
  } catch (e) {
    submitResult.value = { status: 0, body: String(e) };
    setMessage("Submission error", "error");
  } finally {
    submitting.value = false;
  }
};

const prettyFormData = computed(() => JSON.stringify(formData.value, null, 2));

// --- Submit enablement: require all visible required fields to be filled ---
const itemsList = computed<any[]>(() => {
  const items: any = schema.value?.items as any;
  if (!items) return [];
  return Array.isArray(items) ? items : Object.values(items);
});

const isRequired = (item: RawItem): boolean => isItemRequired(item);

const isVisible = (item: RawItem): boolean =>
  isItemVisible(item, formData.value as AnyRecord);

const canSubmit = computed(() => {
  if (!schema.value) return false;
  for (const item of itemsList.value as RawItem[]) {
    if (!isVisible(item)) continue;
    if (!isRequired(item)) continue;
    if (!isFilled((formData.value as AnyRecord)[item.name])) return false;
  }
  return true;
});

onBeforeMount(() => {
  loadFromQueryOrTemp();
});

// Basic deterrents against inspecting elements (cannot be fully prevented)
let detachFns: Array<() => void> = [];
onMounted(() => {
  const onContextMenu = (e: Event) => {
    e.preventDefault();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const key = (e.key || "").toUpperCase();
    const block =
      key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(key)) ||
      (e.ctrlKey && key === "U");
    if (block) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  document.addEventListener("contextmenu", onContextMenu);
  window.addEventListener("keydown", onKeyDown, true);
  detachFns = [
    () => document.removeEventListener("contextmenu", onContextMenu),
    () => window.removeEventListener("keydown", onKeyDown, true),
  ];
});

onBeforeUnmount(() => {
  for (const fn of detachFns)
    try {
      fn();
    } catch {}
  detachFns = [];
});
</script>

<style scoped></style>
