<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useRoute, type LocationQueryValue } from "vue-router";
import type YoutubePlayerComponent from "@/components/YoutubePlayer.vue";
import YoutubePlayer from "@/components/YoutubePlayer.vue";
import { calculateGridLayout, enumerateGridDimensions, type GridLayout } from "@/libs/grid";

const route = useRoute();
const { width: windowWidth, height: windowHeight } = useWindowSize();

const sampleList: string[] = [
  "TAlURS0LlPI",
  "RSDwPAt0Evs",
  "AD9B51reLDY",
  "5iOn4NWyR2E",

  // "-w_wHBUVOe4",
  // "cM_Gcwx-itQ",
  // "gum19GF7sxg",
  // "CMJwr1nDmnc",
  // "h6-BNWk0GE4",
  // "_osdlijHr6U",
];

const contentAspectRatio = 16 / 9;
const vidList = ref<string[]>([]);
const playerRefs = ref<InstanceType<typeof YoutubePlayerComponent>[] | null>([]);

const contentCount = computed(() => vidList.value.length);

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

  const topLayout = gridLayoutList.sort((a, b) => b.contentAreaTotal - a.contentAreaTotal)[0];
  return topLayout;
});

const cellList = computed(() => {
  return gridLayout.value.cellList.map((cell, i) => {
    return {
      ...cell,
      videoId: vidList.value[i],
    };
  });
});

function removeVideo(id: string) {
  vidList.value = vidList.value.filter((vid) => vid !== id);
}
function unmuteVideo(id: string) {
  if (!playerRefs.value) return;

  playerRefs.value.forEach((playerRef) => {
    const player = playerRef.player;
    if (!player) return;
    if (playerRef.videoId === id) {
      player.unMute();
      return;
    }
    player.mute();
  });
}
function playAll() {
  if (!playerRefs.value) return;
  playerRefs.value.forEach((playerRef) => {
    const player = playerRef.player;
    if (!player) return;
    player.playVideo();
  });
}

function pauseAll() {
  if (!playerRefs.value) return;
  playerRefs.value.forEach((playerRef) => {
    const player = playerRef.player;
    if (!player) return;
    player.pauseVideo();
  });
}

function muteAll() {
  if (!playerRefs.value) return;
  playerRefs.value.forEach((playerRef) => {
    const player = playerRef.player;
    if (!player) return;
    player.mute();
  });
}

function moveIndex(from: number, to: number) {
  const list = vidList.value;
  const item = list.splice(from, 1)[0];
  list.splice(to, 0, item);
  vidList.value = list;
}

function queryValueToArray(queryValue: LocationQueryValue | LocationQueryValue[]): string[] {
  if (queryValue == null) return [];
  if (Array.isArray(queryValue)) {
    return queryValue.filter((v) => typeof v === "string");
  }
  return [queryValue];
}

watch(
  () => route.query.v,
  (queryV) => {
    const list = queryValueToArray(queryV);

    vidList.value = list.length > 0 ? list : sampleList;
  },
  { immediate: true },
);
</script>

<template>
  <main class="group relative">
    <div
      class="grid h-screen w-screen outline"
      :style="{
        ...gridLayout.gridStyle,
      }"
    >
      <div
        v-for="(cell, i) in cellList"
        :key="cell.videoId"
        class="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-800"
        :style="{
          gridColumn: `span ${cell.span}`,
        }"
      >
        <div :class="`relative aspect-video ${cell.isHorizontal ? 'h-full' : 'w-full'}`">
          <YoutubePlayer
            :video-id="cell.videoId"
            :index="i"
            :count="contentCount"
            ref="playerRefs"
            @remove="removeVideo"
            @unmute="unmuteVideo"
            @moveIndex="moveIndex"
          />
        </div>
      </div>
    </div>
    <div
      class="absolute right-2 top-2 z-10 flex items-center justify-center rounded-full bg-yellow-400 px-4 opacity-0 shadow-md outline group-hover:opacity-100"
    >
      <button
        class="grid size-11 place-items-center rounded-full hover:bg-yellow-200"
        @click="playAll"
      >
        <i class="i-mdi-play size-8" />
      </button>

      <button
        class="grid size-11 place-items-center rounded-full hover:bg-yellow-200"
        @click="pauseAll"
      >
        <i class="i-mdi-pause size-8" />
      </button>

      <button
        class="grid size-11 place-items-center rounded-full hover:bg-yellow-200"
        @click="muteAll"
      >
        <i class="i-mdi-volume-mute size-8" />
      </button>
      <button class="grid size-11 place-items-center rounded-full hover:bg-yellow-200">
        <i class="i-mdi-add size-8" />
      </button>
    </div>
  </main>
</template>
