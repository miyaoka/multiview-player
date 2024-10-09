import { defineStore } from "pinia";
import { ref } from "vue";
import type { YouTubePlayer } from "youtube-player/dist/types";

export const usePlayerStore = defineStore("playerStore", () => {
  const playerMap = ref<Map<string, YouTubePlayer>>(new Map());

  // プレイヤーを追加
  function addPlayer(videoId: string, player: YouTubePlayer) {
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
  return {
    playerMap,
    addPlayer,
    removePlayer,
    playAll,
    pauseAll,
    muteAll,
    unmuteVideo,
  };
});
