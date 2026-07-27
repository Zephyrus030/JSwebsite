# Task 2 实施报告

## 状态

完成。已按 TDD 创建裁切清单、Sharp runner、清单/路径边界测试，并生成与视觉检查 9 个 WebP 素材。未初始化 Git、未提交、未实现 Task 3，也未修改 `DesignDrawing/` 下的源截图。

## 文件列表

新增源码与测试：

- `scripts/crop-manifest.js`
- `scripts/crop-assets.mjs`
- `scripts/crop-assets.test.js`
- `public/assets/.gitkeep`

生成素材：

- `public/assets/home-hero.webp`
- `public/assets/home-about.webp`
- `public/assets/experience-hero.webp`
- `public/assets/contact-showroom.webp`
- `public/assets/s-project-hero.webp`
- `public/assets/interich-hero.webp`
- `public/assets/ioak-hero.webp`
- `public/assets/flux-hero.webp`
- `public/assets/news-brighton.webp`

报告：

- `docs/superpowers/sdd/task-2-report.md`

## RED / GREEN 证据

### RED 1：裁切清单

先创建 `scripts/crop-assets.test.js`，再运行：

```text
npm test -- scripts/crop-assets.test.js
```

结果：退出码 1；Vitest 无法解析尚不存在的 `./crop-manifest.js`。失败原因与计划预期一致。

### GREEN 1：裁切清单

创建 `crop-manifest.js` 后运行同一命令：

```text
Test Files  1 passed (1)
Tests       3 passed (3)
```

覆盖计划输出名唯一性、正整数坐标/源图边界、预期比例元数据。

### RED 2：Sharp runner

先加入 `runCrops` 行为与路径边界测试，再运行同一目标测试。

结果：退出码 1；Vitest 无法解析尚不存在的 `./crop-assets.mjs`。失败原因是 runner 尚未实现。

### GREEN 2：Sharp runner

实现 runner 后，首次运行有 1 个失败：Windows 上 Sharp 按路径读取元数据后测试清理临时文件触发 `EBUSY`。测试改为先把输出读入 Buffer 再交给 Sharp，避免测试自身持有文件句柄；生产实现未为此放宽行为。

最终结果：

```text
Test Files  1 passed (1)
Tests       7 passed (7)
Duration    1.88s
```

runner 测试覆盖：实际 WebP 输出及尺寸、源文件名目录穿越、输出文件名目录穿越、输出目录逃逸 `Website/`。

## 命令与结果

- `node --input-type=module -e "...sharp(...).metadata()..."`：确认源图实际尺寸与计划一致：
  - `Homepage.png`：1024×1536
  - `578Experience.png`、`FLUX.png`、`INTERICH.png`、`IOAK.png`、`News.png`、`S_Project.png`：864×1821
  - `Contact.png`：759×2071
- `npm run assets`：退出码 0；9 个 WebP 全部写入 `Website/public/assets/`。
- `npm test -- scripts/crop-assets.test.js`：最终退出码 0；7/7 测试通过。
- Sharp metadata + `fs.stat` 自查：9 个输出均存在、格式可读、尺寸与 manifest 一致，文件大小 8,870–46,978 bytes。
- IDE lint 检查：3 个脚本文件无诊断。

## 生成素材清单

| 输出 | 尺寸 | 大小 | 比例意图 |
| --- | ---: | ---: | --- |
| `home-hero.webp` | 624×420 | 46,978 B | wide |
| `home-about.webp` | 594×214 | 8,870 B | wide |
| `experience-hero.webp` | 416×265 | 13,874 B | landscape |
| `contact-showroom.webp` | 314×244 | 15,360 B | landscape |
| `s-project-hero.webp` | 434×435 | 28,496 B | square |
| `interich-hero.webp` | 459×293 | 13,610 B | landscape |
| `ioak-hero.webp` | 464×364 | 27,790 B | landscape |
| `flux-hero.webp` | 554×350 | 14,640 B | landscape |
| `news-brighton.webp` | 210×350 | 20,010 B | portrait |

所有输出均以 Sharp WebP quality 88 生成。视觉检查确认未包含站点导航或截图中烘焙的界面标题/说明文字。

## 坐标调整及证据

设计规格要求“只裁图像区域，不得包含导航或烘焙文字”，而计划中的若干整幅 hero 矩形实际包含品牌字样、标题、说明或按钮。根据 1:1 像素尺寸与源图/生成图视觉检查，作出以下调整：

- `home-hero.webp`
  - 计划：`(0, 64, 1024, 420)`
  - 最终：`(400, 64, 624, 420)`
  - 证据：整幅区域含 “Building Better Living.” 与 scroll 文字；首次试裁 `left=350` 时左边缘仍出现标题末尾字符，视觉复查后改为 400。
- `home-about.webp`
  - 保持计划：`(430, 510, 594, 214)`；区域为纯室内摄影。
- `experience-hero.webp`
  - 计划：`(0, 58, 864, 331)`
  - 最终：`(384, 448, 416, 265)`
  - 证据：计划区域含建筑号、主标题、副标题与按钮；改用同一 Experience 截图中的完整无字厨房摄影区域，避免只保留分辨率过低的窄条。
- `contact-showroom.webp`
  - 保持计划：`(40, 306, 314, 244)`；“578”为现场建筑标识，属于照片内容而非烘焙界面文字。
- `s-project-hero.webp`
  - 计划：`(0, 65, 864, 435)`
  - 最终：`(430, 65, 434, 435)`
  - 证据：左侧包含 S Project 标识、类别与标题；右侧为无字建筑摄影。
- `interich-hero.webp`
  - 计划：`(0, 65, 864, 445)`
  - 最终：`(320, 700, 459, 293)`
  - 证据：计划 hero 中央包含大型 INTERICH 字样与副标题；改用同截图下方完整无字厨房摄影。
- `ioak-hero.webp`
  - 计划：`(0, 65, 864, 364)`
  - 最终：`(400, 65, 464, 364)`
  - 证据：左侧包含 IOAK 标识、类别、标题与 scroll；右侧为无字室内摄影。
- `flux-hero.webp`
  - 计划：`(0, 65, 864, 350)`
  - 最终：`(310, 65, 554, 350)`
  - 证据：左侧包含 FLUX 标识、类别与标题；右侧为无字产品摄影。
- `news-brighton.webp`
  - 计划：`(8, 398, 210, 470)`
  - 最终：`(8, 398, 210, 350)`
  - 证据：计划高度延伸到日期、地点、项目标题和品牌文字；缩短后仅保留 Brighton 项目摄影。

## 关注事项

- 截图是唯一来源；为严格排除烘焙文字，部分 hero 只能采用干净的局部或同页次级摄影，宽度为 416–624px。当前素材适合按参考截图重建和常规卡片展示，但在 1440px 全宽或高 DPR hero 中会受源分辨率限制，后续若取得原始摄影应按相同语义文件名替换。
- `ratio` 表示后续布局意图，不强制源文件像素比与 CSS 容器完全一致；Task 3/后续页面应使用 `object-fit: cover`。
- runner 固定从 `DesignDrawing/` 读取，并拒绝文件名目录穿越；输出目录也被限制在 `Website/` 内。

## 审查修复追加记录（2026-07-21）

### 修复内容

- 将输出目录保护从纯词法检查升级为物理路径检查：
  - 仍先用 `path.resolve`/`path.relative` 拒绝词法上逃出 `Website/` 的路径。
  - 用 `lstat` 向上查找最近的已存在祖先，随后用 `realpath` 解析其物理位置；若祖先经符号链接解析到 `Website/` 外，在创建目录前即拒绝。
  - 对不存在的安全目录执行递归创建，再次用 `realpath` 校验最终物理输出目录。
  - Sharp 使用校验后的物理输出目录生成文件，不继续使用可能含符号链接的词法路径。
- 将真实裁切测试从仅覆盖 `cropManifest[0]` 改为一次执行完整 `cropManifest`：
  - 在 `Website/scripts/` 下创建隔离临时输出目录。
  - 真实生成全部 9 个素材。
  - 逐项读取输出 Buffer 并用 Sharp 验证格式为 WebP，宽高与对应 manifest 条目完全一致。
  - 测试结束后清理隔离目录。
- 新增真实符号链接逃逸回归测试：
  - 在 `Website/scripts/` 的隔离沙箱内创建指向 `DesignDrawing/` 的目录链接。
  - 使用空 manifest 调用 runner，验证其在任何外部写入发生前拒绝该物理逃逸路径。
  - Windows 本次成功创建并执行 junction 测试，未 skip。
  - 若运行环境因 `EACCES`、`EPERM`、`ENOSYS` 或 `ENOTSUP` 无法创建链接，测试会通过 Vitest 上下文明确标记 skip；其余错误仍会失败，不会伪造通过。

### TDD 证据

RED：

```text
npm test -- scripts/crop-assets.test.js
Test Files  1 failed (1)
Tests       1 failed | 7 passed (8)
AssertionError: promise resolved "[]" instead of rejecting
```

该失败直接复现原实现仅检查词法路径、接受物理上指向 `Website/` 外目录链接的问题。测试使用空 manifest，因此 RED 阶段没有向链接目标写入任何文件。

GREEN：

```text
npm test -- scripts/crop-assets.test.js
Test Files  1 passed (1)
Tests       8 passed (8)
Duration    1.93s
```

本次 Windows 环境执行了符号链接/junction 真实测试，输出为 8 passed、0 skipped。

### 覆盖命令与结果

- `npm test -- scripts/crop-assets.test.js`：退出码 0；1 个测试文件、8/8 测试通过；全部 9 个 manifest 条目均完成真实 WebP 生成、格式与尺寸验证。
- `npm run assets`：退出码 0；安全 runner 成功重新生成计划内 9 个正式素材。
- IDE lint 检查：`crop-assets.mjs` 与 `crop-assets.test.js` 无诊断。

### 修复后关注事项

- 当前实现消除了已存在输出目录链接和“缺失目录位于外部链接祖先下”两种逃逸路径；Node.js 常规路径 API 无法提供类似 POSIX `openat(..., O_NOFOLLOW)` 的完整无竞态目录句柄工作流，因此不把该离线构建脚本描述为可抵御同机恶意进程在校验与写入之间持续替换目录的强对抗沙箱。
- 截图分辨率限制与前述 hero 素材替换建议不变。

## 目标文件链接审查修复（2026-07-21）

### 原因与修复

上一轮只把输出目录解析为通过校验的物理目录；`path.join(physicalOutputDir, crop.output)` 指向的最终文件若预先是符号链接，Sharp 仍会跟随该链接写入。

本轮在每次调用 Sharp 前执行 `lstat(target)`：

- 目标不存在（`ENOENT`）：允许创建。
- 目标是普通文件：允许 Sharp 安全覆盖。
- 目标是 Node.js `lstat().isSymbolicLink()` 识别的符号链接、Windows junction/reparse point：以 `Output target must not be a symbolic link or reparse point` 拒绝。
- 其他文件系统错误：原样抛出，不降级为允许写入。

### 回归测试与 Windows 执行方式

- 新增预置目标文件链接逃逸测试。
- 测试优先尝试创建真正的 file symbolic link；本机 Windows 返回权限限制，因此第一次运行明确显示 `1 skipped`，没有伪造通过。
- 为使安全逻辑在本机真正执行，测试在 Windows file symlink 权限不足时回退到可创建的 directory junction，并把该 reparse point 预置为目标 WebP 路径。
- RED 阶段传入 `width: 0`，保证旧 runner 在 Sharp 参数校验阶段失败，不会跟随 junction 或接触外部目标；安全实现必须在 Sharp 之前以目标链接错误拒绝。
- 新增普通文件覆盖测试：先在隔离输出目录写入普通文本文件，再运行真实裁切并用 Sharp 确认其被有效 WebP 覆盖且尺寸正确。

### TDD 原始结果

首次仅尝试 file symbolic link：

```text
npm test -- scripts/crop-assets.test.js
Test Files  1 passed (1)
Tests       9 passed | 1 skipped (10)
```

该结果明确反映 Windows file symlink 权限限制，未作为漏洞修复的 GREEN 证据。加入可执行的 junction 回退后，旧实现得到预期 RED：

```text
npm test -- scripts/crop-assets.test.js
Test Files  1 failed (1)
Tests       1 failed | 9 passed (10)
Expected   /output target.*symbolic link/i
Received   extract_area: parameter width not set
```

这证明旧 runner 未在 Sharp 前检查最终目标 reparse point。

实现 `lstat` 目标校验后的 GREEN：

```text
npm test -- scripts/crop-assets.test.js
Test Files  1 passed (1)
Tests       10 passed (10)
Duration    1.91s
```

本次最终运行中 file symlink 权限不足后 junction 回退实际执行，结果为 10 passed、0 skipped。

### 覆盖命令与结果

- `npm test -- scripts/crop-assets.test.js`：退出码 0；10/10 通过；包含全部 9 个 manifest 真实裁切验证、目录链接逃逸、目标 reparse point 逃逸和普通文件覆盖。
- `npm run assets`：退出码 0；正式 9 个 WebP 已通过新增目标检查重新生成。
- IDE lint 检查：修改的 runner 与测试文件无诊断。

### 关注事项

- `lstat` 可识别 Node.js 支持的符号链接和 Windows junction/reparse link；普通文件按要求继续允许覆盖。
- 与上一轮相同，离线脚本不宣称抵御同机恶意进程在 `lstat` 与 Sharp 打开目标之间主动替换文件的 TOCTOU 对抗。
