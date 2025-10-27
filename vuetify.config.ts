import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

export default defineVuetifyConfiguration({
  defaults: {
    VTextField: {
      variant: "outlined",
    },
    VSelect: {
      variant: "outlined",
    },
    VNumberInput: {
      variant: "outlined",
      inset: "stacked",
    },
    VCard: {
      class: "rounded-lg",
    },
    VBtn: {
      class: "rounded-lg",
    },
    VCardActions: {
      class: "pa-4",
    },
  },
});
