<template>
  <div v-if="chartData && chartData.labels && chartData.labels.length > 0" style="height: 300px;">
    <Bar :data="chartData" :options="options" />
  </div>
  <div v-else class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
    <p class="text-gray-500">Cargando datos del gráfico...</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ labels: [], datasets: [] })
  }
})

const chartData = computed(() => {
  if (!props.data || !props.data.labels || !props.data.datasets) {
    return { labels: [], datasets: [] }
  }
  return props.data
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => '$' + value.toLocaleString()
      }
    }
  }
}
</script>