# 005：数据展示

## 元数据

- 阶段 ID：005
- 总计划：[p0seid0n：Vue UI 库（首版）](../README.md)
- 实施状态：已完成
- 依赖：003
- 目标引用：G02
- 决策引用：D05、D06、D08

## 目标

把参考站点最具辨识度的数值排版与迷你趋势图做成通用展示组件，并提供三态主题切换（system / light / dark）。

## 范围

### 包含

- `stat`：标签 + 数值 + 单位 + 可选内联图形槽
- `sparkline`：手写 SVG 迷你面积图，支持基线标记
- `theme-provider`：注入主题状态、提供首屏脚本片段
- `theme-switcher`：基于 003 的 ghost 按钮 + 004 的 dropdown-menu 的三态菜单

### 排除

- 任何带坐标轴、刻度或交互的图表
- 多系列图表与图例

## 前置条件

- 003 完成（button、card 可用）
- 004 完成后方可实现 theme-switcher 的菜单部分；stat 与 sparkline 不依赖 004

## 设计

### 模块边界与目标路径

| 模块或路径 | 现有或拟议 | 职责 | 计划变更 |
| --- | --- | --- | --- |
| `registry/ui/stat/` | 拟议 | 数值排版 | 新建 |
| `registry/ui/sparkline/` | 拟议 | 迷你图形 | 新建 |
| `registry/ui/theme-provider/` | 拟议 | 主题状态与首屏脚本 | 新建 |
| `registry/ui/theme-switcher/` | 拟议 | 三态切换菜单 | 新建 |

### 接口与数据

数值排版取自参考站点 `stat-value.tsx`：

| 项 | 值 |
| --- | --- |
| 数值字号 | 26px（sm 断点 24px，lg 断点 28px） |
| 数值字重 | 500 |
| 数值字族 | `font-condensed` |
| 字距 | -0.01em |
| 数字排布 | `font-variant-numeric: tabular-nums` |
| 单位字号 | 14px（lg 16px），`font-sans`，`text-ink-muted` |
| 单位左边距 | 6px |
| 空值样式 | `text-ink-faint` |

曲线型图形取自参考站点 `stat-value.tsx` 的 `PingStrip`：

- `viewBox` 为 `0 0 slots 1`，`preserveAspectRatio="none"`，高度 `0.7em`
- 每槽填充 0.6，其余为间隙
- 顶部截断为 `median * 3`，避免少数尖峰压平其余
- 基线与数值基线对齐（`items-baseline`）

API 约定：

```text
Stat          props: label, value, unit?, emptyText (默认 '—'), tone ('default'|'accent'|'accent-alt')
              slots: figure（放在数值右侧的内联图形）
Sparkline     props: values (number[]), max?, baseline?, tone, ariaLabel?
ThemeProvider props: storageKey (默认 'p0seid0n-theme'), defaultTheme ('system')
              provides: theme (ref), resolvedTheme (computed), setTheme
ThemeSwitcher props: labels?（默认 System / Light / Dark）
```

`theme-provider` 的首屏脚本：一段可直接内联到 `<head>` 的字符串常量，在 hydration 前读取 `localStorage` 并给 `<html>` 加 `.light` 或 `.dark`，避免首屏闪烁。该脚本不依赖任何框架代码。

`sparkline` 是纯展示组件：只接收数值数组，不做格式化，不做交互，不引入图表库。空数组时不渲染路径但保留占位尺寸；单点数据渲染为同等高度的竖条。

### 运行行为

- 两种组件都不得读取全局状态
- 主题切换不触发页面重载，不高频读写 `localStorage`（只在变更时写）
- `theme-switcher` 的菜单元数据需与 `theme-provider` 的存储键保持一致

## 实施任务

- [x] **005-T01：sparkline**
  - 依赖：003
  - 目标路径：`registry/ui/sparkline/`
  - 行动：实现 SVG 路径生成（含 `median * 3` 截断）、槽位布局、基线标记；保证 `aria-hidden` 与可选 `ariaLabel` 的取舍
  - 预期输出：给定数值序列得到与参考站点形状一致的图形
  - 验收引用：005-AC01、005-AC02
  - 计划验证：用一组已知数值对比生成的 `d` 属性；空数组与单点数据表现确定
  - 完成证据：几何计算抽到 `geometry.ts`（`median`、`scaleTop`、`sparklinePath`），可脱离组件单独调用。`Sparkline.vue` 只负责 SVG 外壳与 `aria-hidden`/`role="img"` 取舍。与参考 `PingStrip` 逐项对齐：`BAR = 0.6`、`viewBox="0 0 slots 1"`、`preserveAspectRatio="none"`、`height` 默认 `0.7em` 且可由 prop 覆盖。`em` 相对父级字号：放在 Stat 的 figure 槽里父级是 26px 数值文本，实测得到 18px 高（与参考站点同处 26px 文本上下文时的 `0.7em` 一致）；单独使用时若父级是 16px 正文，则只有 11px，需要自行设置父级字号——该差异已写入 item 的 `docs`。实测 `values = [10,12,9,15,11,30,13,12]` 产出 `M0.2,1V0.667h0.6V1ZM1.2,1V0.6…`，与独立手算实现逐字一致。`slots` 大于样本数时右对齐（`slots=12` 时首柱从 `M4.2` 起），小于样本数时以样本数为准。有 `ariaLabel` 时输出 `role="img"` 与该标签、无 `aria-hidden`；否则 `aria-hidden="true"`。

- [x] **005-T02：stat**
  - 依赖：005-T01
  - 目标路径：`registry/ui/stat/`
  - 行动：实现标签、数值、单位与 `figure` 槽；空值使用 `emptyText` 与 `text-ink-faint`；数值与单位基线对齐
  - 预期输出：与参考站点数字排版一致，且可放入任意容器
  - 验收引用：005-AC03
  - 计划验证：三档断点下检查字号与行高；与 sparkline 组合时基线对齐
  - 完成证据：`Stat.vue` 用 `max-sm:` 与 `lg:` 实现三档，实测 375/900/1280 三个宽度下数值字号为 24/26/28px，单位字号 14/14/16px（与参考的 mobile 24、large 28 一致）。数值取 `font-condensed`（实测 `"Barlow Semi Condensed"`）、字重 500、`line-height: 1`、`letter-spacing: -0.01em`（28px 时计算为 `-0.28px`）、`font-variant-numeric: tabular-nums`、`text-ink`。单位 `font-sans`、`text-ink-muted`、`margin-left: 6px`。空值（null/undefined/空串）渲染 `emptyText`（默认 `—`）并改为 `text-ink-faint`（实测 `rgb(163,169,181)`），同时隐藏单位。`tone="accent-alt"` 走 `text-danger`（实测为派生危险色）。`figure` 槽渲染在数值右侧，与数值、单位同处 `items-baseline` 容器；槽容器继承数值字号（`font-condensed` + 26/24/28px），因此塞入 Sparkline 时其 `0.7em` 正是参考站点的高度。

- [x] **005-T03：theme-provider**
  - 依赖：003
  - 目标路径：`registry/ui/theme-provider/`
  - 行动：实现主题 ref、`resolvedTheme` 计算、`setTheme`、`localStorage` 持久化与 `matchMedia` 监听；导出首屏脚本文本
  - 预期输出：切换主题即时生效且刷新后保持；首屏无闪烁
  - 验收引用：005-AC04
  - 计划验证：三种取值分别刷新页面，观察首屏颜色；系统偏好变化时 `resolvedTheme` 跟随
  - 完成证据：`theme.ts` 提供 `readStoredTheme`、`systemTheme`、`applyThemeToDocument`、`themeScript`；`ThemeProvider.vue` 用 `ref` 持有选择、`watch` 落盘。实测四种状态：初始 `system` 且无存储时 `<html>` 无类、`data-theme` 缺失；选 light/dark 后类、`data-theme`、`localStorage` 三者同步（`light`/`dark`）；选回 system 后两者清空且存储键被移除。系统偏好跟随：`system` 下把模拟的 `prefers-color-scheme` 由 light 改为 dark，`resolvedTheme` 立即由 light 变 dark；已固定 light 时改系统偏好不影响。刷新后选择保持。`localStorage` 只在 `watch` 里写，系统偏好事件不触发写入（否则会把 `system` 固化成具体值）。

- [x] **005-T04：theme-switcher**
  - 依赖：005-T03、004
  - 目标路径：`registry/ui/theme-switcher/`
  - 行动：用 ghost 按钮触发 dropdown-menu；三种取值以 radio item 呈现并回显当前值；按钮内提供图标 slot
  - 预期输出：菜单可选三态，选中项有指示，切换后图标同步
  - 验收引用：005-AC05
  - 计划验证：键盘操作菜单完成切换；刷新后选中项与主题一致
  - 完成证据：`ThemeSwitcher.vue` 用 `DropdownMenu` + ghost `Button` 触发 + `DropdownMenuRadioGroup`/`DropdownMenuRadioItem` 呈现三态，`model` 是 `useTheme()` 注入 ref 的 `computed` 双向代理，因此菜单、`html` 类与存储始终同源。实测：触发按钮 `aria-label="Appearance"`、文本随当前值变化（System→Dark）、圆角 12px、透明底、高 32px；打开后三项均为 `role="menuitemradio"`，`aria-checked` 只有当前项为 true；键盘 ArrowDown 到 Dark 后 Enter，`theme`/`resolvedTheme`/`html` 类/`localStorage` 同时变为 dark，触发按钮文本同步为 Dark；再次打开时选中项回显 Dark；Esc 后焦点回到触发按钮。

- [x] **005-T05：登记 item 并产出 JSON**
  - 依赖：005-T01 至 005-T04
  - 目标路径：`registry/registry.json`
  - 行动：写入四个 item；`theme-switcher` 的 `registryDependencies` 含 `button` 与 `dropdown-menu`
  - 预期输出：产物中出现四个 JSON，依赖声明正确
  - 验收引用：005-AC06
  - 计划验证：安装 `theme-switcher` 时被依赖的两个 item 也被写入
  - 完成证据：清单增至 18 个 item，构建输出 21 个文件。`registryDependencies`：sparkline/stat/theme-provider 为 `["utils", "theme"]`；theme-switcher 为 `["utils", "theme", "theme-provider", "button", "dropdown-menu"]`。比计划多声明了 `theme-provider`——它用 `useTheme()` 读取状态，缺少 provider 会直接抛错，属于必须的运行时依赖。实测安装 theme-switcher 时 button、dropdown-menu、theme-provider、utils、theme 全部被写入（`src/components/ui` 下出现 4 个组件目录）。`dependencies` 四个 item 均为 `clsx` + `tailwind-merge`（sparkline/stat/theme-* 都不需要 reka-ui，theme-switcher 通过其依赖间接获得）。

## 验收标准

- [x] **005-AC01：图形与参考形状一致**
  - 计划验证：同一组数值下生成的路径与参考实现一致；截断阈值生效
  - 所需环境：参考源码可读
  - 验证证据：把参考 `stat-value.tsx` 中 `PingStrip` 的算法（`BAR = 0.6`、`SPIKE = 3`、`M{x},1V{1-min(1,v/top)}h0.6V1Z`）用独立实现手算，与 `sparklinePath` 的输出逐字比对一致。截断实测：`[10,10,10,10,1000]` 的 median 为 10、top 为 30，前四柱 `V0.667`、末柱 `V0`，即尖峰被截到顶而其余不被压平。显式 `max` 优先于推导值（`[5,10]` 配 `max=20` 得 `V0.75`/`V0.5`）。

- [x] **005-AC02：边界数据表现确定**
  - 计划验证：空数组、单点、全零三种输入都有明确且不抛错的表现
  - 所需环境：浏览器
  - 验证证据：headless Chrome 实测三种输入。空数组：`viewBox="0 0 1 1"`、`path[仕d=""]`、无柱，但 SVG 仍占 11px 高、160px 宽（保留占位尺寸）。单点 `[42]`：`viewBox="0 0 1 1"`、一根 `M0.2,1V0h0.6V1Z` 的满高柱。全零 `[0,0,0,0]`：四根 `V1` 即零高度柱，不抛错、不留残影。三种情况下 `aria-hidden` 均为 `true`（未提供 `ariaLabel`）。

- [x] **005-AC03：数值排版与参考一致**
  - 计划验证：字号、字重、字族、字距、`tabular-nums`、单位样式逐项核对
  - 所需环境：浏览器
  - 验证证据：计算样式逐项核对：字号 28/26/24px（1280/900/375），字重 500，字族 `"Barlow Semi Condensed"`（`font-condensed`），`letter-spacing: -0.28px`（28px 下的 -0.01em），`font-variant-numeric: tabular-nums`，`line-height: 28px`（等于 `line-height: 1`）。单位 16/14px、`text-ink-muted`、`margin-left: 6px`，与数值处于 `items-baseline` 容器。空值 `—` 用 `text-ink-faint` 且不渲染单位。

- [x] **005-AC04：主题切换无闪烁**
  - 计划验证：三态各自刷新页面，首屏无错误配色闪现；系统偏好变化时跟随
  - 所需环境：浏览器，可切换系统配色
  - 验证证据：把 `themeScript()` 输出内联进 `<head>`（先于模块脚本），并在 `readystatechange` 的 `interactive`、`complete` 两个时点记录 `<html>` 的类。三种存储状态：无存储时类为空且 `data-theme` 缺失；存 dark 时两个时点都已是 `dark`；存 light 时都已是 `light`，且 `body` 背景为 `rgb(245,246,248)`。`interactive` 早于首次绘制，因此不存在错色闪现。系统偏好联动：`system` 下切换模拟的 `prefers-color-scheme` 时 `resolvedTheme` 跟随（light→dark），固定值时不跟随。

- [x] **005-AC05：切换器状态一致**
  - 计划验证：菜单选中项、`<html>` 类与 `localStorage` 三者同步
  - 所需环境：浏览器
  - 验证证据：以键盘选中 Dark 后同一时刻读取四项：`theme` = `dark`、`resolvedTheme` = `dark`、`<html class>` = `dark`、`localStorage['p0seid0n-theme']` = `dark`，触发按钮文本同步为 Dark。重新打开菜单，三个 `menuitemradio` 的 `aria-checked` 为 `false/false/true`，与存储一致。选回 System 后类与 `data-theme` 清空、存储键被移除。

- [x] **005-AC06：四个 item 单独可安装**
  - 计划验证：逐个在空项目安装并渲染最小示例
  - 所需环境：网络可用
  - 验证证据：在四个独立的空 Vite 项目里逐个 `npx shadcn-vue@2.9.0 add <file>` 后 `pnpm build`，全部成功：sparkline（3 文件）、stat（2）、theme-provider（4）、theme-switcher（2，并自动带入 button、dropdown-menu、theme-provider）。每个项目都落地 `src/styles/p0seid0n.css`（theme）与 `src/lib/utils.ts`（utils）。跨 item 依赖用同源 URL 形式的临时副本驱动（原因见 003 复审记录）。

### 复审记录

**首屏脚本只处理显式选择，`system` 不加类。** 参考站点的脚本在无存储时也会给 `<html>` 加一个具体类，那会让页面从此不再跟随系统偏好。本实现只在存储为 `light`/`dark` 时加类，`system` 时移除两个类并把 `color-scheme: light dark` 交还给浏览器，因此系统偏好变化仍然生效（实测）。同时把选择镜像到 `data-theme` 属性：`system` 时移除该属性而不是设成字符串 `"system"`，否则 CSS 无法区分「未设置」与「显式选择」。首版写成 `root.dataset[accentKey]`，`data-theme` 不带 `data-` 前缀的 key 对不上，已改为 `setAttribute`/`removeAttribute`。

**`localStorage` 只在选择变化时写。** 系统偏好变化不写存储，否则 `system` 会被固化成当时的取值。写入发生在 `watch` 回调里，且用 `hydrated` 标记跳过挂载前的首次同步。

**theme-switcher 需要 theme-provider 作为运行时依赖。** 计划只要求 `registryDependencies` 含 button 与 dropdown-menu；实测它直接 `useTheme()`，缺 provider 会在 `useTheme` 抛出。因此额外声明 `theme-provider`，安装时四个依赖一并落地。

**sparkline 的 `slots` 与样本数关系需要兜底。** 参考实现里 `slots` 恒大于等于样本数（`first = slots - len` 可为负会画出负数坐标）。本实现在 `slots < values.length` 时以样本数作为视口宽度，避免柱体互相覆盖；实测 `values` 8 点配 `slots=4` 仍得到 8 根柱。

**数值与数值推导的截断在样本不足时的行为。** 计划风险表要求样本少于 3 个时退化为按最大值归一。`scaleTop` 已实现该退化；单点与两点实测分别得到满高柱与按 max 归一的两柱。

**sparkline 的 `0.7em` 需要正确的字号上下文。** 首轮截图里柱体只有 11px，因为 `0.7em` 落在 16px 的 body 上下文。参考站点把它放在 26px 的数值文本里，`0.7em` 约 18px。解法的关键不在 sparkline 本身（保留 `0.7em` 与可覆盖的 `height`），而在 Stat：figure 槽容器显式继承数值字号，实测 26px 上下文下 SVG 高 18px、宽 224px、左内边距 12px，与参考的 `paddingLeft: 12` 一致。

**stat 的空值同时隐藏单位。** 参考站点在 `value == null` 时仍渲染单位（它的单位是静态的 `ms`）。本实现在空值时隐藏单位，因为单元信息对 `—` 无意义；`emptyText` 可覆盖为 `n/a` 等。

### 完成与交接要求

- 006 的令牌页与组件页需要 stat、sparkline 与 theme-switcher 作为示例
- 在单独授权的实施期间，任务完成且所需检查通过后必须勾选任务复选框；验收验证通过后必须勾选验收复选框。记录实际命令或步骤、结果和证据位置。
- 在准备完成提交前，必须勾选所有必需任务和验收项。失败、跳过、阻塞或未执行的检查保持未勾选，并阻止阶段完成。
- 更新此文档和总计划的阶段状态，然后检查工作区和暂存区变更；只使用明确路径或已审阅代码块暂存该阶段的实施变更和进度更新。保留无关修改和预先存在的暂存工作；如果无法安全分离则暂停。
- 在开始依赖阶段前，为本阶段创建一次独立完成提交。遵循仓库约定；否则使用 `feat(p0seid0n-vue-ui): complete subplan 005 - data-display`。不要合并已完成子计划，也不要为每个复选框创建提交。
- 验证成功并报告提交哈希。提交失败时阶段关闭仍等待提交；不要声称完全完成。缺少 Git、仓库或身份信息、钩子失败或变更已提交时请求用户指导。不要自动初始化 Git、修改身份、绕过钩子、推送、改写历史或创建空提交。
- 验证结果：已执行。T01 至 T05 与 AC01 至 AC06 全部通过，证据见各任务与验收项的完成证据。验证环境：Node 25.9.0、pnpm 12.8.1、Vue 3.5.45、Vite 8.3.8、Tailwind 4.3.5、reka-ui 2.11.0、shadcn-vue 2.9.0、headless Chrome 156（CDP 驱动）。临时验证目录 `/tmp/v5-*`、`/tmp/r5`、`/tmp/cdp` 未纳入仓库。
- 实施需要单独授权；生成计划时不要执行任务或创建完成提交。

## 风险与缓解措施

| 风险 | 影响 | 缓解或回滚 | 相关任务 |
| --- | --- | --- | --- |
| 首屏脚本与 SPA 水合时机不一致 | 主题闪烁或 hydration 警告 | 已关闭。脚本只改 `<html>` 的类与 `data-theme` 属性，不写任何框架状态，`hydrated` 标记让挂载后的首次同步不回写存储；实测 `interactive` 时类已就位，无闪烁 | 005-T03 |
| `median * 3` 截断在样本极少时失真 | 图形形状与预期不符 | 已关闭。`scaleTop` 在样本少于 3 个时退化为按最大值归一；单点与两点已实测。另补了 `slots < 样本数` 的兜底，避免参考实现可能的负坐标 | 005-T01 |
| theme-switcher 依赖 004 导致本阶段被阻塞 | 阶段无法独立验收 | 已不适用：004 先于本阶段完成，四个 item 一起验收 | 005-T04 |
| `theme-provider` 的 `storageKey` 与 theme-switcher 不一致 | 切换器与页面状态脱节 | 切换器不读存储键，只通过 `useTheme()` 注入的 ref 读写，因此自定义 `storageKey` 仍然一致；`ThemeApi` 暴露 `storageKey` 供需要时读取 | 005-T04 |
| 服务端渲染（Nuxt/SSR）下 `localStorage` 与 `matchMedia` 不可用 | 首帧报错或类不一致 | `readStoredTheme` 与 `themeScript` 都包在 `try/catch` 中，且前者在无 `localStorage` 时返回 `system`；`ThemeProvider` 的 DOM 读写只在 `onMounted` 后发生。本阶段仅在 Vite SPA 下实测，SSR 未验证 | 005-T03 |

## 延期决策

| 问题 | 已接受的影响 | 解决任务 | 阻塞对象 |
| --- | --- | --- | --- |
| 是否需要把 sparkline 扩展为带面积填充与渐变的版本 | 当前仅纯色填充 | 006 示例页确定视觉方向后追加 | 无，非阻塞 |
