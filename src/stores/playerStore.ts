import { defineStore } from "pinia";
import { ref } from "vue";

export const usePlayerStore = defineStore("playerStore", () => {
  const playerMap = ref<Map<string, YT.Player>>(new Map());

  // シーク時に全動画を一緒に動かすかどうか
  const isSyncSeek = ref(false);
  // ユーザーが操作中の動画のID
  const activeVideoId = ref<string | null>(null);

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
  function seekOffsetAll(offset: number, ignoreId?: string) {
    playerMap.value.forEach((player, videoId) => {
      // ignoreIdが指定されている場合はそのIDはスキップ
      if (ignoreId && videoId === ignoreId) {
        return;
      }
      const time = player.getCurrentTime();
      player.seekTo(time + offset, true);
    });
  }

  function setActiveVideoId(id: string | null) {
    activeVideoId.value = id;
  }
  return {
    playerMap,
    isSyncSeek,
    activeVideoId,
    toggleSyncSeek,
    addPlayer,
    removePlayer,
    playAll,
    pauseAll,
    muteAll,
    unmuteVideo,
    seekOffsetAll,
    setActiveVideoId,
  };
});
