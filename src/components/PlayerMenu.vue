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

// メニューが表示されるかどうか
const isMenuVisible = ref(false);
// メニューを自動で閉じるまでの時間
const menuCloseTimeout = 3000;

const hasNext = computed(() => props.index < videoListStore.videoIdList.length - 1);
const hasPrev = computed(() => props.index > 0);

let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

// 一定時間後にメニューを閉じる
function setMenuTimeout() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    isMenuVisible.value = false;
  }, menuCloseTimeout);
}

// ホバーでメニューを開く
// タッチデバイスではクリック後
function onMouseenter() {
  // クリック時に直接メニューないのボタンが押されないように遅らせる
  requestAnimationFrame(() => {
    isMenuVisible.value = true;
    setMenuTimeout();
  });
}
// move時にタイマーをセットし直す
function onMousemove() {
  // offなら再度enterし直すまでメニューを開かない
  if (!isMenuVisible.value) return;

  setMenuTimeout();
}
// leave時にメニューを閉じる
// タッチデバイスでは別の要素をクリック時
function onMouseleave() {
  isMenuVisible.value = false;
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
    @mousemove="onMousemove"
    @mouseleave="onMouseleave"
  >
    <template v-if="isMenuVisible">
      <div
        class="relative flex size-fit flex-row items-center justify-center rounded-full bg-white px-4 shadow-md outline"
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

        <div
          class="absolute left-full ml-4 flex size-fit flex-row items-center justify-center rounded-full bg-white shadow-md outline"
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
  </div>
</template>
