<script setup lang="ts">
import { computed, ref } from "vue";
import { calculateGridLayout, enumerateGridDimensions, type GridLayout } from "@/libs/canvas";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const containerWidth = ref(400);
const containerHeight = ref(300);
const contentCount = ref(5);
const contentAspectRatio = ref(16 / 9);

const gridDimensionList = computed(() => enumerateGridDimensions({ count: contentCount.value }));

const gridLayoutList = computed<GridLayout[]>(() => {
  const result = gridDimensionList.value.map((gridDimension) => {
    return calculateGridLayout({
      containerWidth: containerWidth.value,
      containerHeight: containerHeight.value,
      gridDimension,
      contentCount: contentCount.value,
      contentAspectRatio: contentAspectRatio.value,
    });
  });

  return result.sort((a, b) => b.contentAreaTotal - a.contentAreaTotal);
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
      <div
        class="relative"
        v-for="(gridLayout, gridLayoutIdx) in gridLayoutList"
        :key="gridLayoutIdx"
      >
        <div class="absolute right-full flex flex-col px-2">
          <p>
            contentAreaTotal:
            {{ numberFormatter.format(gridLayout.contentAreaTotal) }}
          </p>
        </div>

        <div
          class="grid outline"
          :style="{
            ...gridLayout.gridStyle,
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
          }"
        >
          <div
            v-for="(cell, cellIdx) in gridLayout.cellList"
            :key="cellIdx"
            class="flex items-center justify-center overflow-hidden outline outline-1 outline-gray-300"
            :style="{
              gridColumn: `span ${cell.span}`,
            }"
          >
            <div
              class="flex flex-col"
              v-if="cellIdx < contentCount"
              :class="`bg-gray-600 text-white text-sm flex items-center justify-center ${cell.isHorizontal ? 'h-full' : 'w-full'}`"
              :style="{
                aspectRatio: `${contentAspectRatio}`,
              }"
            >
              <p>#{{ cellIdx }}</p>
              <p>
                {{ cell.span }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
