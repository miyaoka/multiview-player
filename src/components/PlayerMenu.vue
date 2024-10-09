<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { computed, ref } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useVideoListStore } from "@/stores/videoListStore";

const props = defineProps<{
  videoId: string;
  index: number;
  isMuted: boolean;
}>();

const playerStore = usePlayerStore();
const videoListStore = useVideoListStore();

const hasNext = computed(() => props.index < videoListStore.videoIdList.length - 1);
const hasPrev = computed(() => props.index > 0);

function unmute() {
  playerStore.unmuteVideo(props.videoId);
}

function moveIndex(offset: number) {
  videoListStore.moveVideoIndex(props.index, props.index + offset);
}

function remove() {
  videoListStore.removeVideo(props.videoId);
}

const rootEl = ref<HTMLElement | null>(null);
const isHovered = ref(false);
const isClicked = ref(false);
// timeoutの返り値を格納する変数
let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

// マウスではホバーで開く
useEventListener(rootEl, "mouseenter", () => {
  isHovered.value = true;
});
useEventListener(rootEl, "mouseleave", () => {
  isHovered.value = false;
});

// モバイルはタッチで開き、一定時間で閉じる
useEventListener(rootEl, "click", () => {
  if (isHovered.value) return;
  clearTimeout(timeoutId);
  isClicked.value = true;
  timeoutId = setTimeout(() => {
    isClicked.value = false;
  }, 5000);
});

const isFocused = computed(() => {
  return isHovered.value || isClicked.value;
});
</script>

<template>
  <div
    class="absolute -inset-0 bottom-auto z-10 flex h-16 items-center justify-center"
    ref="rootEl"
  >
    <div
      v-if="isFocused"
      class="flex size-fit flex-row items-center justify-center rounded-full bg-white px-4 shadow-md outline"
    >
      <button
        :disabled="!hasPrev"
        class="grid size-10 place-items-center rounded-full hover:bg-gray-200 disabled:opacity-20"
        @click="moveIndex(-1)"
      >
        <i class="i-mdi-chevron-up size-8" />
      </button>
      <button
        :disabled="!hasNext"
        class=":disabled:opacity-20 grid size-10 place-items-center rounded-full hover:bg-gray-200"
        @click="moveIndex(1)"
      >
        <i class="i-mdi-chevron-down size-8" />
      </button>
      <button
        class="grid size-10 place-items-center rounded-full hover:bg-gray-200"
        @click="unmute"
      >
        <i :class="`${isMuted ? 'i-mdi-volume-off' : 'i-mdi-volume-high'} size-8`" />
      </button>
    </div>

    <div
      v-if="isFocused"
      class="absolute right-4 flex size-fit flex-row items-center justify-center rounded-full bg-white shadow-md outline"
    >
      <button
        class="grid size-10 place-items-center rounded-full hover:bg-gray-200"
        @click="remove"
      >
        <i class="i-mdi-trash-can-outline size-8" />
      </button>
    </div>
  </div>
</template>
