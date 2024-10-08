<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import YoutubePlayerFactory from "youtube-player";
import { type YouTubePlayer } from "youtube-player/dist/types";

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
  count: number;
}>();

const emit = defineEmits<{
  remove: [videoId: string];
  unmute: [videoId: string];
  moveIndex: [from: number, to: number];
}>();

const elementId = ref(`youtube-player-${props.videoId}`);
const player = ref<YouTubePlayer | null>(null);

const isMuted = ref(true);
const isPaused = ref(true);
const volume = ref(0);

const volumeStyle = computed(() => {
  if (isMuted.value || volume.value === 0) return null;

  // volumeに応じて色を変える
  const level = (volume.value + 50) / 150;
  return {
    outlineColor: `rgb(255 0 0 / ${level})`,
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
  console.log("onPlayerStateChange", e.data);
  const event = eventsMap.get(e.data);
  if (event === "playing") {
    isPaused.value = false;
  } else if (event === "paused") {
    isPaused.value = true;
  }
}

function toggleMute() {
  // if (isMuted.value) {
  emit("unmute", props.videoId);
  //   return;
  // }
  // player.value?.mute();
}

function moveIndex(diff: number) {
  emit("moveIndex", props.index, props.index + diff);
}

onMounted(async () => {
  console.log("elementId", player.value, elementId.value);
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
});

onBeforeUnmount(() => {
  console.log("destroying player", player.value);
  if (!player.value) return;
  player.value.destroy();
  player.value = null;
});

defineExpose({
  videoId: props.videoId,
  player,
});
</script>

<template>
  <div
    class="group/player flex size-full items-center justify-center outline outline-4 -outline-offset-4 outline-transparent"
    :style="volumeStyle"
  >
    <div
      class="absolute top-4 z-10 flex flex-row items-center justify-center rounded-full bg-white px-4 opacity-0 shadow-md outline group-hover/player:opacity-100"
    >
      <button
        :disabled="props.index === 0"
        class="grid size-10 place-items-center rounded-full hover:bg-gray-200 disabled:opacity-20"
        @click="moveIndex(-1)"
      >
        <i class="i-mdi-chevron-up size-8" />
      </button>
      <button
        :disabled="props.index === props.count - 1"
        class=":disabled:opacity-20 grid size-10 place-items-center rounded-full hover:bg-gray-200"
        @click="moveIndex(1)"
      >
        <i class="i-mdi-chevron-down size-8" />
      </button>
      <button
        class="grid size-10 place-items-center rounded-full hover:bg-gray-200"
        @click="toggleMute"
      >
        <i :class="`${isMuted ? 'i-mdi-volume-off' : 'i-mdi-volume-high'} size-8`" />
      </button>
      <button
        class="grid size-10 place-items-center rounded-full hover:bg-gray-200"
        @click="emit('remove', props.videoId)"
      >
        <i class="i-mdi-cross-circle size-8" />
      </button>
    </div>
    <div :id="elementId" />
  </div>
</template>
