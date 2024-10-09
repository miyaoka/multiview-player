<script setup lang="ts">
import { computed } from "vue";
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
</script>

<template>
  <div
    class="absolute top-4 z-10 flex flex-row items-center justify-center rounded-full bg-white px-4 shadow-md outline"
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
    <button class="grid size-10 place-items-center rounded-full hover:bg-gray-200" @click="unmute">
      <i :class="`${isMuted ? 'i-mdi-volume-off' : 'i-mdi-volume-high'} size-8`" />
    </button>
    <button class="grid size-10 place-items-center rounded-full hover:bg-gray-200" @click="remove">
      <i class="i-mdi-trash-can-outline size-8" />
    </button>
  </div>
</template>
