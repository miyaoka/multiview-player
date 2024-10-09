<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import YoutubePlayerFactory from "youtube-player";
import { type YouTubePlayer } from "youtube-player/dist/types";
import PlayerMenu from "./PlayerMenu.vue";
import { usePlayerStore } from "@/stores/playerStore";

const eventsMap = new Map([
  [-1, "unstarted"],
  [0, "ended"],
  [1, "playing"],
  [2, "paused"],
  [3, "buffering"],
  [5, "cued"],
]);

const props = defineProps<{
  videoId: string;
  index: number;
}>();

const playerStore = usePlayerStore();

const elementId = ref(`youtube-player-${props.videoId}`);
const player = ref<YouTubePlayer | null>(null);
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

function onPlayerReady(e: CustomEvent) {
  const evt = e as CustomEvent & { target: YouTubePlayer };
  evt.target.mute();
}

function onVolumeChange(e: CustomEvent) {
  const data = (e as CustomEvent & { data: { volume: number; muted: boolean } }).data;

  volume.value = data.volume;
  isMuted.value = data.muted;
}

function onPlayerStateChange(
  e: CustomEvent<any> & {
    data: number;
  },
) {
  const event = eventsMap.get(e.data);
  if (event === "playing") {
    isPaused.value = false;
  } else if (event === "paused") {
    isPaused.value = true;
  }
}

onMounted(async () => {
  const ytPlayer = YoutubePlayerFactory(elementId.value, {
    videoId: props.videoId,
    width: "100%",
    height: "100%",
    playerVars: {
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      enablejsapi: 1,
    },
  });
  ytPlayer.on("ready", onPlayerReady);
  ytPlayer.on("stateChange", onPlayerStateChange);
  ytPlayer.on("volumeChange", onVolumeChange);

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
    class="group/player flex size-full items-center justify-center outline outline-4 -outline-offset-4 outline-transparent"
    :style="volumeStyle"
  >
    <PlayerMenu :videoId="videoId" :index="index" :isMuted="isMuted" />
    <div :id="elementId" />
  </div>
</template>
