import { defineStore } from "pinia";
import type { AnyRecord } from "~/types/schema";

export const useFormStore = defineStore("form", () => {
  const schema = ref(null as AnyRecord | null);
  const formData = ref({} as AnyRecord);

  const resetData = () => {
    schema.value = null;
    formData.value = {};
  };
  return { schema, formData, resetData };
});
