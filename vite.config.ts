import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

// アプリと単体テスト（vitest.config.ts）が共通で使う plugin
export const createSharedPlugins = () => [
  tailwindcss(),
  vue(),
  vueDevTools(),
  // Icons の scale: 1 は icon svg を 1em 基準にする (default は 1.2em)。
  // 旧 @egoist/tailwindcss-icons の icon (1em 基準) と同サイズを維持する
  Icons({ compiler: "vue3", scale: 1 }),
];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    ...createSharedPlugins(),
    // Worker コードを持たない静的アセットのみの構成なので、型生成は不要。
    // dev / preview / test の各サーバーで workerd を起動するため、単体テストには入れない
    cloudflare({ types: { generate: false } }),
  ],
});
