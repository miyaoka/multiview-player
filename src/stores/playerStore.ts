import { defineStore } from "pinia";
import { ref } from "vue";

export const usePlayerStore = defineStore("playerStore", () => {
  const playerMap = ref<Map<string, YT.Player>>(new Map());
  const isIframeApiLoaded = ref(false);

  // YouTubeIframeAPIが読み込まれているか
  function onIframeApiReady(): Promise<void> {
    // 読み込みフラグ済み
    if (isIframeApiLoaded.value) return Promise.resolve();

    return new Promise<void>((resolve) => {
      // YTオブジェクトが存在するか確認
      if (typeof YT !== "undefined" && YT && YT.Player) {
        isIframeApiLoaded.value = true;
        resolve();
        return;
      }
      // YTオブジェクトが無ければscript読み込みを待つ
      window.onYouTubeIframeAPIReady = () => {
        isIframeApiLoaded.value = true;
        resolve();
      };
    });
  }

  // シーク時に全動画を一緒に動かすかどうか
  const isSyncSeek = ref(false);

  function toggleSyncSeek() {
    isSyncSeek.value = !isSyncSeek.value;
  }

  // プレイヤーを追加
  function addPlayer(videoId: string, player: YT.Player) {
    playerMap.value.set(videoId, player);
  }
  // プレイヤーを削除
  function removePlayer(videoId: string) {
    playerMap.value.delete(videoId);
  }

  // 全再生
  function playAll() {
    playerMap.value.forEach((player) => {
      player.playVideo();
    });
  }

  // 全停止
  function pauseAll() {
    playerMap.value.forEach((player) => {
      player.pauseVideo();
    });
  }

  // 全ミュート
  function muteAll() {
    playerMap.value.forEach((player) => {
      player.mute();
    });
  }
  // 指定IDの動画のみミュート解除し他はミュート
  function unmuteVideo(id: string) {
    playerMap.value.forEach((player, videoId) => {
      if (videoId === id) {
        player.unMute();
        return;
      }
      player.mute();
    });
  }
  function seekOffsetAll(offset: number) {
    playerMap.value.forEach((player) => {
      const time = player.getCurrentTime();
      player.seekTo(time + offset, true);
    });
  }
  return {
    playerMap,
    isSyncSeek,
    onIframeApiReady,
    toggleSyncSeek,
    addPlayer,
    removePlayer,
    playAll,
    pauseAll,
    muteAll,
    unmuteVideo,
    seekOffsetAll,
  };
});
