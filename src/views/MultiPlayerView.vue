<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { computed } from "vue";
import { useRoute, type LocationQueryValue } from "vue-router";
import { calculateGridLayout, enumerateGridDimensions } from "@/libs/grid";

const route = useRoute();
const { width: windowWidth, height: windowHeight } = useWindowSize();

const sampleList = [
  "-w_wHBUVOe4",
  "cM_Gcwx-itQ",
  "gum19GF7sxg",
  "CMJwr1nDmnc",
  "h6-BNWk0GE4",
  "_osdlijHr6U",
];

function queryValueToArray(queryValue: string | LocationQueryValue[]): string[] {
  if (queryValue == null) return [];

  if (Array.isArray(queryValue)) {
    return queryValue.filter((v) => typeof v === "string");
  }

  return [queryValue];
}

const vidList = computed(() => {
  const queryV = route.query.v ?? [];
  const vidList = queryValueToArray(queryV);

  if (vidList.length === 0) {
    return sampleList;
  }
  return vidList;
});

const contentCount = computed(() => vidList.value.length);
const contentAspectRatio = 16 / 9;

const gridLayout = computed<GridLayout>(() => {
  const gridDimensionList = enumerateGridDimensions({ count: vidList.value.length });
  const gridLayoutList = gridDimensionList.map((gridDimension) => {
    return calculateGridLayout({
      containerWidth: windowWidth.value,
      containerHeight: windowHeight.value,
      gridDimension,
      contentCount: contentCount.value,
      contentAspectRatio,
    });
  });

  return gridLayoutList.sort((a, b) => b.contentAreaTotal - a.contentAreaTotal)[0];
});
</script>

<template>
  <main class="bg-black">
    <div
      class="grid h-screen w-screen outline"
      :style="{
        ...gridLayout.gridStyle,
      }"
    >
      <div
        v-for="(cell, cellIdx) in gridLayout.cellList"
        :key="cellIdx"
        class="flex items-center justify-center overflow-hidden"
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
          <iframe
            class="size-full"
            :src="`https://www.youtube.com/embed/${vidList[cellIdx]}`"
            title="YouTube video player"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  </main>
</template>
