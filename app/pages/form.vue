<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12" md="12">
        <v-card class="mb-4">
          <v-card-title>Load Schema</v-card-title>
          <v-card-text>
            <v-file-input
              v-model="file"
              label="Import schema.json"
              accept="application/json,.json"
              prepend-icon="mdi-file"
              @change="onFileSelected"
            />
            <v-btn block class="mb-2" color="secondary" variant="tonal" @click="openSavedDialog">
              Load Saved Schema
            </v-btn>
            <v-alert v-if="message" :type="messageType" density="comfortable" class="mt-2">
              {{ message }}
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <NuxtLink to="/builder"><v-btn variant="text">Go to Builder</v-btn></NuxtLink>
          </v-card-actions>
        </v-card>

        <v-card v-if="schema">
          <v-card-title>Schema Summary</v-card-title>
          <v-card-text>
            <div class="text-body-2">Name: <strong>{{ schema.name }}</strong></div>
            <div class="text-body-2">Label: <strong>{{ schema.label }}</strong></div>
            <div class="text-body-2">Fields: <strong>{{ fieldCount }}</strong></div>
            <div class="text-body-2" v-if="schema.endpoint">Endpoint: <strong>{{ schema.endpoint }}</strong></div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="tonal" color="secondary" @click="clearSchema">Clear</v-btn>
            <v-spacer />
            <v-btn variant="tonal" color="primary" @click="exportSchema">Export JSON</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>Form</v-card-title>
          <v-card-text>
            <div v-if="!schema" class="text-medium-emphasis">
              Import or load a schema to render the form.
            </div>
            <div v-else>
              <FormBuilder :schema="schema" v-model="formData" :showSubmit="false" @submit="onSubmit" />
              <v-btn class="mt-4" color="primary" :disabled="!schema || submitting" @click="onSubmit">
                Submit
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="submittedOpen" max-width="700">
      <v-card>
        <v-card-title>Submitted Data</v-card-title>
        <v-card-text>
          <div class="text-subtitle-2 mb-2">Payload</div>
          <pre style="white-space: pre-wrap">{{ prettyFormData }}</pre>
          <div v-if="submitResult" class="mt-4">
            <div class="text-subtitle-2 mb-2">Response ({{ submitResult.status }})</div>
            <pre style="white-space: pre-wrap">{{ submitResult.body }}</pre>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="submittedOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <v-dialog v-model="savedDialog" max-width="640">
    <v-card>
      <v-card-title>Select Saved Schema</v-card-title>
      <v-card-text>
        <div v-if="savedList.length === 0" class="text-medium-emphasis">No saved schemas found in this browser.</div>
        <v-select v-else v-model="selectedSavedName" :items="savedList.map(s => s.name)" label="Choose a schema" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="savedDialog = false">Cancel</v-btn>
        <v-btn color="primary" :disabled="!selectedSavedName" @click="loadSelectedSaved">Load</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FormBuilder from '../components/FormBuilder.vue'

type AnyRecord = Record<string, any>

const file = ref<File | null>(null)
const schema = ref<AnyRecord | null>(null)
const formData = ref<AnyRecord>({})
const message = ref('')
const messageType = ref<'success' | 'warning' | 'error' | 'info'>('info')
const submittedOpen = ref(false)
const submitting = ref(false)
const submitResult = ref<null | { status: number; body: string }>(null)
const savedDialog = ref(false)
const savedList = ref<AnyRecord[]>([])
const selectedSavedName = ref('')

const setMessage = (text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
  message.value = text
  messageType.value = type
}

const fieldCount = computed(() => {
  if (!schema.value?.items) return 0
  return Array.isArray(schema.value.items) ? schema.value.items.length : Object.keys(schema.value.items).length
})

const onFileSelected = async () => {
  const f = file.value
  if (!f) return
  try {
    const text = await f.text()
    const data = JSON.parse(text)
    schema.value = data
    setMessage('Schema loaded from file.', 'success')
  } catch (e) {
    setMessage('Failed to parse JSON file.', 'error')
  }
}

const LS_MULTI_KEY = 'schemaBuilder.schemas'
const LS_SINGLE_KEY = 'schemaBuilder.schema'

const getSavedList = (): AnyRecord[] => {
  try {
    const raw = localStorage.getItem(LS_MULTI_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  try {
    const single = localStorage.getItem(LS_SINGLE_KEY)
    if (single) {
      const parsed = JSON.parse(single)
      const entry = { name: parsed?.name || 'step', label: parsed?.label || '', items: parsed?.items || [] }
      localStorage.setItem(LS_MULTI_KEY, JSON.stringify([entry]))
      return [entry]
    }
  } catch {}
  return []
}

const openSavedDialog = () => {
  savedList.value = getSavedList()
  selectedSavedName.value = savedList.value[0]?.name || ''
  savedDialog.value = true
}

const loadSelectedSaved = () => {
  const entry = savedList.value.find(s => s.name === selectedSavedName.value)
  if (!entry) return
  const saved = entry
  let out: AnyRecord
  if (Array.isArray(saved.items)) {
    out = convertFromBuilder(saved)
  } else {
    out = saved
  }
  schema.value = out
  setMessage(`Loaded saved schema: ${entry.name}`, 'success')
  savedDialog.value = false
}

const convertFromBuilder = (saved: AnyRecord): AnyRecord => {
  const itemsMap: AnyRecord = {}
  const list = saved.items || []
  for (const it of list) {
    const name = (it?.name || '').trim()
    if (!name) continue
    let visible: any = undefined
    const vr: string = it?.visibleRaw?.trim?.() || ''
    if (vr) {
      if (vr.startsWith('{')) {
        try { visible = JSON.parse(vr) } catch { visible = vr }
      } else {
        visible = vr
      }
    }
    const isNumber = it?.type === 'Number'
    const prefillVal = it?.prefillValue
    const prefill = prefillVal !== undefined && prefillVal !== ''
      ? { value: isNumber && !Number.isNaN(Number(prefillVal)) ? Number(prefillVal) : prefillVal }
      : undefined

    itemsMap[name] = {
      name,
      display: { ...(it?.display || {}) },
      rule: typeof it?.required === 'boolean' ? (it.required ? 'required' : undefined) : it?.rule,
      props: it?.props || {},
      type: it?.type,
      enum: it?.type === 'Radio' ? (it?.enum || []).filter((o: any) => o?.label || o?.value) : undefined,
      value_constraints: it?.type === 'Number' ? (it?.value_constraints || {}) : undefined,
      visible,
      prefill
    }
  }
  return { name: saved?.name || 'step', label: saved?.label || '', endpoint: saved?.endpoint, items: itemsMap }
}

const clearSchema = () => {
  schema.value = null
  setMessage('Cleared current schema.', 'info')
}

const exportSchema = () => {
  if (!schema.value) return
  const json = JSON.stringify(schema.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'schema.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  setMessage('Exported schema.json', 'success')
}

const onSubmit = async () => {
  const payload = { ...formData.value }
  submittedOpen.value = true
  submitResult.value = null
  const endpoint = schema.value?.endpoint
  if (!endpoint) return
  try {
    submitting.value = true
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    let bodyText = ''
    try { bodyText = await res.text() } catch { bodyText = '' }
    submitResult.value = { status: res.status, body: bodyText }
    setMessage(res.ok ? 'Submitted successfully' : 'Submission failed', res.ok ? 'success' : 'error')
  } catch (e) {
    submitResult.value = { status: 0, body: String(e) }
    setMessage('Submission error', 'error')
  } finally {
    submitting.value = false
  }
}

const prettyFormData = computed(() => JSON.stringify(formData.value, null, 2))
</script>

<style scoped>
</style>
