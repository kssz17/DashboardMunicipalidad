<template>
  <div v-if="chartData && chartData.labels && chartData.labels.length > 0" style="height: 300px;">
    <Pie :data="chartData" :options="options" />
  </div>
  <div v-else class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
    <p class="text-gray-500">Cargando datos del gráfico...</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ labels: [], datasets: [] })
  }
})

const chartData = computed(() => {
  if (!props.data || !props.data.labels || !props.data.datasets) {
    return {
      labels: ['Infraestructura', 'Educación', 'Salud', 'Seguridad', 'Cultura'],
      datasets: [{
        data: [500000, 300000, 400000, 250000, 150000],
        backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        borderWidth: 1
      }]
    }
  }
  return props.data
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || ''
          const value = context.raw || 0
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0
          return `${label}: $${value.toLocaleString()} (${percentage}%)`
        }
      }
    }
  }
}
</script>