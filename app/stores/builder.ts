import { defineStore } from "pinia";
import type { SavedItem as ItemState, FieldType as ItemType } from "~/types/schema";

// Types moved to ~/types/schema

export const useBuilderStore = defineStore("builder", () => {
  const schemaName = ref("step");
  const schemaLabel = ref("My Schema");
  const schemaEndpoint = ref("" as string);
  const items = ref([] as ItemState[]);
  const selectedIndex = ref(null as number | null);

  return { schemaName, schemaLabel, schemaEndpoint, items, selectedIndex };
});
