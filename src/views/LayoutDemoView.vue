<script setup lang="ts">
import { computed, ref } from "vue";
import { enumerateCellCounts } from "@/libs/canvas";

const canvasWidth = ref(400);
const canvasHeight = ref(300);
const rectCount = ref(5);
const rectAspectRatio = ref(16 / 9);

const cellCountList = computed(() => enumerateCellCounts({ count: rectCount.value }));

interface CellLayout {
  title: string;
  isHorizontal: boolean;
  rectArea: number;
  cellCount: {
    horizontal: number;
    vertical: number;
  };
  spanList: number[];
  columnTemplate: string;
}
const cellRectList = computed<CellLayout[]>(() => {
  const result = cellCountList.value.map((cellCount) => {
    const { horizontal, vertical } = cellCount;

    const totalCellCount = horizontal * vertical;
    // 余ったcellの数
    const remainingCells = totalCellCount - rectCount.value;

    const firstRowColumns = horizontal - remainingCells;
    const otherRowColumns = horizontal;
    // 1つの基本単位の幅を計算
    // 最小公倍数を使って基本単位を決定
    const lcm = getLCM(firstRowColumns, otherRowColumns);

    // グリッドテンプレート列を設定
    const columnTemplate = `repeat(${lcm}, 1fr)`;

    const spanList = [];
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

    const grow = horizontal - remainingCells;
    for (let v = 0; v < vertical; v++) {
      for (let h = 0; h < horizontal; h++) {
        const cellIndex = v * horizontal + h;
        spanList.push(lcm / (cellIndex < grow ? firstRowColumns : otherRowColumns));
      }
    }
    return {
      title,
      isHorizontal,
      rectArea,
      spanList,
      cellCount,
      columnTemplate,
      remainingCells,
    };
  });

  return result.sort((a, b) => b.rectArea - a.rectArea);
});

function getStyle(cellLayout: CellLayout) {
  const { horizontal, vertical } = cellLayout.cellCount;

  return {
    display: "grid",
    width: `${canvasWidth.value}px`,
    height: `${canvasHeight.value}px`,

    gridTemplateColumns: cellLayout.columnTemplate, // horizontal列
    gridTemplateRows: Array.from({ length: vertical }, () => "1fr").join(" "), // vertical行
  };
}

// 最大公約数を求める関数
function getGCD(a: number, b: number): number {
  return b === 0 ? a : getGCD(b, a % b);
}

// 最小公倍数を求める関数
function getLCM(a: number, b: number): number {
  return (a * b) / getGCD(a, b);
}
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
        :style="getStyle(cellRectPattern)"
      >
        <div class="absolute right-full flex flex-col px-2">
          <p>{{ cellRectPattern.title }}</p>
          <p>
            {{ cellRectPattern.isHorizontal ? "Horizontal" : "Vertical" }}
          </p>
          <p>
            {{ cellRectPattern.rectArea.toFixed(1) }}
          </p>
          <p>
            remainingCells:
            {{ cellRectPattern.remainingCells }}
          </p>
        </div>
        <div
          v-for="(span, j) in cellRectPattern.spanList"
          :key="j"
          class="flex items-center justify-center overflow-hidden outline outline-1 outline-gray-300"
          :style="{
            gridColumn: `span ${span}`,
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
