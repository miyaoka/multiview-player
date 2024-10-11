<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { computed, onMounted } from "vue";
import { useRoute, useRouter, type LocationQueryValue } from "vue-router";
import GlobalMenu from "@/components/GlobalMenu.vue";
import VideoGrid from "@/components/VideoGrid.vue";
import { sortOptimalLayout, type GridLayout } from "@/libs/grid";
import { useVideoListStore } from "@/stores/videoListStore";

const route = useRoute();
const router = useRouter();
const { width: windowWidth, height: windowHeight } = useWindowSize();
const videoListStore = useVideoListStore();

const sampleList: string[] = [
  // "-w_wHBUVOe4",
  // "cM_Gcwx-itQ",
  // "gum19GF7sxg",
  // "CMJwr1nDmnc",
  // "h6-BNWk0GE4",
  // "_osdlijHr6U",
];

// 動画の数に応じた最適なレイアウトを算出
const gridLayout = computed<GridLayout | undefined>(() => {
  const list = sortOptimalLayout({
    containerWidth: windowWidth.value,
    containerHeight: windowHeight.value,
    contentCount: videoListStore.contentCount,
  });
  const topLayout = list[0];
  return topLayout?.layout;
});

// クエリから動画IDを取得
function queryValueToArray(queryValue: LocationQueryValue | LocationQueryValue[]): string[] {
  if (queryValue == null) return [];
  if (Array.isArray(queryValue)) {
    return queryValue.filter((v) => typeof v === "string");
  }
  return [queryValue];
}

// mount時にURLクエリから動画IDを取得
onMounted(() => {
  const list = queryValueToArray(route.query.v);

  // ユニークなidだけにする
  const uniqueList = Array.from(new Set(list));
  // 変化があればquery更新
  if (list.length !== uniqueList.length) {
    router.replace({
      query: {
        ...route.query,
        v: uniqueList,
      },
    });
  }
  // storeにセット
  videoListStore.setVideoList(list.length > 0 ? list : sampleList);
});
</script>

<template>
  <main
    class="relative flex h-screen w-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800"
  >
    <VideoGrid v-if="gridLayout" :gridLayout="gridLayout" />
    <div v-else class="rounded-3xl bg-white p-8">
      <p class="text-xl">右上のメニューからYouTubeの動画URLを入力してください</p>
    </div>

    <GlobalMenu />
  </main>
</template>
