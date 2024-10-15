<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { computed, ref } from "vue";
import VideoUrlInput from "./VideoUrlInput.vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useVideoListStore } from "@/stores/videoListStore";

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
</script>

<template>
  <div
    ref="menuEl"
    class="absolute right-2 top-2 z-10 flex w-fit flex-col items-end justify-center bg-yellow-400 shadow-md outline"
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
          <i class="i-mdi-play size-8" />
        </button>

        <button
          :disabled="!hasVideos"
          class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          @click="playerStore.pauseAll"
          title="Pause all"
        >
          <i class="i-mdi-pause size-8" />
        </button>

        <button
          :disabled="!hasVideos"
          class="grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          @click="playerStore.muteAll"
          title="Mute all"
        >
          <i class="i-mdi-volume-mute size-8" />
        </button>
      </div>

      <button
        class="grid size-11 place-items-center rounded-full hover:bg-yellow-200"
        @click="toggleOpen"
        title="Menu"
      >
        <i class="i-mdi-dots-vertical size-8" />
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
          <i class="i-mdi-rewind size-7" />
          <p class="absolute bottom-0 text-xs font-bold">-10m</p>
        </button>
        <button
          :disabled="!hasVideos"
          class="relative grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          title="Seek all -1m"
          @click="playerStore.seekOffsetAll(-60)"
        >
          <i class="i-mdi-rewind size-6" />
          <p class="absolute bottom-0 text-xs font-bold">-1m</p>
        </button>
        <button
          :disabled="!hasVideos"
          class="relative grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          title="Seek all +1m"
          @click="playerStore.seekOffsetAll(60)"
        >
          <i class="i-mdi-fast-forward size-6" />
          <p class="absolute bottom-0 text-xs font-bold">+1m</p>
        </button>
        <button
          :disabled="!hasVideos"
          class="relative grid size-11 place-items-center rounded-full hover:bg-yellow-200 disabled:opacity-20"
          title="Seek all +10m"
          @click="playerStore.seekOffsetAll(10 * 60)"
        >
          <i class="i-mdi-fast-forward size-7" />
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
          <i
            class="size-8"
            :class="{
              'i-mdi-toggle-switch': playerStore.isSyncSeek,
              'i-mdi-toggle-switch-off-outline': !playerStore.isSyncSeek,
            }"
          />
          <p class="absolute bottom-0 text-xs font-bold">
            {{ playerStore.isSyncSeek ? "ON" : "OFF" }}
          </p>
        </button>
      </div>
      <div class="flex items-center">
        動画を追加
        <button
          class="grid size-11 place-items-center rounded-full hover:bg-yellow-200"
          popovertarget="editListPopover"
          title="Add video"
        >
          <i class="i-mdi-add size-8" />
        </button>
      </div>

      <div
        popover
        ref="editListPopoverEl"
        id="editListPopover"
        class="bottom-auto left-auto right-2 top-2 overflow-visible bg-transparent p-0"
      >
        <VideoUrlInput @submit="onVideoUrlSubmit" />
        <button
          class="absolute right-0 top-0 z-10 flex size-11 items-center justify-center text-gray-800 hover:text-gray-600"
          popovertarget="editListPopover"
          popovertargetaction="hide"
        >
          <i class="i-mdi-close size-6"></i>
        </button>
      </div>
    </div>
  </div>
</template>
