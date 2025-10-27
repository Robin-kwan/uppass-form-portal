<template>
  <v-app class="bg-app">
    <AppSidebar
      v-model:drawer="drawer"
      v-model:rail="rail"
    />

    <v-main>
      <div class="d-flex pt-8 align-center">
        <v-btn
          v-if="isMobile"
          icon="mdi-menu"
          variant="text"
          @click="toggleNav"
          class="ml-4"
        />
        <span
          class="font-bold text-2xl"
          :class="{ 'pl-9': !isMobile }"
        >
          {{ route.name }}
        </span>
      </div>
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDisplay } from "vuetify";

const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);
const route = useRoute();
const drawer = ref(!isMobile.value);
const rail = ref(false);

const toggleNav = () => {
  if (isMobile.value) drawer.value = !drawer.value;
};
</script>

<style scoped>
.bg-app {
  background-color: #eeeeee;
}
</style>
