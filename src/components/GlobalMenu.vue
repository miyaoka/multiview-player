<script setup lang="ts">
import { computed, ref } from "vue";
import { getYouTubeVideoId } from "@/libs/youtube";
import { usePlayerStore } from "@/stores/playerStore";
import { useVideoListStore } from "@/stores/videoListStore";

const playerStore = usePlayerStore();
const videoListStore = useVideoListStore();

const urlInputTextarea = ref("");
const hasVideos = computed(() => videoListStore.videoIdList.length > 0);

// 動画追加フォームのハンドリング
function onUrlsSubmit(e: Event) {
  e.preventDefault();
  const urls = urlInputTextarea.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // 入力クリア
  urlInputTextarea.value = "";

  const vids = urls.flatMap((url) => getYouTubeVideoId(url) ?? []);
  if (vids.length === 0) return;
  videoListStore.addVideoList(vids);
}
</script>

<template>
  <div
    class="absolute right-2 top-2 z-10 flex items-center justify-center rounded-full bg-yellow-400 px-4 opacity-0 shadow-md outline group-hover:opacity-100"
    :class="`${hasVideos ? 'opacity-0' : 'opacity-100'}`"
  >
    <button
      :disabled="!hasVideos"
      class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
      @click="playerStore.playAll"
    >
      <i class="i-mdi-play size-8" />
    </button>

    <button
      :disabled="!hasVideos"
      class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
      @click="playerStore.pauseAll"
    >
      <i class="i-mdi-pause size-8" />
    </button>

    <button
      :disabled="!hasVideos"
      class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
      @click="playerStore.muteAll"
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
              <textarea v-model="urlInputTextarea" class="bg-gray-200 p-2" rows="5"></textarea>
              <button type="submit" class="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300">
                追加
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
