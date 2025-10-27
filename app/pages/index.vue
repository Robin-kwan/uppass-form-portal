<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Schema Tools</h1>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="elevated">
          <v-card-title>Form</v-card-title>
          <v-card-text>
            Import a schema JSON or use a saved schema, then fill and submit the form.
          </v-card-text>
          <v-card-actions>
            <NuxtLink to="/form"><v-btn color="primary">Open Form</v-btn></NuxtLink>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="elevated">
          <v-card-title>Schema Builder</v-card-title>
          <v-card-text>
            Create and configure schema fields, reorder via drag-and-drop, then export JSON.
          </v-card-text>
          <v-card-actions>
            <NuxtLink to="/builder"><v-btn color="primary">Open Builder</v-btn></NuxtLink>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// Landing page only provides navigation.
</script>
