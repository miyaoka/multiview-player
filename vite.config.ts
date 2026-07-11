import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config/
export default defineConfig({
  // Icons の scale: 1 は icon svg を 1em 基準にする (default は 1.2em)。
  // 旧 @egoist/tailwindcss-icons の icon (1em 基準) と同サイズを維持する
  plugins: [tailwindcss(), vue(), vueDevTools(), Icons({ compiler: "vue3", scale: 1 })],
});
