<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter, type LocationQueryValue } from "vue-router";
import type YoutubePlayerComponent from "@/components/YoutubePlayer.vue";
import YoutubePlayer from "@/components/YoutubePlayer.vue";
import { sortOptimalLayout, type GridLayout } from "@/libs/grid";
import { getYouTubeVideoId } from "@/libs/youtube";

const route = useRoute();
const router = useRouter();
const { width: windowWidth, height: windowHeight } = useWindowSize();

const sampleList: string[] = [
  "-w_wHBUVOe4",
  "cM_Gcwx-itQ",
  "gum19GF7sxg",
  "CMJwr1nDmnc",
  "h6-BNWk0GE4",
  // "_osdlijHr6U",
];

// v-forでレンダリングする用の動画IDリスト
// 並び替えすると表示リセットされてしまうので追加削除のみ行う
const vIdList = ref<string[]>([]);
// gridでの表示順
const vIdGridOrder = ref<string[]>([]);

const playerRefs = ref<InstanceType<typeof YoutubePlayerComponent>[] | null>([]);
const urlInput = ref("");

const contentCount = computed(() => vIdList.value.length);

// 動画の数に応じた最適なレイアウトを算出
const gridLayout = computed<GridLayout | undefined>(() => {
  const list = sortOptimalLayout({
    containerWidth: windowWidth.value,
    containerHeight: windowHeight.value,
    contentCount: contentCount.value,
  });
  const topLayout = list[0];
  return topLayout?.layout;
});

// 全再生
function playAll() {
  if (!playerRefs.value) return;
  playerRefs.value.forEach((playerRef) => {
    const player = playerRef.player;
    if (!player) return;
    player.playVideo();
  });
}

// 全停止
function pauseAll() {
  if (!playerRefs.value) return;
  playerRefs.value.forEach((playerRef) => {
    const player = playerRef.player;
    if (!player) return;
    player.pauseVideo();
  });
}

// 全ミュート
function muteAll() {
  if (!playerRefs.value) return;
  playerRefs.value.forEach((playerRef) => {
    const player = playerRef.player;
    if (!player) return;
    player.mute();
  });
}

// 指定IDの動画のみミュート解除し他はミュート
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

// クエリから動画IDを取得
function queryValueToArray(queryValue: LocationQueryValue | LocationQueryValue[]): string[] {
  if (queryValue == null) return [];
  if (Array.isArray(queryValue)) {
    return queryValue.filter((v) => typeof v === "string");
  }
  return [queryValue];
}

// 動画追加フォームのハンドリング
function onUrlsSubmit(e: Event) {
  e.preventDefault();
  const urls = urlInput.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // 入力クリア
  urlInput.value = "";

  const vids = urls.flatMap((url) => getYouTubeVideoId(url) ?? []);
  if (vids.length === 0) return;
  addVideo(vids);
}

// 動画リストを追加
function addVideo(idList: string[]) {
  const mergedList = [...vIdList.value, ...idList];
  vIdList.value = mergedList;
  vIdGridOrder.value = [...vIdGridOrder.value, ...idList];
}
// 動画リストから削除
function removeVideo(id: string) {
  vIdList.value = vIdList.value.filter((vid) => vid !== id);
  vIdGridOrder.value = vIdGridOrder.value.filter((vid) => vid !== id);
}
// 動画リストの順番を変更
function moveIndex(from: number, to: number) {
  let list = vIdGridOrder.value.slice();
  const item = list[from];
  list = list.filter((_, index) => index !== from);
  list = [...list.slice(0, to), item, ...list.slice(to)];

  vIdGridOrder.value = list;
}

// 動画IDからリスト内のインデックスを取得
function getAreaIndex(vid: string) {
  return vIdGridOrder.value.indexOf(vid);
}

// 現在の動画リストをURLに変換してクリップボードにコピー
function shareUrl() {
  const url = new URL(location.href);
  url.search = new URLSearchParams(vIdGridOrder.value.map((vid) => ["v", vid])).toString();
  navigator.clipboard.writeText(url.href);
}

// 現在の動画リストをURLクエリに反映
function updateQuery(urls: string[]) {
  router.push({
    query: {
      ...route.query,
      v: urls,
    },
  });
}

// mount時にURLクエリから動画IDを取得
onMounted(() => {
  const list = queryValueToArray(route.query.v);

  vIdList.value = list.length > 0 ? list : sampleList;
  vIdGridOrder.value = vIdList.value.slice();
});
</script>

<template>
  <main
    class="group relative flex h-screen w-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800"
  >
    <div
      v-if="gridLayout"
      class="grid size-full"
      :style="{
        gridTemplate: gridLayout.gridTemplate,
      }"
    >
      <div
        v-for="vid in vIdList"
        :key="vid"
        class="_cell relative flex items-center justify-center overflow-hidden bg-zinc-900 shadow-[inset_10px_10px_50px_rgb(0_0_0_/_0.5)]"
        :style="`grid-area: a${getAreaIndex(vid)}`"
      >
        <div class="_inner relative aspect-video">
          <YoutubePlayer
            :video-id="vid"
            :index="getAreaIndex(vid)"
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

<style scoped>
._cell {
  container-type: size;
}
._inner {
  width: 100%;
  height: auto;
}

@container (aspect-ratio > 16/9) {
  ._inner {
    width: auto;
    height: 100%;
  }
}
</style>
