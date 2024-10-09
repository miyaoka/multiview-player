<script setup lang="ts">
import { computed, ref } from "vue";
import { sortOptimalLayout, type GridLayout } from "@/libs/grid";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const containerWidth = ref(500);
const containerHeight = ref(300);
const contentCount = ref(5);
const contentAspectRatio = ref(16 / 9);

const gridLayoutList = computed<
  {
    minAreaDeviation: number;
    totalAreaDeviation: number;
    minAndtotalAreaDeviation: number;
    layout: GridLayout;
  }[]
>(() => {
  return sortOptimalLayout({
    containerWidth: containerWidth.value,
    containerHeight: containerHeight.value,
    contentCount: contentCount.value,
    contentAspectRatio: contentAspectRatio.value,
  });
});
</script>

<template>
  <main class="grid place-items-center p-4">
    <div class="fixed left-2 top-2 z-10 flex flex-col bg-gray-100 p-2 shadow">
      <label>
        <p>Container Width: {{ containerWidth }}</p>
        <input type="range" v-model.number="containerWidth" min="50" max="1000" step="1" />
      </label>
      <label>
        <p>Container Height: {{ containerHeight }}</p>
        <input type="range" v-model.number="containerHeight" min="50" max="1000" step="1" />
      </label>
      <label>
        <p>Content Count: {{ contentCount }}</p>
        <input type="range" v-model.number="contentCount" min="1" max="20" step="1" />
      </label>
      <label>
        <p>Content Aspect Ratio: {{ Number(contentAspectRatio).toFixed(2) }}</p>
        <input type="range" v-model.number="contentAspectRatio" min="1" max="4" step="0.01" />
      </label>
    </div>

    <div class="grid gap-10">
      <div class="relative" v-for="(item, gridLayoutIdx) in gridLayoutList" :key="gridLayoutIdx">
        <div class="absolute right-full flex w-60 flex-col px-2">
          <p>{{ item.layout.id }}</p>
          <p>
            min:
            {{ numberFormatter.format(item.layout.contentArea.min) }}
          </p>
          <p>
            max:
            {{ numberFormatter.format(item.layout.contentArea.max) }}
          </p>
          <p>
            total:
            {{ numberFormatter.format(item.layout.contentArea.total) }}
          </p>
          <p>
            min dev:
            {{ item.minAreaDeviation.toFixed(5) }}
          </p>
          <p>
            total dev:
            {{ item.totalAreaDeviation.toFixed(5) }}
          </p>
          <p>
            minAndtotal dev:
            {{ item.minAndtotalAreaDeviation.toFixed(5) }}
          </p>
          <p>
            spanList:
            {{ item.layout.gridTemplate }}
          </p>
        </div>

        <div
          class="grid outline"
          :style="{
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
            gridTemplate: item.layout.gridTemplate,
          }"
        >
          <div
            v-for="(_, cellIdx) in contentCount"
            :key="cellIdx"
            class="_cell flex items-center justify-center overflow-hidden outline outline-1 outline-gray-300"
            :style="`grid-area: a${cellIdx}`"
          >
            <div
              class="relative flex flex-col items-center justify-center bg-gray-500 text-sm text-white outline outline-1 -outline-offset-1 outline-white"
              :style="{
                aspectRatio: `${contentAspectRatio}`,
              }"
            >
              <p>#{{ cellIdx }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
._cell {
  container-type: size;

  & > div {
    width: 100%;
    height: auto;

    @container (aspect-ratio > 16/9) {
      width: auto;
      height: 100%;
    }
  }
}
</style>
