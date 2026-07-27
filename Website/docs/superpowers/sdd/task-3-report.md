# Task 3 实施报告

## 状态

完成。Task 3 的设计 token、全局样式、导航数据、共享导航/页脚、动态比例媒体网格和 Reveal 组件均已实现；未初始化 Git、未提交，且未提前组合 Homepage 页面。

## 文件

新增：

- `Shared/styles/tokens.css`
- `Shared/styles/global.css`
- `Shared/data/navigation.js`
- `Shared/components/SiteHeader.jsx`
- `Shared/components/SiteHeader.module.css`
- `Shared/components/SiteFooter.jsx`
- `Shared/components/SiteFooter.module.css`
- `Shared/components/MediaGrid.jsx`
- `Shared/components/MediaGrid.module.css`
- `Shared/components/Reveal.jsx`
- `Shared/components/Reveal.module.css`
- `Shared/test/SiteHeader.test.jsx`
- `Shared/test/MediaGrid.test.jsx`
- `Shared/test/SharedPrimitives.test.jsx`
- `docs/superpowers/sdd/task-3-report.md`

修改：

- `src/main.jsx`（加载全局样式）
- `src/test/setup.js`（每个测试后清理 DOM）

## RED / GREEN

### RED

先创建三个共享组件测试文件后运行：

```text
npm test -- Shared/test
```

结果：退出码 1，3 个测试套件均无法解析尚不存在的 `SiteHeader`、`MediaGrid`、`SiteFooter` 和 `Reveal` 组件导入。这是预期的缺失实现失败。

### GREEN

实现共享组件及样式后，最后运行：

```text
npm test -- Shared/test
```

结果：退出码 0；3 个测试文件、9/9 测试通过。

覆盖：

- OUR BRANDS 点击打开、四个品牌链接、Escape 关闭并恢复焦点、外部点击关闭；
- 移动菜单的命名控制、弹层语义与仅在打开时锁定 body 滚动；
- 滚动后的 header 状态；
- MediaGrid 渲染所有数据项、由每项 `ratio` 驱动比例 class/`data-ratio`、传入最小卡宽；
- Footer 的联系/社交导航及 Reveal 初始状态。

## 命令结果

- `npm test -- Shared/test`：退出码 0；3 files、9/9 tests passed。
- `npm test`：退出码 0；5 files、20/20 tests passed。
- `npm run build`：退出码 0；Vite production build 成功。
- IDE lint：Shared 组件/测试、`src/main.jsx`、`src/test/setup.js` 均无诊断。

## 自查

- 全部新增和修改的网站代码均位于 `Website/`。
- token 使用 Manrope、暖白 `#F7F6F2` 与炭黑 `#181817`，并提供响应式 gutter/section/typography token。
- 全局样式没有圆角或卡片阴影；按钮和下拉菜单为直角、边框式。
- `MediaGrid` 使用 `repeat(auto-fit, minmax(min(100%, var(--card-min)), 1fr))`；卡片比例只来自项目 `ratio`，不依赖 child index。
- Header 初始透明，滚动后变为暖白实底及细边框；支持 hover/click/focus、Escape、失焦、外部 pointer down、路由链接关闭。
- 移动菜单保留可访问名称和 dialog 语义，并只在开启期间锁滚动。
- 全局与组件级 reduced-motion 规则禁用非必要动画；Reveal 同时在用户偏好减少动效时立即显示。
- Homepage 保持现有最小占位实现，未执行 Task 4 页面组合。

## 关注事项

- Manrope 当前通过 Google Fonts `@import` 加载；离线或受限网络时会使用已配置的系统回退字体。
- 当前裁切素材来自截图，仍受 Task 2 所述源分辨率限制；后续获得原始摄影时可原位替换素材文件。

## 审查修复追加记录（2026-07-21）

### 修复内容

- 将桌面品牌组的 Escape 处理移到包含触发器和品牌链接的容器，因此焦点位于任一品牌链接时也能关闭菜单并恢复到 OUR BRANDS。
- About、Experience、News、Contact 四个桌面主导航链接均在路由选择时显式关闭品牌菜单。
- 移动菜单补全模态键盘行为：
  - 打开后将焦点移入弹层第一个控制项；
  - Tab 在末项回到首项，Shift+Tab 在首项回到末项；
  - Escape 关闭菜单并恢复到 MENU 触发器；
  - 保留 `aria-modal="true"`、dialog 命名和打开期间 body 滚动锁定。
- Reveal 在 `IntersectionObserver` 不存在或不是可调用构造器时立即显示内容，避免旧环境或测试环境永久隐藏。
- MediaGrid 新增 2、5、8 项数据集覆盖，每项均验证自己的 ratio 元数据结构。

修改文件：

- `Shared/components/SiteHeader.jsx`
- `Shared/components/Reveal.jsx`
- `Shared/test/SiteHeader.test.jsx`
- `Shared/test/MediaGrid.test.jsx`
- `Shared/test/SharedPrimitives.test.jsx`
- `docs/superpowers/sdd/task-3-report.md`

### TDD 证据

先加入审查回归测试并运行：

```text
npm test -- Shared/test
Test Files  2 failed | 1 passed (3)
Tests       4 failed | 13 passed (17)
```

预期 RED 分别证明：品牌链接上的 Escape 未关闭、移动菜单未移入焦点/未圈定焦点、缺少 IntersectionObserver 时 Reveal 未回退显示。MediaGrid 的 2/5/8 项测试直接通过，因为现有数据驱动实现已满足该明确 Minor，本轮补齐的是覆盖。

实现后最终 GREEN：

```text
npm test -- Shared/test
Test Files  3 passed (3)
Tests       20 passed (20)
```

### 最终命令结果

- `npm test -- Shared/test`：退出码 0；3 files、20/20 tests passed。
- `npm test`：退出码 0；5 files、31/31 tests passed。
- `npm run build`：退出码 0；Vite production build 成功。
- IDE lint：本轮修改的组件和测试无诊断。

### 修复后自查与关注事项

- 已覆盖四个桌面主路由各自关闭品牌菜单，不只抽样一个路由。
- 模态焦点圈定基于弹层内启用的 button 与带 `href` 的链接；Task 3 当前移动菜单不含表单控件。后续若加入 input/select/textarea，应同步扩展可聚焦元素选择器。
- 未修改 Homepage 组合、未执行 Task 4、未初始化 Git、未提交。
- Google Fonts 网络依赖与截图素材分辨率限制维持不变。
