<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter, type LocationQueryValue } from "vue-router";
import type YoutubePlayerComponent from "@/components/YoutubePlayer.vue";
import YoutubePlayer from "@/components/YoutubePlayer.vue";
import {
  enumerateGridDimensions,
  selectOptimalLayout,
  type GridLayout,
} from "@/libs/grid";
import { getYouTubeVideoId } from "@/libs/youtube";

const route = useRoute();
const router = useRouter();
const { width: windowWidth, height: windowHeight } = useWindowSize();

const sampleList: string[] = [
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
const urlInput = ref("");

const contentCount = computed(() => vidList.value.length);

const gridLayout = computed<GridLayout | undefined>(() => {
  const gridDimensionList = enumerateGridDimensions({ count: vidList.value.length });

  const list = selectOptimalLayout({
    gridDimensionList,
    containerWidth: windowWidth.value,
    containerHeight: windowHeight.value,
    contentCount: vidList.value.length,
    contentAspectRatio,
  });
  const topLayout = list[0];
  return topLayout?.layout;
});

const cellList = computed(() => {
  if (!gridLayout.value) return [];
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
  let list = vidList.value.slice();
  const item = list[from];
  list = list.filter((_, index) => index !== from);
  list = [...list.slice(0, to), item, ...list.slice(to)];

  updateQuery(list);
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

function updateQuery(urls: string[]) {
  router.push({
    query: {
      ...route.query,
      v: urls,
    },
  });
}

function onUrlsSubmit(e: Event) {
  e.preventDefault();
  const urls = urlInput.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  urlInput.value = "";

  const vids = urls.flatMap((url) => getYouTubeVideoId(url) ?? []);
  const mergedList = [...vidList.value, ...vids];

  updateQuery(mergedList);
}
</script>

<template>
  <main
    class="group relative flex h-screen w-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800"
  >
    <div
      v-if="gridLayout"
      class="grid size-full"
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
    <div v-else class="rounded-3xl bg-white p-8">
      <p class="text-xl">右上のメニューからYouTubeの動画URLを入力してください</p>
    </div>

    <div
      class="absolute right-2 top-2 z-10 flex items-center justify-center rounded-full bg-yellow-400 px-4 opacity-0 shadow-md outline group-hover:opacity-100"
      :class="`${gridLayout ? 'opacity-0' : 'opacity-100'}`"
    >
      <button
        :disabled="!gridLayout"
        class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
        @click="playAll"
      >
        <i class="i-mdi-play size-8" />
      </button>

      <button
        :disabled="!gridLayout"
        class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
        @click="pauseAll"
      >
        <i class="i-mdi-pause size-8" />
      </button>

      <button
        :disabled="!gridLayout"
        class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
        @click="muteAll"
      >
        <i class="i-mdi-volume-mute size-8" />
      </button>
      <button
        class="grid size-11 place-items-center rounded-full hover:bg-yellow-200"
        popovertarget="editListPopover"
      >
        <i class="i-mdi-add size-8" />
      </button>
      <div
        popover
        id="editListPopover"
        class="bottom-auto left-auto right-0 top-0 overflow-visible p-0"
      >
        <div class="flex max-h-dvh w-[500px] flex-col overflow-hidden">
          <div class="flex min-h-11 place-items-center bg-gray-200 px-4 font-bold">
            <p>リスト追加</p>
            <button
              class="absolute right-0 z-10 flex size-11 items-center justify-center text-gray-400 hover:text-gray-600"
              popovertarget="editListPopover"
              popovertargetaction="hide"
            >
              <i class="i-mdi-close size-6"></i>
            </button>
          </div>

          <div class="flex-1 overflow-auto p-4">
            <div class="flex flex-col">
              <p class="text-base font-bold">
                YouTubeの動画URLを入力してください（改行で複数入力可）
              </p>

              <form @submit="onUrlsSubmit" class="flex flex-col gap-2">
                <textarea v-model="urlInput" class="bg-gray-200 p-2" rows="5"></textarea>
                <button type="submit" class="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300">
                  追加
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
