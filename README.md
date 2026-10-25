# 開車技巧速查

上車前 30 秒複習用的 PWA。三招：車前距離判斷、倒車入庫、路邊停車。

- 首頁 → 選一招 → 逐步模式（一張一步、左右滑）
- 每招另有完整內容（參照點、步驟、卡住時怎麼辦、適用範圍）
- 全部離線可用（Service Worker 預快取）

## 開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
```

## 部署

推到 `main`，GitHub Actions 自動部署到 GitHub Pages。

## 改內容

所有文字都在 `src/data/tricks.ts`，一招一個物件：

- `oneLiner`：一句心法（首頁卡片與逐步模式第一屏）
- `refs`：參照點
- `steps`：步驟（`action` 大字、`look` 看哪裡、`cue` 口訣）
- `rescue`：卡住時怎麼辦
- `limits`：適用與不適用

新增一招：在 `tricks` 陣列加一個物件，`id` 用英文 kebab-case，`no` 依序編號。
