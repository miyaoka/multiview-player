<script setup lang="ts">
import { ref } from "vue";
import { getVideoUrlById } from "../libs/youtube";
import { useVideoListStore } from "../stores/videoListStore";

const videoListStore = useVideoListStore();

// 現在設定中の動画リストをURL一覧として初期表示（表示順に合わせる）
// 末尾に改行を入れておき、開いてすぐ最終行へ追記できるようにする
const urlInputTextarea = ref(
  videoListStore.videoIdGridOrder.map((id) => `${getVideoUrlById(id)}\n`).join(""),
);

const emit = defineEmits<{
  submit: [];
}>();

// 動画リスト編集フォームのハンドリング
function onUrlsSubmit(e: Event) {
  e.preventDefault();

  // テキストエリアの内容でリスト全体を置き換え
  videoListStore.setVideoListByText(urlInputTextarea.value);

  emit("submit");
}
</script>

<template>
  <div class="flex flex-col overflow-hidden rounded-lg bg-white outline-solid">
    <div class="relative flex min-h-11 place-items-center bg-gray-200 px-4 font-bold">
      <p>リスト編集</p>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <div class="flex flex-col">
        <p class="text-base font-bold">YouTubeの動画URLを1行ずつ入力してください</p>
        <p class="text-sm text-gray-600">行の追加・削除・並び替えがそのままリストに反映されます</p>

        <form @submit="onUrlsSubmit" class="flex flex-col gap-2">
          <textarea
            v-model="urlInputTextarea"
            class="bg-gray-200 p-2"
            rows="8"
            cols="46"
          ></textarea>
          <button
            type="submit"
            class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            反映
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
