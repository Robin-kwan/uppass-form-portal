import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

export default defineVuetifyConfiguration({
  defaults: {
    VTextField: {
      variant: "underlined",
    },
    VSelect: {
      variant: "underlined",
    },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#1976D2",
          secondary: "#03A9F4",
          surface: "#FFFFFF",
          background: "#FAFAFA",
        },
      },
    },
  },
});
