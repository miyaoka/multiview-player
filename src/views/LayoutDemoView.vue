<script setup lang="ts">
import { computed, ref } from "vue";
import {
  enumerateGridDimensions,
  selectOptimalLayout,
  type GridLayout,
} from "@/libs/grid";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const containerWidth = ref(697);
const containerHeight = ref(300);
const contentCount = ref(3);
const contentAspectRatio = ref(16 / 9);

const gridDimensionList = computed(() => enumerateGridDimensions({ count: contentCount.value }));

const gridLayoutList = computed<
  {
    minAreaDeviation: number;
    totalAreaDeviation: number;
    minAndtotalAreaDeviation: number;
    id: string;
    layout: GridLayout;
  }[]
>(() => {
  return selectOptimalLayout({
    gridDimensionList: gridDimensionList.value,
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
        <input type="range" v-model="containerWidth" min="50" max="1000" step="1" />
      </label>
      <label>
        <p>Container Height: {{ containerHeight }}</p>
        <input type="range" v-model="containerHeight" min="50" max="1000" step="1" />
      </label>
      <label>
        <p>Content Count: {{ contentCount }}</p>
        <input type="range" v-model="contentCount" min="1" max="20" step="1" />
      </label>
      <label>
        <p>Content Aspect Ratio: {{ Number(contentAspectRatio).toFixed(2) }}</p>
        <input type="range" v-model="contentAspectRatio" min="1" max="4" step="0.01" />
      </label>
    </div>

    <div class="grid gap-10">
      <div class="relative" v-for="(item, gridLayoutIdx) in gridLayoutList" :key="gridLayoutIdx">
        <div class="absolute right-full flex flex-col px-2">
          <p>{{ item.id }}</p>
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
        </div>

        <div
          class="grid outline"
          :style="{
            ...item.layout.gridStyle,
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
          }"
        >
          <div
            v-for="(cell, cellIdx) in item.layout.cellList"
            :key="cellIdx"
            class="flex items-center justify-center overflow-hidden outline outline-1 outline-gray-300"
            :style="{
              gridColumn: `span ${cell.span}`,
            }"
          >
            <div
              class="relative flex flex-col"
              v-if="cellIdx < contentCount"
              :class="`bg-gray-500 text-white text-sm flex items-center justify-center outline outline-1 -outline-offset-1 outline-white ${cell.isHorizontal ? 'h-full' : 'w-full'}`"
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
