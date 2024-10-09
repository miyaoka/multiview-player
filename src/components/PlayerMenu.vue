<script setup lang="ts">
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

// timeoutの返り値を格納する変数
let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
const isHovered = ref(false);
const isClicked = ref(false);

// メニューが表示されるかどうか
const isMenuVisible = computed(() => isHovered.value || isClicked.value);
const hasNext = computed(() => props.index < videoListStore.videoIdList.length - 1);
const hasPrev = computed(() => props.index > 0);

// マウスではホバーでメニューを開く
function onMouseenter() {
  isHovered.value = true;
}
function onMouseleave() {
  isHovered.value = false;
}
// モバイルはタッチでメニューを開き、一定時間で閉じる
function onClick(evt: MouseEvent) {
  // 既にフォーカスされている場合はスキップ
  if (isMenuVisible.value) return;

  clearTimeout(timeoutId);
  isClicked.value = true;
  timeoutId = setTimeout(() => {
    isClicked.value = false;
  }, 5000);
}

function unmute() {
  playerStore.unmuteVideo(props.videoId);
}

function moveIndex(offset: number) {
  videoListStore.moveVideoIndex(props.index, props.index + offset);
}

function remove() {
  videoListStore.removeVideo(props.videoId);
}
</script>

<template>
  <div
    class="absolute -inset-0 bottom-auto z-10 flex h-16 items-center justify-center"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
    @click.prevent="onClick"
  >
    <template v-if="isMenuVisible">
      <div
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
          class="grid size-10 place-items-center rounded-full hover:bg-gray-200 disabled:opacity-20"
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
        class="absolute right-4 flex size-fit flex-row items-center justify-center rounded-full bg-white shadow-md outline"
      >
        <button
          class="grid size-10 place-items-center rounded-full hover:bg-gray-200"
          @click="remove"
        >
          <i class="i-mdi-trash-can-outline size-8" />
        </button>
      </div>
    </template>
  </div>
</template>
