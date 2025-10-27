<template>
  <v-navigation-drawer
    v-model="drawerLocal"
    :permanent="!isMobile"
    :temporary="isMobile"
    class="bg-blue-grey"
  >
    <v-list class="mt-4">
      <v-list-item>
        <div class="d-flex align-center">
          <img
            src="~/assets/uppass-logo.png"
            style="width: 40px; height: 40px; margin-right: 12px"
          />
          <span class="font-bold"> Form Portal </span>
        </div>
      </v-list-item>
    </v-list>
    <v-list nav>
      <v-list-item
        title="Home"
        prepend-icon="mdi-home"
        to="/"
        :active="route.path === '/'"
        exact
        class="rounded-xl px-4 mb-2"
      />
      <v-list-item
        title="Create"
        prepend-icon="mdi-plus-box"
        to="/builder"
        :active="route.path.startsWith('/builder')"
        class="rounded-xl px-4"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useDisplay } from "vuetify";

const route = useRoute();
const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);

const props = defineProps<{ drawer: boolean; rail: boolean }>();
const emit = defineEmits<{
  (e: "update:drawer", v: boolean): void;
  (e: "update:rail", v: boolean): void;
}>();

const drawerLocal = computed({
  get: () => props.drawer,
  set: (v: boolean) => emit("update:drawer", v),
});
const railLocal = computed({
  get: () => props.rail,
  set: (v: boolean) => emit("update:rail", v),
});

const toggleRail = () => emit("update:rail", !props.rail);
</script>

<style scoped></style>
