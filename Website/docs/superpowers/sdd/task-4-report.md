# Task 4 实施报告

## 状态

已完成 Homepage 的编辑式组合、Hero 与 Editorial primitives，以及主页所需的独立截图裁切素材。未初始化 Git、未提交，也没有提前实现品牌详情页。

## RED / GREEN

### RED

1. 先新增 `Homepage/Homepage.test.jsx`，然后运行：

   ```text
   npm test -- Homepage/Homepage.test.jsx
   ```

   结果：退出码 1。原占位 Homepage 的页面标题没有句点，且没有品牌、578 Experience、News 和 footer 内容；测试在第一个缺失的 `Building Better Living.` 断言失败。

2. 先将九个主页输出名加入 `scripts/crop-assets.test.js`，然后运行：

   ```text
   npm test -- scripts/crop-assets.test.js
   ```

   结果：退出码 1。manifest 尚未定义新增的主页独立裁切素材，输出数组不匹配。

### GREEN

- 实现 Hero、SectionIntro、SplitFeature、homepage data 和 Homepage 组合后，`npm test -- Homepage/Homepage.test.jsx` 退出码 0，1/1 通过。
- 补充裁切 manifest 后，`npm test -- scripts/crop-assets.test.js` 退出码 0，10/10 通过。

## 文件

新增：

- `Shared/components/Hero.jsx`
- `Shared/components/Hero.module.css`
- `Shared/components/Editorial.jsx`
- `Shared/components/Editorial.module.css`
- `Homepage/homepageData.js`
- `Homepage/Homepage.module.css`
- `Homepage/Homepage.test.jsx`
- `docs/superpowers/sdd/task-4-report.md`

修改：

- `Homepage/Homepage.jsx`
- `scripts/crop-manifest.js`
- `scripts/crop-assets.test.js`

生成：

- `public/assets/home-brand-s-project.webp`
- `public/assets/home-brand-interich.webp`
- `public/assets/home-brand-ioak.webp`
- `public/assets/home-brand-flux.webp`
- `public/assets/home-experience.webp`
- `public/assets/home-news-578.webp`
- `public/assets/home-news-interich.webp`
- `public/assets/home-news-ioak.webp`
- `public/assets/home-news-flux.webp`

## 素材

- 主页继续使用既有 `home-hero.webp` 与 `home-about.webp`。
- 新增品牌网格、578 Experience 和四张新闻缩略图的独立 `Homepage.png` 裁切条目；均只选取摄影区域，不包含导航或文字。
- 已运行 `npm run assets`，并目检 S Project、INTERICH、578 Experience 与新闻裁切：构图对应参考中的建筑外立面、石材/木作、578 展厅与新闻缩略图。

## 视觉与可访问性决策

- 页面顺序严格为 Hero、About split、四品牌动态网格、578 Experience、紧凑 News、footer。
- Hero 使用左侧宽留白文案和右侧建筑摄影的桌面两栏构图；移动端保持可读文本层与保留的图像空间。
- 品牌卡片和新闻卡片使用 `auto-fit/minmax` CSS Grid，数量变化时不会依赖子元素索引或留下固定空槽。
- 采用暖白画布、无圆角、无阴影、细边框和轻量 Manrope 字体层级；图片 hover 仅缩放至 1.02。
- 全页只有 Hero 的一个 `h1`；区块使用 `h2`，品牌和新闻卡使用 `h3`。Hero/Split 的图片分别在 `figure` 中，非关键图片为 lazy loading。
- 全局 `prefers-reduced-motion` 已覆盖非必要动画；新增组件只使用既有短时图片 transition。

## 验证结果

- `npm test -- Homepage/Homepage.test.jsx`：退出码 0，1 file、1/1 tests passed。
- `npm test -- scripts/crop-assets.test.js`：退出码 0，1 file、10/10 tests passed。
- `npm run assets`：退出码 0，主页 WebP 素材已生成。
- `npm test`：退出码 0，6 files、32/32 tests passed。
- `npm run build`：退出码 0，Vite production build 成功。
- IDE diagnostics：本任务新增或修改文件无 lint error。

## 关注事项

- 截图源文件分辨率限制了小尺寸新闻素材的细节；当前按参考尺寸使用，后续可用原始摄影在同名 WebP 位置替换。
- 主页品牌 CTA 已指向规划中的品牌路由，但本任务没有实现或扩展品牌详情页。

## 审查修复追加记录（2026-07-21）

### 修复内容

- 重新测量 `Homepage.png` 新闻摄影区域：四张图均从 `top: 1315` 开始，纯摄影高度为 68px；原 102px 裁切把摄影下方 34px 暖白页面背景包含在素材中。
- 将四个 `home-news-*.webp` 裁切统一修正为 86×68、`landscape`，运行 `npm run assets` 重新生成并逐张目检，成品不再含下半部单色留白。
- 新闻图片元素增加原始 `width="86"`、`height="68"`，CSS 使用对应的 `43 / 34` 比例，避免布局预留空间继续沿用旧 portrait 比例。
- Homepage 专用品牌卡片调整为名称、类别、说明、CTA、图片的 DOM 顺序，与参考图一致；未修改通用 `MediaGrid`。

### TDD RED

先新增品牌卡片 DOM 顺序测试：

```text
npm test -- Homepage/Homepage.test.jsx
Test Files  1 failed (1)
Tests       1 failed | 1 passed (2)
```

失败点为品牌 heading/CTA 位于 `figure` 之后，符合审查问题。

先新增四个新闻裁切的明确摄影边界断言：

```text
npm test -- scripts/crop-assets.test.js
Test Files  1 failed (1)
Tests       1 failed | 10 passed (11)
```

失败显示旧高度 102 不等于实测纯摄影高度 68。

随后新增新闻渲染比例预留测试：

```text
npm test -- Homepage/Homepage.test.jsx
Test Files  1 failed (1)
Tests       1 failed | 2 passed (3)
```

失败显示新闻图片缺少实测的 86×68 尺寸属性。

### TDD GREEN 与最终结果

- `npm test -- Homepage/Homepage.test.jsx`：退出码 0，1 file、3/3 tests passed。
- `npm test -- scripts/crop-assets.test.js`：退出码 0，1 file、11/11 tests passed。
- `npm run assets`：退出码 0，四张新闻 WebP 已按 86×68 重新生成。
- `npm test`：退出码 0，6 files、35/35 tests passed。
- `npm run build`：退出码 0，Vite production build 成功。
- IDE diagnostics：本轮修改文件无 lint error。

### 修复后关注事项

- 新闻原图在参考截图中仅有 86×68px，清除留白后构图正确，但清晰度仍受截图源限制。
- 未执行 Task 5、未初始化 Git、未提交。
