import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const useVideoListStore = defineStore("videoListStore", () => {
  const router = useRouter();
  const route = useRoute();

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
  // 動画リストを追加
  function addVideoList(idList: string[]) {
    const mergedList = [...videoIdList.value, ...idList];
    videoIdList.value = mergedList;
    videoIdGridOrder.value = [...videoIdGridOrder.value, ...idList];
    updateQuery();
  }
  // 動画リストから削除
  function removeVideo(id: string) {
    videoIdList.value = videoIdList.value.filter((videoId) => videoId !== id);
    videoIdGridOrder.value = videoIdGridOrder.value.filter((videoId) => videoId !== id);
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
  return {
    videoIdList,
    videoIdGridOrder,
    contentCount,
    setVideoList,
    addVideoList,
    removeVideo,
    moveVideoIndex,
    moveVideoRelativeIndex,
    shareUrl,
    getAreaIndex,
  };
});
