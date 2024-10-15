<script setup lang="ts">
import { computed, ref } from "vue";
import YoutubeLiveChat from "./YoutubeLiveChat.vue";
import YoutubePlayer from "./YoutubePlayer.vue";
import { useVideoListStore } from "@/stores/videoListStore";

const props = defineProps<{
  videoId: string;
}>();

const videoListStore = useVideoListStore();

const isDragover = ref(false);

const areaIndex = computed(() => videoListStore.getAreaIndex(props.videoId));

const showChat = computed(() => videoListStore.videoOptionsMap.get(props.videoId)?.showChat);

function ondragenter() {
  isDragover.value = true;
}
function ondragleave() {
  isDragover.value = false;
}
function ondragover(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
  }
}
function ondrop() {
  isDragover.value = false;
  if (!videoListStore.draggingVideoId) return;
  videoListStore.moveVideoIndexById(videoListStore.draggingVideoId, props.videoId);
}
</script>

<template>
  <div
    class="_cell relative flex items-center justify-center overflow-hidden bg-zinc-900 shadow-[inset_10px_10px_50px_rgb(0_0_0_/_0.5)]"
    :class="{
      'opacity-50': videoId === videoListStore.draggingVideoId,
    }"
    :style="`grid-area: a${areaIndex}`"
  >
    <div class="_inner relative aspect-video">
      <YoutubePlayer :videoId="videoId" :index="areaIndex" ref="playerRefs" />
    </div>

    <YoutubeLiveChat v-if="showChat" :videoId="videoId" />

    <div
      v-if="videoListStore.draggingVideoId && videoListStore.draggingVideoId !== videoId"
      class="absolute size-full"
      :class="{
        'bg-green-500/20  outline -outline-offset-4 outline-green-500': isDragover,
      }"
      @dragenter.prevent="ondragenter"
      @dragover.prevent="ondragover"
      @dragleave="ondragleave"
      @drop="ondrop"
    ></div>
  </div>
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
