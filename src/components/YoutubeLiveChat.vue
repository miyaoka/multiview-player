<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  videoId: string;
}>();

const chatUrl = computed(() => {
  const url = new URL("https://www.youtube.com/live_chat");
  url.searchParams.set("v", props.videoId);
  url.searchParams.set("embed_domain", location.hostname);
  url.searchParams.set("dark_theme", "1");
  return url.toString();
});
</script>

<template>
  <div
    class="absolute bottom-[-86px] right-[-80px] top-[-90px] w-[300px] overflow-hidden opacity-80"
  >
    <iframe class="absolute left-[-55px] size-full" :src="chatUrl" />
  </div>
</template>
