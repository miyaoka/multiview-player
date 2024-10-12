<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import PlayerMenu from "./PlayerMenu.vue";
import { useYouTubeIframeAPI } from "@/composables/useYouTubeIframeApi";
import { usePlayerStore } from "@/stores/playerStore";
import { useVideoListStore } from "@/stores/videoListStore";

const props = defineProps<{
  videoId: string;
  index: number;
}>();

const playerStore = usePlayerStore();
const videoListStore = useVideoListStore();
const youTubeIframeAPI = useYouTubeIframeAPI();

const playerEl = ref<HTMLElement | null>(null);
const player = ref<YT.Player | null>(null);
const isMuted = ref(true);
const isPaused = ref(true);
const isLive = ref(false);
const volume = ref(0);
const currentTime = ref(0);

// 音声ONの動画に色をつける
const volumeStyle = computed(() => {
  // 動画が1つだけなら表示しない
  if (videoListStore.videoIdList.length < 2) return null;
  // 無音の場合は表示しない
  if (isMuted.value || volume.value === 0) return null;

  // volumeに応じて色を変える
  const min = 128;
  const max = 255;
  const color = Math.round(((max - min) * volume.value) / 100 + min);
  return {
    outlineColor: `rgb(${color} 0 0)`,
  };
});

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

// 再生位置の監視用
let currentTimeIntervalId: ReturnType<typeof setInterval> | undefined = undefined;

// シーク中はpause状態になる。シークバーをクリックしたところでpauseし、離したところでplayingになる
// 元々pause状態だったら何も起こらない
// キー操作の場合puaseが発生しない
// endedの状態からだとplaying->paused->buffering->playingの順になる
function onStateChange(evt: YT.OnStateChangeEvent) {
  switch (evt.data) {
    case YT.PlayerState.PLAYING: {
      isPaused.value = false;
      const time = evt.target.getCurrentTime();
      const offset = time - currentTime.value;
      currentTime.value = time;
      // プレイ中は再生位置を監視
      currentTimeIntervalId = setInterval(() => {
        currentTime.value = evt.target.getCurrentTime();
      }, 1000);

      // 同期シーク中でなければ終了
      if (!playerStore.isSyncSeek) break;
      // 1秒以上でなければシークと判定しない
      if (Math.abs(offset) < 1) break;
      // 操作中の動画でなければ終了
      if (playerStore.activeVideoId !== props.videoId) break;

      // 他の動画もシークさせる
      playerStore.seekOffsetAll(offset, props.videoId);

      break;
    }
    case YT.PlayerState.PAUSED: {
      // 再生位置の監視をを解除
      clearInterval(currentTimeIntervalId);

      isPaused.value = true;
      // const time = evt.target.getCurrentTime();
      // console.log("paused at", time);
      break;
    }
    case YT.PlayerState.BUFFERING: {
      // 再生位置の監視をを解除
      clearInterval(currentTimeIntervalId);
      // const time = evt.target.getCurrentTime();
      // console.log("buffering", time);
      break;
    }

    case YT.PlayerState.ENDED: {
      isPaused.value = true;
      clearInterval(currentTimeIntervalId);
      // durationをcurrentTimeにセット
      const time = evt.target.getDuration();
      currentTime.value = time;
      // console.log("ended", time);
      break;
    }
    case YT.PlayerState.CUED: {
      // console.log("cued");
      break;
    }
    case YT.PlayerState.UNSTARTED: {
      // console.log("unstarted");
      break;
    }
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
      onReady,
      onStateChange,
      onVolumeChange,
    },
  });

  player.value = ytPlayer;
  playerStore.addPlayer(props.videoId, ytPlayer);
});

onBeforeUnmount(() => {
  clearInterval(currentTimeIntervalId);

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
    @pointerenter="playerStore.setActiveVideoId(videoId)"
    @pointerleave="playerStore.setActiveVideoId(null)"
  >
    <div ref="playerEl" />
    <PlayerMenu :videoId="videoId" :index="index" :isMuted="isMuted" :isLive="isLive" />
    <div class="absolute bottom-0 right-0 bg-black p-1 text-xs text-white">
      {{ currentTime.toFixed(0) }}
    </div>
  </div>
</template>
