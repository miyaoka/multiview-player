<script setup lang="ts">
import { useTimeoutFn } from "@vueuse/core";
import { computed, ref } from "vue";
import { isTouchDevice, supportsDragAndDrop } from "../libs/device";
import { usePlayerStore } from "../stores/playerStore";
import { useVideoListStore } from "../stores/videoListStore";
import IconEllipsesBubble from "~icons/f7/ellipses-bubble";
import IconEllipsesBubbleFill from "~icons/f7/ellipses-bubble-fill";
import IconChevronDown from "~icons/mdi/chevron-down";
import IconChevronUp from "~icons/mdi/chevron-up";
import IconDrag from "~icons/mdi/drag";
import IconRefresh from "~icons/mdi/refresh";
import IconTrashCanOutline from "~icons/mdi/trash-can-outline";
import IconVolumeHigh from "~icons/mdi/volume-high";
import IconVolumeOff from "~icons/mdi/volume-off";

const props = defineProps<{
  videoId: string;
  index: number;
  isMuted: boolean;
  isLive: boolean;
}>();

const emit = defineEmits<{
  reload: [];
}>();

const playerStore = usePlayerStore();
const videoListStore = useVideoListStore();

// メニューが表示されるかどうか
const isMenuVisible = ref(false);
// メニューを自動で閉じるまでの時間
const menuCloseTimeout = 3000;

const hasNext = computed(() => props.index < videoListStore.videoIdList.length - 1);
const hasPrev = computed(() => props.index > 0);

const videoOptions = computed(() => videoListStore.videoOptionsMap.get(props.videoId));
const showChat = computed(() => videoOptions.value?.showChat);

// DnDが使えるかどうかでメニューを切り替える
const canUseDragAndDrop = computed(() => !isTouchDevice() && supportsDragAndDrop());

// メニューを閉じるタイマー
const { start: startMenuCloseTimer, stop: stopMenuCloseTimer } = useTimeoutFn(
  () => {
    isMenuVisible.value = false;
  },
  menuCloseTimeout,
  { immediate: false },
);

// 一定時間後にメニューを閉じる
function setMenuTimeout() {
  stopMenuCloseTimer();
  startMenuCloseTimer();
}

// ホバーでメニューを開く
// タッチデバイスではクリック後
function onMouseenter() {
  // クリック時にメニュー内のボタンが直接押されないよう 1 フレーム遅らせる
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

function toggleMute() {
  if (props.isMuted) {
    playerStore.unmuteVideo(props.videoId);
  } else {
    playerStore.muteAll();
  }
}

function moveIndex(offset: number) {
  videoListStore.moveVideoIndex(props.index, props.index + offset);
}

function remove() {
  videoListStore.removeVideo(props.videoId);
}

function onDragstart(_e: DragEvent) {
  videoListStore.draggingVideoId = props.videoId;
}
function onDragend(_e: DragEvent) {
  videoListStore.draggingVideoId = null;
}

function toggleChat() {
  const showChat = videoOptions.value?.showChat;
  videoListStore.setVideoOptions(props.videoId, { showChat: !showChat });
}

function reload() {
  emit("reload");
}
</script>

<template>
  <!--
    ラッパーは絶対配置の shrink-to-fit で全メニュー（削除・リロード含む）を内包する 1 枚の
    矩形になり、そこがホバー領域になる。ボタン間の隙間もラッパーの box 内なのでホバーは途切れない。
    メニューは v-if ではなく visibility で隠す。非表示時もレイアウトサイズを保ってホバーの
    当たり判定を作りつつ、hidden な要素はヒットテスト対象外なのでボタンは押せない
  -->
  <div
    class="absolute top-0 left-1/2 z-10 flex h-16 -translate-x-1/2 items-center px-4"
    @mouseenter="onMouseenter"
    @mousemove="onMousemove"
    @mouseleave="onMouseleave"
  >
    <div class="flex flex-row items-center gap-4" :class="{ invisible: !isMenuVisible }">
      <div
        class="flex size-fit flex-row items-center justify-center rounded-full bg-white px-4 shadow-md outline-solid"
      >
        <button
          v-if="canUseDragAndDrop"
          class="grid size-10 cursor-grab touch-none place-items-center rounded-full hover:bg-gray-200 disabled:opacity-20"
          title="Drag to move"
          draggable="true"
          @dragstart="onDragstart"
          @dragend="onDragend"
        >
          <IconDrag class="size-8" />
        </button>

        <button
          v-if="isLive"
          class="grid size-10 place-items-center rounded-full hover:bg-gray-200 disabled:opacity-20"
          title="Toggle chat"
          @click="toggleChat"
        >
          <component :is="showChat ? IconEllipsesBubbleFill : IconEllipsesBubble" class="size-8" />
        </button>

        <template v-if="!canUseDragAndDrop">
          <button
            :disabled="!hasPrev"
            class="grid size-10 place-items-center rounded-full hover:bg-gray-200 disabled:opacity-20"
            @click="moveIndex(-1)"
            title="Move to prev"
          >
            <IconChevronUp class="size-8" />
          </button>
          <button
            :disabled="!hasNext"
            class="grid size-10 place-items-center rounded-full hover:bg-gray-200 disabled:opacity-20"
            @click="moveIndex(1)"
            title="Move to next"
          >
            <IconChevronDown class="size-8" />
          </button>
        </template>

        <button
          class="grid size-10 place-items-center rounded-full hover:bg-gray-200"
          @click="toggleMute"
          title="Toggle mute"
        >
          <component :is="isMuted ? IconVolumeOff : IconVolumeHigh" class="size-8" />
        </button>
      </div>

      <div class="flex flex-row items-center justify-center gap-2">
        <div
          class="flex size-fit flex-row items-center justify-center rounded-full bg-white shadow-md outline-solid"
        >
          <button
            class="grid size-10 place-items-center rounded-full hover:bg-gray-200"
            @click="remove"
            title="Remove"
          >
            <IconTrashCanOutline class="size-8" />
          </button>
        </div>

        <div
          class="flex size-fit flex-row items-center justify-center rounded-full bg-white shadow-md outline-solid"
        >
          <button
            class="grid size-10 place-items-center rounded-full hover:bg-gray-200"
            @click="reload"
            title="Reload player"
          >
            <IconRefresh class="size-8" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
