# 004：覆盖层与导航

## 元数据

- 阶段 ID：004
- 总计划：[p0seid0n：Vue UI 库（首版）](../README.md)
- 实施状态：已完成
- 依赖：003
- 目标引用：G01、G02
- 决策引用：D03、D06、D08

## 目标

交付需要焦点管理与浮层定位的组件，并统一浮动层的视觉：内描边、16px 圆角、`shadow-popup`。

## 范围

### 包含

- `dropdown-menu`：含 item、checkbox item、radio item、label、separator 与分组
- `tooltip`：延迟显示、四向定位、可选快捷键提示
- `dialog`：居中弹层、标题与描述、关闭按钮、遮罩
- `tabs`：横向触发条 + 内容面板，支持键盘左右方向键
- `toast`：自实现轻量版，含 provider、`useToast` 组合式、堆叠与自动消失

### 排除

- 抽屉式侧栏（sheet）
- 命令面板（command）
- 右键菜单与嵌套子菜单

## 前置条件

- 003 的 button 与 card 可用
- 确认 reka-ui 版本在 workspace 中一致

## 设计

### 模块边界与目标路径

| 模块或路径 | 现有或拟议 | 职责 | 计划变更 |
| --- | --- | --- | --- |
| `registry/ui/dropdown-menu/` | 拟议 | 菜单根、触发、内容、各类 item | 新建 |
| `registry/ui/tooltip/` | 拟议 | 提示 | 新建 |
| `registry/ui/dialog/` | 拟议 | 弹层 | 新建 |
| `registry/ui/tabs/` | 拟议 | 标签页 | 新建 |
| `registry/ui/toast/` | 拟议 | 通知与组合式 | 新建 |

### 接口与数据

浮动层视觉取自参考站点 `menu.stylex.ts`：

| 属性 | 值 |
| --- | --- |
| 最小宽度 | 160px |
| 内边距 | 6px |
| 圆角 | 16px（`rounded-panel`） |
| 背景 | `bg-raised` |
| 边界 | `border-line` 1px |
| 阴影 | `shadow-popup` |
| item 圆角 | 10px，hover 背景 `bg-control` |
| z-index | 10（`z-10` 为基准，dialog 用更高层） |

组合式与其他 API 约定：

```text
DropdownMenu        根，props: open, disabled
DropdownMenuTrigger as 透传
DropdownMenuContent props: align ('start'|'center'|'end'), sideOffset (默认 8), minWidth
DropdownMenuItem / CheckboxItem / RadioItem / Label / Separator / Group
                     RadioItem 需在 DropdownMenuRadioGroup 内

Tooltip              props: delay (默认 300), side, align
TooltipTrigger / TooltipContent

Dialog               props: open, closeOnOutside, closeOnEsc
DialogTrigger / DialogContent / DialogTitle / DialogDescription / DialogClose

Tabs                 props: modelValue, orientation
TabsList / TabsTrigger / TabsContent

ToastProvider        props: duration (默认 4000), max (默认 3)
useToast()           -> { toast(options), dismiss(id) }
toast options        { title, description?, variant?: 'default'|'success'|'danger', duration?, action? }
```

`toast` 为自实现：一个顶层 provider 渲染固定定位的堆叠容器，状态用 `shallowRef` 数组；不使用 teleport 到 portal 之外的第三方容器。`variant: 'danger'` 使用 `--color-accent-alt`，与 003 的危险色保持一致。

### 运行行为

- 全部浮层需支持 Esc 关闭、外部点击关闭、焦点回收
- dialog 打开时锁定背景滚动并设置 `aria-modal`
- toast 容器在 `prefers-reduced-motion` 下取消入场动画
- 每个组件只声明 `registryDependencies: ["utils", "theme"]`；dropdown-menu 与 tooltip 的 `dependencies` 含 `reka-ui`

## 实施任务

- [x] **004-T01：dropdown-menu**
  - 依赖：003
  - 目标路径：`registry/ui/dropdown-menu/`
  - 行动：包装 reka-ui 的菜单原语；统一浮动层视觉；实现 radio 与 checkbox item 的选中指示
  - 预期输出：可用键盘完整操作，包括跨条目移动与选中
  - 验收引用：004-AC01、004-AC02
  - 计划验证：键盘操作、外部点击、Esc、选中态回显
  - 完成证据：`registry/ui/dropdown-menu/` 共 12 个文件：根、触发、内容、五种 item 与分组、`styles.ts`、`index.ts`。内容经 `DropdownMenuPortal` 渲染，视觉取自参考 `menu.stylex.ts`。headless Chrome 实测：宽 160px（`minWidth` 默认值，可按 item 覆盖）、`padding: 6px`、`border-radius: 16px`、`bg-raised`、`border-line` 1px、`shadow-popup`（计算值含 `0 12px 32px -8px`）、`z-index: 10`；item 高 36px、内边距 `0 12px`、圆角 10px、hover 与 `data-highlighted` 都是 `bg-control`。键盘：ArrowDown 打开并把焦点放到首项，方向键跨项移动时跳过禁用项（Archive 带 `data-disabled`），Enter 选中并关闭，Esc 关闭且焦点回到 `menu-trigger`，外部点击同样关闭；选中态回显由 `DropdownMenuItemIndicator` 承载，checkbox 与 radio 分别输出 `role="menuitemcheckbox"` 与 `role="menuitemradio"` 与 `aria-checked`，点击后 `v-model` 从 true 变 false 再变回 true。

- [x] **004-T02：tooltip**
  - 依赖：003
  - 目标路径：`registry/ui/tooltip/`
  - 行动：包装 reka-ui；实现延迟显示与四向定位；设置合适的 `role` 与 `aria-describedby` 关联
  - 预期输出：鼠标悬停与键盘聚焦均可显示，Esc 可关闭
  - 验收引用：004-AC03
  - 计划验证：悬停与聚焦行为一致；不与 dropdown-menu 同时触发
  - 完成证据：`Tooltip.vue` 把 `delay` 映射到 `TooltipProvider.delayDuration`（默认 300ms），`TooltipContent` 提供 `side`/`align`/`sideOffset`/`shortcut`。实测悬停 50ms 延迟的实例在 500ms 内出现；键盘聚焦同样出现；Esc 关闭且触发元素保持焦点。可访问关联：触发元素的 `aria-describedby` 指向 reka 生成的视觉隐藏节点（`role="tooltip"`、`clip-path: inset(50%)`、1x1），其文本与提示一致。与菜单组合实测：提示打开时点击菜单触发，提示自动关闭、菜单在上层，两者不互相触发。

- [x] **004-T03：dialog**
  - 依赖：003
  - 目标路径：`registry/ui/dialog/`
  - 行动：居中弹层与遮罩；标题与描述提供正确的可访问名称；关闭按钮使用 003 的 ghost 按钮样式
  - 预期输出：打开后焦点进入弹层，关闭后焦点回到触发元素
  - 验收引用：004-AC04
  - 计划验证：Tab 循环限于弹层内；背景滚动被锁定
  - 完成证据：`DialogContent` 输出 `role="dialog"`、`aria-modal="true"`、`aria-labelledby` 指向 `DialogTitle`、`aria-describedby` 指向 `DialogDescription`（实测取值分别为 `Delete project` 与 `This cannot be undone.`）。打开后焦点落在面板内首个可聚焦元素；连续 6 次 Tab 在关闭按钮与面板内按钮之间循环，未逃逸；Esc 关闭后焦点回到触发元素。背景滚动：`body` 被加上 `overflow: hidden` 与 `pointer-events: none`，滚轮事件在面板与遮罩上均不改变 `scrollY`；关闭后内联样式被清空。遮罩 `z-40`、面板 `z-50`，面板 16px 圆角与 `shadow-popup`。关闭按钮复用 ghost 形态：32x32、10px 圆角、`text-ink-muted`、hover 变 `bg-control`。`closeOnEsc` 与 `closeOnOutside` 置 false 时实测两者都不再关闭，仅关闭按钮生效。

- [x] **004-T04：tabs**
  - 依赖：003
  - 目标路径：`registry/ui/tabs/`
  - 行动：实现触发条与面板；触发条样式对齐控件圆角与 hover 背景
  - 预期输出：方向键在触发条内切换且面板同步
  - 验收引用：004-AC05
  - 计划验证：左右方向键、Home/End 行为
  - 完成证据：`TabsList` 为 12px 圆角的 `bg-control` 轨道、内衬 4px；触发器高 32px、10px 圆角，选中项 `bg-raised` 配 `text-ink` 与轻阴影。键盘实测：Tab 从页面进入标签条并停在当前选中项；ArrowRight 依次切到 Settings 与 Billing，`v-model` 与可见面板同步（其余面板带 `hidden`）；End 跳到末个可用项、Home 回到首项、ArrowLeft 从首项回绕到末个；禁用的第四项被跳过。`activationMode` 默认 automatic，改 manual 后需 Enter 或 Space 才切换。

- [x] **004-T05：toast**
  - 依赖：003
  - 目标路径：`registry/ui/toast/`
  - 行动：实现 provider、状态容器、`useToast`；支持三种 variant 与 action slot；限制最大堆叠数
  - 预期输出：调用 `toast()` 后出现通知，超时自动消失，可手动关闭
  - 验收引用：004-AC06
  - 计划验证：连发五条时最多显示三条；danger 变体使用危险色
  - 完成证据：自实现，不依赖 reka-ui 的 toast。`stack.ts` 用 `shallowRef` 持有列表并按 id 去重，超出 `max` 时从头部裁剪；`ToastProvider` 通过 `provide` 暴露 `{ toast, dismiss, dismissAll }`，`useToast()` 在缺少 provider 时抛错而非静默丢弃；`Toast.vue` 每个实例自带计时器并在卸载时清理。headless Chrome 实测：一次触发三种变体得到 3 条，左侧色条分别为 `rgb(221,225,231)`、`rgb(47,111,228)`、`oklab(0.55136 ...)`（即 `bg-line`、`bg-accent`、`bg-danger`）；连发 5 条后总数仍为 3 且保留最新三条（Notification 6/7/8），被裁掉的是最早的；手动关闭使 3 变 2，`dismissAll` 归零；默认 4000ms 后自动消失（4.6s 时计数为 0）；容器 `position: fixed`、`right/bottom: 16px`、`z-index: 60`，对话框打开时通知仍绘制在上层（`elementFromPoint` 命中通知卡）；入场动画 `p0seid0n-toast-in 150ms`，`prefers-reduced-motion: reduce` 下 `animation-name` 为 `none`。

- [x] **004-T06：登记 item 并产出 JSON**
  - 依赖：004-T01 至 004-T05
  - 目标路径：`registry/registry.json`
  - 行动：为五个 item 写入元数据并构建
  - 预期输出：产物中出现五个新 JSON，依赖声明完整
  - 验收引用：004-AC07
  - 计划验证：检查每个 item 的 `dependencies` 与 `registryDependencies`
  - 完成证据：清单增至 14 个 item，`pnpm build:registry` 一次输出 17 个文件。五个新 item 的 `registryDependencies` 均为 `["utils", "theme"]`；`dependencies` 按实际导入声明：dropdown-menu、tooltip、dialog、tabs 为 `clsx`、`tailwind-merge`、`reka-ui`，toast 只用 `clsx`、`tailwind-merge`（自实现，未引入 reka-ui）。`files` 分别 12、4、9、6、7 项，均含各分件与 `index.ts`。

## 验收标准

- [x] **004-AC01：菜单键盘可达**
  - 计划验证：方向键移动、Enter 选中、Esc 关闭、焦点回到触发元素
  - 所需环境：浏览器
  - 验证证据：headless Chrome 156 实测。触发元素聚焦后 ArrowDown 打开菜单并高亮首项 Rename；再两次 ArrowDown 越过禁用的 Archive 落到 Show hidden（禁项带 `data-disabled` 被跳过）；Enter 选中并关闭，`@select` 回调写入 `lastAction`；Esc 关闭后 `document.activeElement` 回到 `menu-trigger`，`v-model:open` 同步为 false；外部点击同样关闭。checkbox 与 radio 项分别以 `role="menuitemcheckbox"` 与 `role="menuitemradio"` 与 `aria-checked` 暴露状态，点击后 true→false→true 与 compact 切换均回显。

- [x] **004-AC02：菜单视觉与参考一致**
  - 计划验证：最小宽度 160、内边距 6、圆角 16、`shadow-popup` 生效
  - 所需环境：浏览器
  - 验证证据：计算样式逐一核对：`width: 160px`（`min-width: 160px`）、`padding: 6px`、`border-radius: 16px`、`background-color: rgb(255,255,255)`（`bg-raised`）、`border: 1px rgb(221,225,231)`（`border-line`）、`z-index: 10`；`box-shadow` 计算值包含 `rgba(26,36,34,0.18) 0px 12px 32px -8px`，即 `shadow-popup`。item 实测高 36px、`padding: 0 12px`、圆角 10px。深色模式下背景与描边分别变为 `rgb(26,29,36)` 与 `rgb(42,46,55)`。

- [x] **004-AC03：提示可被读屏关联**
  - 计划验证：触发元素存在 `aria-describedby` 指向提示内容，或等价的可访问关联
  - 所需环境：浏览器与可访问性检查工具
  - 验证证据：提示打开时触发元素带上 `aria-describedby`，其值等于 reka 生成的提示节点 id（实测 `reka-tooltip-content-v-2`）；`document.getElementById` 能取到该节点，`role="tooltip"`、文本与可见提示一致，并带视觉隐藏样式（`clip-path: inset(50%)`、1x1），因此读屏可读而视觉不重复。提示关闭后该属性被移除。悬停与键盘聚焦两条路径均如此。

- [x] **004-AC04：弹层焦点管理正确**
  - 计划验证：打开时焦点进入、Tab 不逃逸、关闭后焦点回收、打开时背景不可滚动
  - 所需环境：浏览器
  - 验证证据：打开后焦点落在面板内（实测为 `dialog-confirm`，面板首元素）；连续 6 次 Tab 只在 Close 与面板内按钮间循环，`inPanel` 始终为 true；Esc 后焦点回到 `dialog-trigger`。`role="dialog"` 与 `aria-modal="true"` 均在面板上，`aria-labelledby`/`aria-describedby` 分别解析出标题与描述文本。滚动：`body` 获得 `overflow: hidden` 与 `pointer-events: none`，在面板与遮罩上派发滚轮后 `scrollY` 保持 0；关闭后内联样式清空且 `scrollY` 为 0。`closeOnEsc` 与 `closeOnOutside` 为 false 时两者均不再关闭，关闭按钮仍有效。

- [x] **004-AC05：标签页键盘行为正确**
  - 计划验证：左右方向键、Home/End 切换且面板同步
  - 所需环境：浏览器
  - 验证证据：Tab 从页面进入标签条并停在当前选中项；ArrowRight 依次切到 Settings、Billing，`v-model` 与 `#tab-value` 同步，可见面板同步（其余带 `hidden`）；End 到末个、Home 回首项、ArrowLeft 从首项回绕到末个；禁用的第四项被跳过。`role="tablist"` 带 `aria-orientation="horizontal"`，触发器为 `role="tab"` 且 `aria-selected`/`data-state` 与选中状态一致。

- [x] **004-AC06：通知按上限堆叠并可消失**
  - 计划验证：超过上限时最早的通知被移除；超时消失；手动关闭生效
  - 所需环境：浏览器
  - 验证证据：连发 5 条后仍为 3 条且保留最新三条（Notification 6/7/8），最早两条被移除；默认 4000ms 后自动消失（4.6s 计数 0）；点关闭按钮 3→2，`dismissAll` 归零。三种变体的左侧色条分别为 `bg-line`、`bg-accent`、`bg-danger` 的实测计算色。容器 `position: fixed`、`right/bottom: 16px`、`z-index: 60`，在 dialog（`z-50`）与遮罩（`z-40`）之上且 `elementFromPoint` 命中通知卡。`prefers-reduced-motion: reduce` 下入场动画为 `none`。

- [x] **004-AC07：五个 item 单独可安装**
  - 计划验证：逐个在空项目安装并渲染最小示例
  - 所需环境：网络可用
  - 验证证据：为每个 item 准备把 `registryDependencies` 改写为同源 URL 的临时副本（原因见 003 复审记录），在五个独立的空 Vite 项目中逐个 `npx shadcn-vue@2.9.0 add <file>` 并 `pnpm build`，全部成功：dropdown-menu（12 文件）、tooltip（4）、dialog（9）、tabs（6）、toast（7），每个项目都同时落地 `src/styles/p0seid0n.css`（theme）与 `src/lib/utils.ts`（utils）。toast 的最小示例把 `useToast()` 放在 provider 的子组件里（见复审记录）。

### 复审记录

**dialog 的 `aria-modal` 需要自己写。** reka 的 `DialogContent` 只输出 `role="dialog"`、`aria-labelledby`、`aria-describedby`，并不设置 `aria-modal`（它用 `useHideOthers` + 焦点陷阱实现同等效果）。计划明确要求 `aria-modal`，因此在 `DialogContent.vue` 上显式写 `aria-modal="true"`，实测属性存在。

**`closeOnEsc` / `closeOnOutside` 的传递一开始是错的。** 首版把 `provideDialogBehaviour(props)` 的 props 直接包进 `toRef(() => props.closeOnEsc)`，实测运行时读到的永远是 `true`。改用 `computed(source.closeOnEsc)` 且 source 是读取 props 的闭包后正常。排查过程中另发现两处自身错误：一是测试用例把 `:close-on-esc` 写到了 `DialogContent` 而不是 `Dialog` 上；二是 reka 的 `DialogContentImpl` 用 `mergeProps` 把 `$attrs` 合并到 `DismissableLayer` 之后，父组件传入的 `onEscapeKeyDown` 会**覆盖** reka 自己的处理器，使它不再 emit `escapeKeyDown`。最终保留 `@escape-key-down` 监听（未在 attributes 里重复声明），配合 `event.preventDefault()` 阻止 dismiss。

**tabs 的 `tabindex` 全为 -1 不是缺陷。** 首轮看到四个触发器都是 `tabindex="-1"` 曾怀疑 roving focus 失效；用 reka 原生 `TabsRoot/TabsList/TabsTrigger` 做对照实验得到完全相同的结果，再实测 Tab 键能从页面其它控件进入标签条并停在当前选中项，确认这是 reka 2.11 的实现方式（由 `RovingFocusGroup` 的 `entryFocus` 接管，条目本身不参与 Tab 序列）。AC05 因此以实际键盘行为取证，而不是以属性值取证。

**`useToast()` 只能在其 provider 的后代里调用。** 首个消费者示例把 `useToast()` 写在渲染 `<ToastProvider>` 的同一个 `setup` 里，运行时报 `useToast() must be called inside a ToastProvider.`，页面白屏。这是 Vue `provide` 的作用域规则（只对后代可见），不是组件缺陷；示例改为把调用放进 provider 的子组件。`useToast` 在缺少 provider 时抛错是刻意设计，避免通知被静默丢弃。

**toast 的入场动画依赖 theme 提供的关键帧。** `motion-safe:animate-[p0seid0n-toast-in_150ms_ease-out]` 只生成 `animation` 简写，关键帧必须另有定义。`@keyframes p0seid0n-toast-in` 已写入 `registry/styles/p0seid0n.css`（theme item），因此只装 toast 而不装 theme 时会退化为无动画而非报错。这使 theme item 承担了一份与组件相关的样式，属于对 002 契约的扩展，已记入下方风险表。

**菜单选中指示的位置。** 首版把 `DropdownMenuItemIndicator` 放在文案之后并配 `justify-between`，截图中圆点跑到右端。改为放在文案之前并给 12px 固定宽度，未选中项由 `Presence` 渲染为空注释节点，因此选中与未选中项的文字左对齐。

**toast 叠放层级。** 计划风险表要求通知不被 dialog 遮挡。实测通知容器 `z-index: 60`、dialog `z-50`、遮罩 `z-40`，dialog 打开时 `elementFromPoint` 命中的是通知卡，已满足；该层级约定同时写入 item 的 `docs` 字段供使用者参考。

### 完成与交接要求

- 006 的组件页依赖本阶段的全部示例；005 不依赖本阶段
- 在单独授权的实施期间，任务完成且所需检查通过后必须勾选任务复选框；验收验证通过后必须勾选验收复选框。记录实际命令或步骤、结果和证据位置。
- 在准备完成提交前，必须勾选所有必需任务和验收项。失败、跳过、阻塞或未执行的检查保持未勾选，并阻止阶段完成。
- 更新此文档和总计划的阶段状态，然后检查工作区和暂存区变更；只使用明确路径或已审阅代码块暂存该阶段的实施变更和进度更新。保留无关修改和预先存在的暂存工作；如果无法安全分离则暂停。
- 在开始依赖阶段前，为本阶段创建一次独立完成提交。遵循仓库约定；否则使用 `feat(p0seid0n-vue-ui): complete subplan 004 - overlays-and-nav`。不要合并已完成子计划，也不要为每个复选框创建提交。
- 验证成功并报告提交哈希。提交失败时阶段关闭仍等待提交；不要声称完全完成。缺少 Git、仓库或身份信息、钩子失败或变更已提交时请求用户指导。不要自动初始化 Git、修改身份、绕过钩子、推送、改写历史或创建空提交。
- 验证结果：已执行。T01 至 T06 与 AC01 至 AC07 全部通过，证据见各任务与验收项的完成证据。验证环境：Node 25.9.0、pnpm 12.8.1、Vue 3.5.45、Vite 8.3.8、Tailwind 4.3.5、reka-ui 2.11.0、shadcn-vue 2.9.0、headless Chrome 156（CDP 驱动）。临时验证目录 `/tmp/ui4`、`/tmp/v5-*`、`/tmp/cdp` 未纳入仓库。
- 实施需要单独授权；生成计划时不要执行任务或创建完成提交。

## 风险与缓解措施

| 风险 | 影响 | 缓解或回滚 | 相关任务 |
| --- | --- | --- | --- |
| 自实现 toast 与第三方浮层同时存在时的层级冲突 | 通知被遮挡 | 已关闭。通知容器 `z-60`、dialog `z-50`、遮罩 `z-40`，实测 dialog 打开时通知仍可命中并绘制在上层；层级约定写入 toast item 的 `docs` | 004-T05 |
| reka-ui 的 Vue API 与预期差异导致包装层过厚 | 维护成本上升 | 已控制：包装层只做样式、默认值与事件转发，未重构原语行为。dialog 因 reka 不设 `aria-modal` 而显式补一个属性，是唯一超出「样式与默认值」的改动 | 004-T01 至 004-T04 |
| tooltip 与 dropdown-menu 的触发互相干扰 | 误触发 | 已关闭。组合实测：提示打开时点击菜单触发，提示自动关闭且菜单在上层，两者不互触发 | 004-T03 |
| theme item 承担了 toast 的关键帧定义 | 只装 toast 不装 theme 时入场动画缺失 | 关键帧放在 theme 内，只装 toast 时入场动画静默缺失但布局不坏（`motion-reduce` 亦然）。若将来关键帧增多，应改为由 item 的 `css` 字段随组件投递，并在 002 补契约 | 004-T05 |
| 组件层依赖 reka-ui 的内部属性（`data-highlighted`、`data-state`） | reka 大版本升级可能改变属性名 | 样式同时写了 `:hover`、`:focus` 作为后备；升级 reka 时需回归 004-AC01、004-AC05 | 004-T01、004-T04 |

## 延期决策

| 问题 | 已接受的影响 | 解决任务 | 阻塞对象 |
| --- | --- | --- | --- |
| 是否需要 sheet 与 command 组件 | 使用者需自行组合 dialog 实现 | 006 完成后按实际需要另开阶段 | 无，非阻塞 |
| `DropdownMenuSub` 系列（嵌套子菜单） | 当前只有单层菜单 | 计划明确排除；需要时按 reka 原语另开 item，不塞进 dropdown-menu | 无，非阻塞 |
| toast 的进出场是否补退场动画 | 关闭时瞬间移除，无淡出 | 目前只有入场动画；若 006 的示例需要，可在 theme 增加 `p0seid0n-toast-out` 并给 `Toast.vue` 加离场过渡 | 无，非阻塞 |
| 是否复用 reka 的 Toast 原语替换自实现 | 自实现需自行维护计时与堆叠 | 计划要求自实现（避免与浮层层级冲突），已在 004-AC06 取证；若将来 reka 的 toast 支持自定义容器可重新评估 | 无，非阻塞 |
