<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const vidList = computed(() => {
  const v = route.query.v;

  const vv = Array.isArray(v) ? v[0] : v;
  if (!vv) return [];

  return vv.split(",");
});

function adjustGrid(videosCount: number) {
  const container = document.querySelector(".container") as HTMLElement;
  if (!container) return;
  const videos = document.querySelectorAll(".video") as NodeListOf<HTMLElement>;
  if (videos.length === 0) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = 16 / 9;

  let bestColumns = 1;
  let bestRows = videosCount;
  let maxVideoSize = 0;

  // 動画を並べる最適な行数と列数を決めるためにループする
  for (let columns = 1; columns <= videosCount; columns++) {
    const rows = Math.ceil(videosCount / columns);

    // 動画1つあたりの幅と高さを計算する
    const videoWidth = width / columns;
    const videoHeight = videoWidth / aspectRatio;

    // 高さが画面内に収まる場合のみ考慮する
    if (videoHeight * rows <= height) {
      const totalVideoSize = videoWidth * videoHeight; // 各配置パターンでの動画の面積

      // 最も大きく表示できる列・行の組み合わせを選択
      if (totalVideoSize > maxVideoSize) {
        maxVideoSize = totalVideoSize;
        bestColumns = columns;
        bestRows = rows;
      }
    }
  }

  // グリッドレイアウトの設定
  container.style.gridTemplateColumns = `repeat(${bestColumns}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${bestRows}, 1fr)`;

  // 各動画のサイズを設定
  videos.forEach((video) => {
    video.style.width = "100%";
    video.style.height = "100%";
  });
}

useEventListener("resize", () => {
  adjustGrid(vidList.value.length);
});
</script>

<template>
  <main class="container">
    <iframe
      v-for="vid in vidList"
      :key="vid"
      class="video"
      :src="`https://www.youtube.com/embed/${vid}`"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </main>
</template>

<style scoped>
.container {
  display: grid;
  width: 100vw;
  height: 100vh;
}

.video {
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000; /* 動画背景 */
  object-fit: cover;
}
</style>
