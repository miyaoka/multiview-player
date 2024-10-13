<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  videoId: string;
}>();

// ヘッダーの高さ
const headerHeight = 50;
// スパチャの高さ
const tickerHeight = 40;
// 固定メッセージの高さ
const pinnedHeight = 56;
// フッターの高さ
const footerHeight = 52 + 2;
// メッセージの左右padding
const msgPaddingWidth = 24;
// メッセージのauthorアイコン+margin幅
const authorWidth = 40;

const containerPadding = 8;
const containerHeight = "40%";

const clipTop = headerHeight + tickerHeight + pinnedHeight;
const clipBottom = footerHeight;
const clipRight = msgPaddingWidth - containerPadding;
const clipLeft = authorWidth + msgPaddingWidth - containerPadding;
const clipInset = [clipTop, clipRight, clipBottom, clipLeft].map((v) => `${v}px`).join(" ");
const clipWidth = 300 - clipRight - clipLeft;

const clipStyle = {
  top: `-${clipTop}px`,
  right: `-${clipRight}px`,
  left: `-${clipLeft}px`,
  clipPath: `inset(${clipInset})`,
  height: `calc(100% + ${clipTop + clipBottom}px)`,
};

// 左右どちらに配置するか
const isRight = ref(true);

const containerStyle = computed(() => {
  return {
    height: containerHeight,
    width: `${clipWidth}px`,
    ...(isRight.value ? { right: 0 } : { left: 0 }),
  };
});

const chatUrl = computed(() => {
  const url = new URL("https://www.youtube.com/live_chat");
  url.searchParams.set("v", props.videoId);
  url.searchParams.set("embed_domain", location.hostname);
  url.searchParams.set("dark_theme", "1");
  return url.toString();
});

function togglePosition() {
  isRight.value = !isRight.value;
}
</script>

<template>
  <div class="absolute top-0" :style="containerStyle">
    <div class="absolute w-[300px] overflow-hidden opacity-80" :style="clipStyle">
      <iframe class="absolute size-full" :src="chatUrl" />
    </div>

    <button
      class="absolute top-[calc(100%-8px)] grid size-11 place-items-center rounded-full shadow-lg"
      :class="{
        'left-0': !isRight,
        'right-0': isRight,
      }"
      @click="togglePosition"
    >
      <div class="grid size-6 place-items-center rounded-full bg-black/50">
        <i
          class="size-5 text-white/50"
          :class="{
            'i-mdi-arrow-right': !isRight,
            'i-mdi-arrow-left': isRight,
          }"
        />
      </div>
    </button>
  </div>
</template>
