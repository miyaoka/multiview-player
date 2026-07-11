<script setup lang="ts">
import { computed, ref } from "vue";
import IconChevronDown from "~icons/mdi/chevron-down";
import IconChevronLeft from "~icons/mdi/chevron-left";
import IconChevronRight from "~icons/mdi/chevron-right";
import IconChevronUp from "~icons/mdi/chevron-up";

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
const footerHeight = 88;
// メッセージの左右padding
const msgPaddingWidth = 24;
// メッセージのauthorアイコン+margin幅
const authorWidth = 40;

const containerPadding = 8;
// 縦サイズ（通常時 / フル表示時）
const halfHeight = "40%";
// フル表示でも下端をセル境界から離し、丸角と輪郭を見せる
// （グリッドは gap なしなので、100% にすると縦に並んだ隣接セルのチャットと地続きに見える）
const fullHeightBottomGap = 12;
const fullHeight = `calc(100% - ${fullHeightBottomGap}px)`;

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
const isRight = ref(false);
// 縦フルサイズ表示か
const isFullHeight = ref(true);

const containerStyle = computed(() => {
  return {
    height: isFullHeight.value ? fullHeight : halfHeight,
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

function toggleFullHeight() {
  isFullHeight.value = !isFullHeight.value;
}
</script>

<template>
  <div class="group absolute top-0" :style="containerStyle">
    <div
      class="absolute size-full overflow-hidden rounded-b-xl outline-1 -outline-offset-1 outline-white/50 outline-solid"
    >
      <div class="absolute w-[300px] overflow-hidden opacity-85" :style="clipStyle">
        <iframe class="absolute size-full" :src="chatUrl" />
      </div>
    </div>
    <!-- 左右トグル: 動画中央側の辺の中央（左配置なら右辺、右配置なら左辺）。親セルが overflow-hidden のため辺の内側に収める -->
    <button
      class="group/btn absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center opacity-0 transition-opacity group-hover:opacity-100"
      :class="isRight ? 'left-0' : 'right-0'"
      @click="togglePosition"
    >
      <div
        class="grid size-7 place-items-center rounded-full border border-white/40 bg-black/60 shadow-md backdrop-blur-sm transition-transform group-hover/btn:scale-110"
      >
        <component :is="isRight ? IconChevronLeft : IconChevronRight" class="size-5 text-white" />
      </div>
    </button>
    <!-- 縦サイズトグル: 下辺中央 -->
    <button
      class="group/btn absolute bottom-0 left-1/2 grid size-11 -translate-x-1/2 place-items-center opacity-0 transition-opacity group-hover:opacity-100"
      @click="toggleFullHeight"
    >
      <div
        class="grid size-7 place-items-center rounded-full border border-white/40 bg-black/60 shadow-md backdrop-blur-sm transition-transform group-hover/btn:scale-110"
      >
        <component :is="isFullHeight ? IconChevronUp : IconChevronDown" class="size-5 text-white" />
      </div>
    </button>
  </div>
</template>
