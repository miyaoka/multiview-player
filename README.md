# Multiview Player

YouTube動画を複窓しやすくするツール

https://multiview-player.vercel.app/

## 機能

- URL貼り付けで複数のYouTube動画をグリッド表示
- 全動画の一括操作（再生 / 停止 / ミュート / 前後シーク）
- 連結シーク（1つの動画をシークすると全動画が連動）
- ライブ配信のチャットオーバーレイ表示
- ドラッグ&ドロップによる並び替え
- メニューの編集欄で動画リストを一括編集（URL 一覧の追加・削除・並び替え）

## 開発

### 必要環境

[mise](https://mise.jdx.dev/) でツールバージョンを管理している（Node.js / pnpm、バージョンは `mise.toml` 参照）。

```sh
mise install
pnpm install
```

### コマンド

```sh
pnpm dev       # 開発サーバー起動
pnpm build     # プロダクションビルド
pnpm test      # テスト実行 (Vitest)
pnpm typecheck # 型チェック (vue-tsc)
pnpm lint      # lint (oxlint + ESLint)
pnpm fix       # lint 自動修正 + フォーマット (oxfmt)
```

pre-commit フックは [lefthook](https://github.com/evilmartians/lefthook) が管理しており、`pnpm install` 時に自動でインストールされる。

### 技術スタック

- [Vue 3](https://vuejs.org/) + [Pinia](https://pinia.vuejs.org/) + [Vue Router](https://router.vuejs.org/)
- [Vite](https://vitejs.dev/) + [Vitest](https://vitest.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [unplugin-icons](https://github.com/unplugin/unplugin-icons)（アイコン）
- [ESLint](https://eslint.org/) + [oxlint](https://oxc.rs/docs/guide/usage/linter.html)（linter）/ [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)（formatter）
