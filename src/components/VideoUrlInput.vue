<script setup lang="ts">
import { ref } from "vue";
import { useVideoListStore } from "@/stores/videoListStore";

const videoListStore = useVideoListStore();
const urlInputTextarea = ref("");

const emit = defineEmits<{
  submit: [];
}>();

// 動画追加フォームのハンドリング
function onUrlsSubmit(e: Event) {
  e.preventDefault();

  // テキストエリアから動画追加
  videoListStore.addVideoByText(urlInputTextarea.value);
  // 入力クリア
  urlInputTextarea.value = "";

  emit("submit");
}
</script>

<template>
  <div class="flex flex-col overflow-hidden rounded-lg bg-white outline">
    <div class="relative flex min-h-11 place-items-center bg-gray-200 px-4 font-bold">
      <p>リスト追加</p>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <div class="flex flex-col">
        <p class="text-base font-bold">YouTubeの動画URLを入力してください（改行で複数入力可）</p>

        <form @submit="onUrlsSubmit" class="flex flex-col gap-2">
          <textarea v-model="urlInputTextarea" class="bg-gray-200 p-2" rows="5"></textarea>
          <button
            type="submit"
            class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            追加
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
