<script setup lang="ts">
import VideoGridArea from "./VideoGridArea.vue";
import type { GridLayout } from "@/libs/grid";
import { useVideoListStore } from "@/stores/videoListStore";

const videoListStore = useVideoListStore();

defineProps<{
  gridLayout: GridLayout;
}>();
</script>

<template>
  <div
    class="grid size-full"
    :style="{
      gridTemplate: gridLayout.gridTemplate,
    }"
  >
    <VideoGridArea
      v-for="videoId in videoListStore.videoIdList"
      :key="videoId"
      :videoId="videoId"
    />
  </div>
</template>
