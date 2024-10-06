<script setup lang="ts">
import { computed, ref } from "vue";
import { calculateGridLayout, enumerateCellCounts, type GridLayout } from "@/libs/canvas";

const canvasWidth = ref(400);
const canvasHeight = ref(300);
const contentCount = ref(5);
const contentAspectRatio = ref(16 / 9);

const cellCountList = computed(() => enumerateCellCounts({ count: contentCount.value }));

const gridLayoutList = computed<GridLayout[]>(() => {
  const result = cellCountList.value.map((cellCount) => {
    return calculateGridLayout({
      canvasWidth: canvasWidth.value,
      canvasHeight: canvasHeight.value,
      cellCount,
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
        <p>Canvas Width: {{ canvasWidth }}</p>
        <input type="range" v-model="canvasWidth" min="50" max="1000" step="1" />
      </label>
      <label>
        <p>Canvas Height: {{ canvasHeight }}</p>
        <input type="range" v-model="canvasHeight" min="50" max="1000" step="1" />
      </label>
      <label>
        <p>Content Count: {{ contentCount }}</p>
        <input type="range" v-model="contentCount" min="1" max="20" step="1" />
      </label>
      <label>
        <p>Content Aspect Ratio: {{ Number(contentAspectRatio).toFixed(2) }}</p>
        <input type="range" v-model="contentAspectRatio" min="1" max="4" step="0.01" />
      </label>
      <div>
        <p>Cell Count List</p>
        <ul>
          <li v-for="(cellCount, i) in cellCountList" :key="i">{{ cellCount }}</li>
        </ul>
      </div>
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
            {{ gridLayout.contentAreaTotal.toFixed(1) }}
          </p>
        </div>

        <div
          class="grid outline"
          :style="{
            ...gridLayout.gridStyle,
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
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
