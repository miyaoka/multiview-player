<script setup lang="ts">
import { computed, ref } from "vue";
import YoutubePlayer from "./YoutubePlayer.vue";
import { useVideoListStore } from "@/stores/videoListStore";

const props = defineProps<{
  videoId: string;
}>();

const videoListStore = useVideoListStore();

const isDragover = ref(false);

const areaIndex = computed(() => videoListStore.getAreaIndex(props.videoId));
const chatUrl = computed(() => {
  const url = new URL("https://www.youtube.com/live_chat");
  url.searchParams.set("v", props.videoId);
  url.searchParams.set("embed_domain", location.hostname);
  url.searchParams.set("dark_theme", "1");
  return url.toString();
});
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
    :class="`${videoId === videoListStore.draggingVideoId ? 'opacity-50' : ''}`"
    :style="`grid-area: a${areaIndex}`"
  >
    <div class="_inner relative aspect-video">
      <YoutubePlayer :videoId="videoId" :index="areaIndex" ref="playerRefs" />
    </div>
    <div
      v-if="showChat"
      class="absolute bottom-[-86px] right-[-80px] top-[-90px] w-[300px] overflow-hidden opacity-80"
    >
      <iframe class="absolute left-[-55px] size-full" :src="chatUrl" />
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
