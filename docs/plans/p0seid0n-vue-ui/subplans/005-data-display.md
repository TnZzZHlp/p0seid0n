# 005：数据展示

## 元数据

- 阶段 ID：005
- 总计划：[p0seid0n：Vue UI 库（首版）](../README.md)
- 实施状态：未开始
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

- [ ] **005-T01：sparkline**
  - 依赖：003
  - 目标路径：`registry/ui/sparkline/`
  - 行动：实现 SVG 路径生成（含 `median * 3` 截断）、槽位布局、基线标记；保证 `aria-hidden` 与可选 `ariaLabel` 的取舍
  - 预期输出：给定数值序列得到与参考站点形状一致的图形
  - 验收引用：005-AC01、005-AC02
  - 计划验证：用一组已知数值对比生成的 `d` 属性；空数组与单点数据表现确定
  - 完成证据：未完成；检查未执行。

- [ ] **005-T02：stat**
  - 依赖：005-T01
  - 目标路径：`registry/ui/stat/`
  - 行动：实现标签、数值、单位与 `figure` 槽；空值使用 `emptyText` 与 `text-ink-faint`；数值与单位基线对齐
  - 预期输出：与参考站点数字排版一致，且可放入任意容器
  - 验收引用：005-AC03
  - 计划验证：三档断点下检查字号与行高；与 sparkline 组合时基线对齐
  - 完成证据：未完成；检查未执行。

- [ ] **005-T03：theme-provider**
  - 依赖：003
  - 目标路径：`registry/ui/theme-provider/`
  - 行动：实现主题 ref、`resolvedTheme` 计算、`setTheme`、`localStorage` 持久化与 `matchMedia` 监听；导出首屏脚本文本
  - 预期输出：切换主题即时生效且刷新后保持；首屏无闪烁
  - 验收引用：005-AC04
  - 计划验证：三种取值分别刷新页面，观察首屏颜色；系统偏好变化时 `resolvedTheme` 跟随
  - 完成证据：未完成；检查未执行。

- [ ] **005-T04：theme-switcher**
  - 依赖：005-T03、004
  - 目标路径：`registry/ui/theme-switcher/`
  - 行动：用 ghost 按钮触发 dropdown-menu；三种取值以 radio item 呈现并回显当前值；按钮内提供图标 slot
  - 预期输出：菜单可选三态，选中项有指示，切换后图标同步
  - 验收引用：005-AC05
  - 计划验证：键盘操作菜单完成切换；刷新后选中项与主题一致
  - 完成证据：未完成；检查未执行。

- [ ] **005-T05：登记 item 并产出 JSON**
  - 依赖：005-T01 至 005-T04
  - 目标路径：`registry/registry.json`
  - 行动：写入四个 item；`theme-switcher` 的 `registryDependencies` 含 `button` 与 `dropdown-menu`
  - 预期输出：产物中出现四个 JSON，依赖声明正确
  - 验收引用：005-AC06
  - 计划验证：安装 `theme-switcher` 时被依赖的两个 item 也被写入
  - 完成证据：未完成；检查未执行。

## 验收标准

- [ ] **005-AC01：图形与参考形状一致**
  - 计划验证：同一组数值下生成的路径与参考实现一致；截断阈值生效
  - 所需环境：参考源码可读
  - 验证证据：未执行。

- [ ] **005-AC02：边界数据表现确定**
  - 计划验证：空数组、单点、全零三种输入都有明确且不抛错的表现
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **005-AC03：数值排版与参考一致**
  - 计划验证：字号、字重、字族、字距、`tabular-nums`、单位样式逐项核对
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **005-AC04：主题切换无闪烁**
  - 计划验证：三态各自刷新页面，首屏无错误配色闪现；系统偏好变化时跟随
  - 所需环境：浏览器，可切换系统配色
  - 验证证据：未执行。

- [ ] **005-AC05：切换器状态一致**
  - 计划验证：菜单选中项、`<html>` 类与 `localStorage` 三者同步
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **005-AC06：四个 item 单独可安装**
  - 计划验证：逐个在空项目安装并渲染最小示例
  - 所需环境：网络可用
  - 验证证据：未执行。

### 完成与交接要求

- 006 的令牌页与组件页需要 stat、sparkline 与 theme-switcher 作为示例
- 在单独授权的实施期间，任务完成且所需检查通过后必须勾选任务复选框；验收验证通过后必须勾选验收复选框。记录实际命令或步骤、结果和证据位置。
- 在准备完成提交前，必须勾选所有必需任务和验收项。失败、跳过、阻塞或未执行的检查保持未勾选，并阻止阶段完成。
- 更新此文档和总计划的阶段状态，然后检查工作区和暂存区变更；只使用明确路径或已审阅代码块暂存该阶段的实施变更和进度更新。保留无关修改和预先存在的暂存工作；如果无法安全分离则暂停。
- 在开始依赖阶段前，为本阶段创建一次独立完成提交。遵循仓库约定；否则使用 `feat(p0seid0n-vue-ui): complete subplan 005 - data-display`。不要合并已完成子计划，也不要为每个复选框创建提交。
- 验证成功并报告提交哈希。提交失败时阶段关闭仍等待提交；不要声称完全完成。缺少 Git、仓库或身份信息、钩子失败或变更已提交时请求用户指导。不要自动初始化 Git、修改身份、绕过钩子、推送、改写历史或创建空提交。
- 验证结果：未执行；本文档只描述计划工作。
- 实施需要单独授权；生成计划时不要执行任务或创建完成提交。

## 风险与缓解措施

| 风险 | 影响 | 缓解或回滚 | 相关任务 |
| --- | --- | --- | --- |
| 首屏脚本与 SPA 水合时机不一致 | 主题闪烁或 hydration 警告 | 脚本只改 `<html>` 类，不参与框架状态；验收专门覆盖刷新场景 | 005-T03 |
| `median * 3` 截断在样本极少时失真 | 图形形状与预期不符 | 样本少于 3 个时退化为按最大值归一 | 005-T01 |
| theme-switcher 依赖 004 导致本阶段被阻塞 | 阶段无法独立验收 | stat、sparkline、theme-provider 先完成并验收，theme-switcher 在 004 完成后补齐 | 005-T04 |

## 延期决策

| 问题 | 已接受的影响 | 解决任务 | 阻塞对象 |
| --- | --- | --- | --- |
| 是否需要把 sparkline 扩展为带面积填充与渐变的版本 | 当前仅纯色填充 | 006 示例页确定视觉方向后追加 | 无，非阻塞 |
