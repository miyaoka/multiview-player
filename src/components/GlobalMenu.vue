<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { computed, ref } from "vue";
import { usePlayerStore } from "../stores/playerStore";
import { useVideoListStore } from "../stores/videoListStore";
import VideoUrlInput from "./VideoUrlInput.vue";
import IconEllipsesBubble from "~icons/f7/ellipses-bubble";
import IconEllipsesBubbleFill from "~icons/f7/ellipses-bubble-fill";
import IconClose from "~icons/mdi/close";
import IconDotsVertical from "~icons/mdi/dots-vertical";
import IconFastForward from "~icons/mdi/fast-forward";
import IconPause from "~icons/mdi/pause";
import IconPlay from "~icons/mdi/play";
import IconPlus from "~icons/mdi/plus";
import IconRewind from "~icons/mdi/rewind";
import IconToggleSwitch from "~icons/mdi/toggle-switch";
import IconToggleSwitchOffOutline from "~icons/mdi/toggle-switch-off-outline";
import IconVolumeMute from "~icons/mdi/volume-mute";

const playerStore = usePlayerStore();
const videoListStore = useVideoListStore();

// メニューの開閉
const isOpen = ref(false);

const menuEl = ref<HTMLElement | null>(null);
const editListPopoverEl = ref<HTMLElement | null>(null);
const hasVideos = computed(() => videoListStore.videoIdList.length > 0);

function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (!isOpen.value) return;

  // 外をクリックしたら閉じる
  const removeClickOutsideListener = onClickOutside(menuEl, () => {
    isOpen.value = false;
    removeClickOutsideListener();
  });
}

function onVideoUrlSubmit() {
  editListPopoverEl.value?.hidePopover();
}

// チャットを表示中の動画が1つでもあるか
const isAnyChatShown = computed(() =>
  [...videoListStore.videoOptionsMap.values()].some((options) => options.showChat),
);

// 全動画のチャット表示を一括切替（1つでも表示中なら全非表示、なければ全表示）
function toggleAllChat() {
  const show = !isAnyChatShown.value;
  playerStore.playerMap.forEach((player, videoId) => {
    // チャットはライブ配信（durationが0）のみ表示できるため、表示時は非ライブをスキップ
    if (show && player.getDuration() !== 0) return;
    videoListStore.setVideoOptions(videoId, { showChat: show });
  });
}
</script>

<template>
  <div
    ref="menuEl"
    class="absolute top-2 right-2 z-10 flex w-fit flex-col items-end justify-center bg-yellow-400 shadow-md outline-solid"
    :class="{ 'rounded-xl': isOpen, 'rounded-full': !isOpen }"
  >
    <div class="flex flex-row">
      <div v-if="isOpen" class="flex flex-row">
        <button
          :disabled="!hasVideos"
          class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          @click="playerStore.playAll"
          title="Play all"
        >
          <IconPlay class="size-8" />
        </button>

        <button
          :disabled="!hasVideos"
          class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          @click="playerStore.pauseAll"
          title="Pause all"
        >
          <IconPause class="size-8" />
        </button>

        <button
          :disabled="!hasVideos"
          class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          @click="playerStore.muteAll"
          title="Mute all"
        >
          <IconVolumeMute class="size-8" />
        </button>
      </div>

      <button
        class="grid size-11 place-items-center rounded-full hover:bg-yellow-200"
        @click="toggleOpen"
        title="Menu"
      >
        <IconDotsVertical class="size-8" />
      </button>
    </div>
    <div v-if="isOpen" class="flex flex-col items-end justify-center">
      <div class="flex items-center">
        <button
          :disabled="!hasVideos"
          class="relative grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          title="Seek all -10m"
          @click="playerStore.seekOffsetAll(-10 * 60)"
        >
          <IconRewind class="size-7" />
          <p class="absolute bottom-0 text-xs font-bold">-10m</p>
        </button>
        <button
          :disabled="!hasVideos"
          class="relative grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          title="Seek all -1m"
          @click="playerStore.seekOffsetAll(-60)"
        >
          <IconRewind class="size-6" />
          <p class="absolute bottom-0 text-xs font-bold">-1m</p>
        </button>
        <button
          :disabled="!hasVideos"
          class="relative grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          title="Seek all +1m"
          @click="playerStore.seekOffsetAll(60)"
        >
          <IconFastForward class="size-6" />
          <p class="absolute bottom-0 text-xs font-bold">+1m</p>
        </button>
        <button
          :disabled="!hasVideos"
          class="relative grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          title="Seek all +10m"
          @click="playerStore.seekOffsetAll(10 * 60)"
        >
          <IconFastForward class="size-7" />
          <p class="absolute bottom-0 text-xs font-bold">+10m</p>
        </button>
      </div>
      <div class="flex items-center">
        連結してシーク
        <button
          :disabled="!hasVideos"
          class="relative grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          @click="playerStore.toggleSyncSeek"
          title="Sync seek"
        >
          <component
            :is="playerStore.isSyncSeek ? IconToggleSwitch : IconToggleSwitchOffOutline"
            class="size-8"
          />
          <p class="absolute bottom-0 text-xs font-bold">
            {{ playerStore.isSyncSeek ? "ON" : "OFF" }}
          </p>
        </button>
      </div>
      <div class="flex items-center">
        コメント一括
        <button
          :disabled="!hasVideos"
          class="relative grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          @click="toggleAllChat"
          title="Toggle all chats"
        >
          <component
            :is="isAnyChatShown ? IconEllipsesBubbleFill : IconEllipsesBubble"
            class="size-8"
          />
        </button>
      </div>
      <div class="flex items-center">
        動画を追加
        <button
          class="grid size-11 place-items-center rounded-full hover:bg-yellow-200"
          popovertarget="editListPopover"
          title="Add video"
        >
          <IconPlus class="size-8" />
        </button>
      </div>

      <div
        popover
        ref="editListPopoverEl"
        id="editListPopover"
        class="top-2 right-2 bottom-auto left-auto overflow-visible bg-transparent p-0"
      >
        <VideoUrlInput @submit="onVideoUrlSubmit" />
        <button
          class="absolute top-0 right-0 z-10 flex size-11 items-center justify-center text-gray-800 hover:text-gray-600"
          popovertarget="editListPopover"
          popovertargetaction="hide"
        >
          <IconClose class="size-6" />
        </button>
      </div>
    </div>
  </div>
</template>
