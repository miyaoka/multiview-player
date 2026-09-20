# Multiview Player

YouTube動画を複窓しやすくするツール。Vue 3 の SPA で、Vercel にデプロイされる。

## 検証コマンド

```sh
pnpm typecheck # vue-tsc
pnpm lint      # oxlint (.ts) + ESLint (.ts/.vue)
pnpm fix       # lint 自動修正 + oxfmt フォーマット
pnpm test      # Vitest (jsdom)
```

## 技術スタック

| レイヤー       | 技術                                             |
| -------------- | ------------------------------------------------ |
| フロントエンド | Vue 3 + Pinia + Vue Router                       |
| ビルド         | Vite（`@tailwindcss/vite` プラグイン）           |
| CSS            | Tailwind CSS v4                                  |
| アイコン       | unplugin-icons（per-icon component import）      |
| テスト         | Vitest + jsdom（テストは実装と同ディレクトリ）   |
| リンター       | oxlint（TypeScript）/ ESLint（Vue + TypeScript） |
| フォーマッタ   | oxfmt                                            |

## 規約

### アイコン

- unplugin-icons の per-icon component import で書く
- import パスは `~icons/<collection>/<kebab-name>`、ローカル名は `Icon<PascalName>` で明示 import する
- size / color は Tailwind class で指定する。svg は `currentColor` + 1em 基準（`vite.config.ts` の `Icons({ scale: 1 })`）
- 状態でアイコンを切り替える場合は `<component :is>` で描画する

```vue
<script setup lang="ts">
import IconPlay from "~icons/mdi/play";
</script>
<template>
  <IconPlay class="size-8" />
</template>
```

### import

- モジュール参照はすべて相対パスで書く（path alias を定義しない）

### CSS クラス名

- Tailwind ユーティリティ以外のカスタム CSS クラスには `_` プレフィックスを付ける（例: `_cell`）

### 依存管理

- package.json のバージョンはすべて exact pin（range 指定しない）
