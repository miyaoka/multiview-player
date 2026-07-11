import { defineStore } from "pinia";
import { ref } from "vue";

export const usePlayerStore = defineStore("playerStore", () => {
  const playerMap = ref<Map<string, YT.Player>>(new Map());

  // 動画ごとのチャット表示コマンドハンドラー
  // 全体操作は各動画へのコマンド送信のみ行い、表示可否の判断と書き込みは各動画側の処理に委ねる設計
  const chatHandlerMap = ref<Map<string, (show: boolean) => void>>(new Map());

  // 動画ごとのライブ判定（onReady 時点で確定した値）
  // getDuration() はライブ配信の再生中に経過時間（非0）を返すため、実行時評価では判定できない
  const liveStatusMap = ref<Map<string, boolean>>(new Map());

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
    liveStatusMap.value.delete(videoId);
  }

  // ライブ判定を記録（onReady 時点で確定させる）
  function setLiveStatus(videoId: string, isLive: boolean) {
    liveStatusMap.value.set(videoId, isLive);
  }

  // チャット表示コマンドハンドラーを登録
  function addChatHandler(videoId: string, handler: (show: boolean) => void) {
    chatHandlerMap.value.set(videoId, handler);
  }
  // チャット表示コマンドハンドラーを削除
  function removeChatHandler(videoId: string) {
    chatHandlerMap.value.delete(videoId);
  }
  // 全動画にチャット表示コマンドを送る
  function setAllChatVisibility(show: boolean) {
    chatHandlerMap.value.forEach((handler) => {
      handler(show);
    });
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
      if (videoId === ignoreId) return;

      // ライブ中ならシークしない。onReady 前で判定が未確定（undefined）の場合もスキップ
      if (liveStatusMap.value.get(videoId) !== false) return;

      const time = player.getCurrentTime();
      player.seekTo(time + offset, true);
    });
  }

  function setActiveVideoId(id: string | null) {
    activeVideoId.value = id;
  }
  return {
    playerMap,
    liveStatusMap,
    isSyncSeek,
    activeVideoId,
    toggleSyncSeek,
    addPlayer,
    removePlayer,
    setLiveStatus,
    addChatHandler,
    removeChatHandler,
    setAllChatVisibility,
    playAll,
    pauseAll,
    muteAll,
    unmuteVideo,
    seekOffsetAll,
    setActiveVideoId,
  };
});
