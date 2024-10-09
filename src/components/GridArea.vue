<script setup lang="ts">
import { computed } from "vue";
import YoutubePlayer from "./YoutubePlayer.vue";
import { useVideoListStore } from "@/stores/videoListStore";

const props = defineProps<{
  videoId: string;
}>();

const videoListStore = useVideoListStore();
const areaIndex = computed(() => videoListStore.getAreaIndex(props.videoId));
</script>

<template>
  <div
    class="_cell relative flex items-center justify-center overflow-hidden bg-zinc-900 shadow-[inset_10px_10px_50px_rgb(0_0_0_/_0.5)]"
    :style="`grid-area: a${areaIndex}`"
  >
    <div class="_inner relative aspect-video">
      <YoutubePlayer :videoId="videoId" :index="areaIndex" ref="playerRefs" />
    </div>
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
