<script setup lang="ts">
import { computed, ref } from "vue";
import { enumerateCellCounts } from "@/libs/canvas";

const canvasWidth = ref(400);
const canvasHeight = ref(300);
const rectCount = ref(5);
const rectAspectRatio = ref(16 / 9);

const cellCountList = computed(() => enumerateCellCounts({ count: rectCount.value }));

interface CellRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
const cellRectList = computed<
  {
    title: string;
    isHorizontal: boolean;
    rectArea: number;
    cellList: CellRect[];
  }[]
>(() => {
  const result = cellCountList.value.map((cellCount) => {
    const { horizontal, vertical } = cellCount;
    const cellList = [];
    const cellWidth = canvasWidth.value / horizontal;
    const cellHeight = canvasHeight.value / vertical;
    const cellAspectRatio = cellWidth / cellHeight;

    // rectのaspectRatioよりcellのaspectRatioが大きい場合はcellHeightを使う

    // cellがrectより横長か
    const isHorizontal = cellAspectRatio > rectAspectRatio.value;

    const rectWidth = isHorizontal ? cellHeight * rectAspectRatio.value : cellWidth;
    const rectHeight = isHorizontal ? cellHeight : cellWidth / rectAspectRatio.value;
    const rectArea = rectWidth * rectHeight;
    const title = `${horizontal}x${vertical}`;

    for (let i = 0; i < vertical; i++) {
      for (let j = 0; j < horizontal; j++) {
        cellList.push({
          x: j * cellWidth,
          y: i * cellHeight,
          width: cellWidth,
          height: cellHeight,
        });
      }
    }
    return {
      title,
      isHorizontal,
      rectArea,
      cellList,
    };
  });

  return result.sort((a, b) => b.rectArea - a.rectArea);
});
</script>

<template>
  <main class="grid place-items-center p-4">
    <div class="fixed left-2 top-2 z-10 flex flex-col bg-gray-100 p-2 shadow">
      <label>
        <p>Canvas Width: {{ canvasWidth }}</p>
        <input type="range" v-model="canvasWidth" min="50" max="500" step="1" />
      </label>
      <label>
        <p>Canvas Height: {{ canvasHeight }}</p>
        <input type="range" v-model="canvasHeight" min="50" max="500" step="1" />
      </label>
      <label>
        <p>Rect Count: {{ rectCount }}</p>
        <input type="range" v-model="rectCount" min="1" max="16" step="1" />
      </label>
      <label>
        <p>Rect Aspect Ratio: {{ Number(rectAspectRatio).toFixed(2) }}</p>
        <input type="range" v-model="rectAspectRatio" min="1" max="4" step="0.01" />
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
        v-for="(cellRectPattern, i) in cellRectList"
        :key="i"
        class="relative outline"
        :style="{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }"
      >
        <div class="absolute right-full flex flex-col px-2">
          <p>{{ cellRectPattern.title }}</p>
          <p>
            {{ cellRectPattern.isHorizontal ? "Horizontal" : "Vertical" }}
          </p>
          <p>
            {{ cellRectPattern.rectArea.toFixed(1) }}
          </p>
        </div>
        <div
          v-for="(cellRect, j) in cellRectPattern.cellList"
          :key="j"
          class="absolute flex items-center justify-center outline outline-1 outline-gray-300"
          :style="{
            left: `${cellRect.x}px`,
            top: `${cellRect.y}px`,
            width: `${cellRect.width}px`,
            height: `${cellRect.height}px`,
          }"
        >
          <div
            v-if="j < rectCount"
            :class="`bg-gray-600 text-white text-sm flex items-center justify-center ${cellRectPattern.isHorizontal ? 'h-full' : 'w-full'}`"
            :style="{
              aspectRatio: `${rectAspectRatio}`,
            }"
          >
            {{ j + 1 }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
