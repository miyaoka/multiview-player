<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import PlayerMenu from "./PlayerMenu.vue";
import { useYouTubeIframeAPI } from "@/composables/useYouTubeIframeApi";
import { usePlayerStore } from "@/stores/playerStore";

const props = defineProps<{
  videoId: string;
  index: number;
}>();

const playerStore = usePlayerStore();
const youTubeIframeAPI = useYouTubeIframeAPI();

const playerEl = ref<HTMLElement | null>(null);
const player = ref<YT.Player | null>(null);
const isMuted = ref(true);
const isPaused = ref(true);
const volume = ref(0);

const volumeStyle = computed(() => {
  if (isMuted.value || volume.value === 0) return null;

  // volumeに応じて色を変える
  const min = 128;
  const max = 255;
  const color = Math.round(((max - min) * volume.value) / 100 + min);
  return {
    outlineColor: `rgb(${color} 0 0)`,
  };
});

const isLive = ref(false);

function onReady(evt: YT.PlayerEvent) {
  const player = evt.target;

  // 動画の長さが0の場合はライブ配信
  const duration = player.getDuration();
  isLive.value = duration === 0;
}

function onVolumeChange(evt: YT.OnVolumeChangeEvent) {
  const data = evt.data;
  volume.value = data.volume;
  isMuted.value = data.muted;
}

function onStateChange(evt: YT.OnStateChangeEvent) {
  switch (evt.data) {
    case YT.PlayerState.PLAYING:
      isPaused.value = false;
      break;
    case YT.PlayerState.PAUSED:
      isPaused.value = true;
      break;
  }
}

onMounted(async () => {
  if (!playerEl.value) return;
  await youTubeIframeAPI.onReady;

  const ytPlayer = new YT.Player(playerEl.value, {
    videoId: props.videoId,
    width: "100%",
    height: "100%",
    playerVars: {
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      enablejsapi: 1,
      mute: 1,
    },
    events: {
      onReady: onReady,
      onStateChange: onStateChange,
      onVolumeChange,
    },
  });

  player.value = ytPlayer;
  playerStore.addPlayer(props.videoId, ytPlayer);
});

onBeforeUnmount(() => {
  if (!player.value) return;
  playerStore.removePlayer(props.videoId);
  player.value.destroy();
  player.value = null;
});
</script>

<template>
  <div
    class="flex size-full items-center justify-center outline outline-4 -outline-offset-4 outline-transparent"
    :style="volumeStyle"
  >
    <div ref="playerEl" />
    <PlayerMenu :videoId="videoId" :index="index" :isMuted="isMuted" :isLive="isLive" />
  </div>
</template>
