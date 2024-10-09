<script setup lang="ts">
import { computed, ref } from "vue";
import YoutubePlayer from "./YoutubePlayer.vue";
import { useVideoListStore } from "@/stores/videoListStore";

const props = defineProps<{
  videoId: string;
}>();

const videoListStore = useVideoListStore();
const areaIndex = computed(() => videoListStore.getAreaIndex(props.videoId));
const isDragover = ref(false);

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
    :class="`${videoId === videoListStore.draggingVideoId ? 'opacity-50' : ''}`"
    :style="`grid-area: a${areaIndex}`"
  >
    <div class="_inner relative aspect-video">
      <YoutubePlayer :videoId="videoId" :index="areaIndex" ref="playerRefs" />
    </div>
    <div
      v-if="videoListStore.draggingVideoId && videoListStore.draggingVideoId !== videoId"
      class="absolute size-full"
      :class="`${isDragover ? 'bg-green-500/20  outline outline-green-500 -outline-offset-4' : ''}`"
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
