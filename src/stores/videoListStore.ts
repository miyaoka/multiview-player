import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getYouTubeVideoId } from "../libs/youtube";

interface VideoOptions {
  showChat: boolean;
}

export const useVideoListStore = defineStore("videoListStore", () => {
  const router = useRouter();
  const route = useRoute();

  // ドラッグ中の動画ID
  const draggingVideoId = ref<string | null>(null);

  // 動画IDごとのオプション
  const videoOptionsMap = ref<Map<string, Partial<VideoOptions>>>(new Map());

  // v-forでレンダリングする用の動画IDリスト
  // 並び替えすると表示リセットされてしまうので追加削除のみ行う
  const videoIdList = ref<string[]>([]);
  // gridでの表示順
  const videoIdGridOrder = ref<string[]>([]);
  const contentCount = computed(() => videoIdList.value.length);

  function setVideoList(idList: string[]) {
    videoIdList.value = idList;
    videoIdGridOrder.value = idList;
  }

  // 現在の動画リストをURLクエリに反映
  function updateQuery() {
    router.replace({
      query: {
        ...route.query,
        v: videoIdGridOrder.value,
      },
    });
  }

  // 入力テキストから動画IDを抽出（スペース・改行区切り、重複除去）
  function parseVideoIdsByText(text: string): string[] {
    const urls = text
      .split(/\s+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // id部分を取り出し
    const vids = urls.flatMap((url) => getYouTubeVideoId(url) ?? []);
    return Array.from(new Set(vids));
  }

  // 入力テキストから動画を追加
  function addVideoByText(text: string) {
    const vids = parseVideoIdsByText(text);
    if (vids.length === 0) return;

    // 動画リストに追加
    addVideoList(vids);
  }

  // 入力テキストでリスト全体を置き換え（編集欄からの反映。削除・追加・並び替えを含む）
  function setVideoListByText(text: string) {
    const vids = parseVideoIdsByText(text);

    // videoIdListは並び替えると表示リセットされるため、既存の順序を保ったまま削除・追加のみ行う
    const remainedIdList = videoIdList.value.filter((id) => vids.includes(id));
    const addedIdList = vids.filter((id) => !videoIdList.value.includes(id));
    videoIdList.value = [...remainedIdList, ...addedIdList];

    // 表示順は入力テキストの順序をそのまま反映
    videoIdGridOrder.value = vids;

    // 削除された動画のオプションを破棄
    for (const [id] of videoOptionsMap.value) {
      if (vids.includes(id)) continue;
      videoOptionsMap.value.delete(id);
    }
    updateQuery();
  }
  // 動画リストを追加
  function addVideoList(idList: string[]) {
    // ユニークな動画IDのみ追加
    const uniqueIdList = idList.filter((id) => !videoIdList.value.includes(id));

    const mergedList = [...videoIdList.value, ...uniqueIdList];
    videoIdList.value = mergedList;
    videoIdGridOrder.value = [...videoIdGridOrder.value, ...uniqueIdList];
    updateQuery();
  }
  // 動画リストから削除
  function removeVideo(id: string) {
    videoIdList.value = videoIdList.value.filter((videoId) => videoId !== id);
    videoIdGridOrder.value = videoIdGridOrder.value.filter((videoId) => videoId !== id);
    videoOptionsMap.value.delete(id);
    updateQuery();
  }
  // 動画リストの順番を変更
  function moveVideoIndex(from: number, to: number) {
    let list = videoIdGridOrder.value.slice();
    const item = list[from];
    list = list.filter((_, index) => index !== from);
    list = [...list.slice(0, to), item, ...list.slice(to)];

    videoIdGridOrder.value = list;
    updateQuery();
  }
  // 動画リストの順番を相対的に変更
  function moveVideoRelativeIndex(id: string, offset: number) {
    const index = getAreaIndex(id);
    if (index === -1) return;
    const toIndex = index + offset;
    if (toIndex < 0 || toIndex >= videoIdGridOrder.value.length) return;
    moveVideoIndex(index, toIndex);
  }
  function moveVideoIndexById(fromId: string, toId: string) {
    const fromIndex = getAreaIndex(fromId);
    const toIndex = getAreaIndex(toId);
    if (fromIndex === -1 || toIndex === -1) return;
    moveVideoIndex(fromIndex, toIndex);
  }

  // 現在の動画リストをURLに変換してクリップボードにコピー
  function shareUrl() {
    const url = new URL(location.href);
    url.search = new URLSearchParams(
      videoIdGridOrder.value.map((videoId) => ["v", videoId]),
    ).toString();
    navigator.clipboard.writeText(url.href);
  }

  // 動画IDからリスト内のインデックスを取得
  function getAreaIndex(videoId: string) {
    return videoIdGridOrder.value.indexOf(videoId);
  }

  function setVideoOptions(videoId: string, options: Partial<VideoOptions>) {
    // 既存のオプションを取得
    const currentOptions = videoOptionsMap.value.get(videoId) ?? {};
    // 新しいオプションをマージ
    const newOptions = { ...currentOptions, ...options };
    // マップにセット
    videoOptionsMap.value.set(videoId, newOptions);
  }

  return {
    draggingVideoId,
    videoOptionsMap,
    videoIdList,
    videoIdGridOrder,
    contentCount,
    setVideoList,
    addVideoByText,
    setVideoListByText,
    addVideoList,
    removeVideo,
    moveVideoIndex,
    moveVideoRelativeIndex,
    moveVideoIndexById,
    shareUrl,
    getAreaIndex,
    setVideoOptions,
  };
});
