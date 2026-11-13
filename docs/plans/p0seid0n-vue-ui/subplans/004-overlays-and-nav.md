# 004：覆盖层与导航

## 元数据

- 阶段 ID：004
- 总计划：[p0seid0n：Vue UI 库（首版）](../README.md)
- 实施状态：未开始
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

- [ ] **004-T01：dropdown-menu**
  - 依赖：003
  - 目标路径：`registry/ui/dropdown-menu/`
  - 行动：包装 reka-ui 的菜单原语；统一浮动层视觉；实现 radio 与 checkbox item 的选中指示
  - 预期输出：可用键盘完整操作，包括跨条目移动与选中
  - 验收引用：004-AC01、004-AC02
  - 计划验证：键盘操作、外部点击、Esc、选中态回显
  - 完成证据：未完成；检查未执行。

- [ ] **004-T02：tooltip**
  - 依赖：003
  - 目标路径：`registry/ui/tooltip/`
  - 行动：包装 reka-ui；实现延迟显示与四向定位；设置合适的 `role` 与 `aria-describedby` 关联
  - 预期输出：鼠标悬停与键盘聚焦均可显示，Esc 可关闭
  - 验收引用：004-AC03
  - 计划验证：悬停与聚焦行为一致；不与 dropdown-menu 同时触发
  - 完成证据：未完成；检查未执行。

- [ ] **004-T03：dialog**
  - 依赖：003
  - 目标路径：`registry/ui/dialog/`
  - 行动：居中弹层与遮罩；标题与描述提供正确的可访问名称；关闭按钮使用 003 的 ghost 按钮样式
  - 预期输出：打开后焦点进入弹层，关闭后焦点回到触发元素
  - 验收引用：004-AC04
  - 计划验证：Tab 循环限于弹层内；背景滚动被锁定
  - 完成证据：未完成；检查未执行。

- [ ] **004-T04：tabs**
  - 依赖：003
  - 目标路径：`registry/ui/tabs/`
  - 行动：实现触发条与面板；触发条样式对齐控件圆角与 hover 背景
  - 预期输出：方向键在触发条内切换且面板同步
  - 验收引用：004-AC05
  - 计划验证：左右方向键、Home/End 行为
  - 完成证据：未完成；检查未执行。

- [ ] **004-T05：toast**
  - 依赖：003
  - 目标路径：`registry/ui/toast/`
  - 行动：实现 provider、状态容器、`useToast`；支持三种 variant 与 action slot；限制最大堆叠数
  - 预期输出：调用 `toast()` 后出现通知，超时自动消失，可手动关闭
  - 验收引用：004-AC06
  - 计划验证：连发五条时最多显示三条；danger 变体使用危险色
  - 完成证据：未完成；检查未执行。

- [ ] **004-T06：登记 item 并产出 JSON**
  - 依赖：004-T01 至 004-T05
  - 目标路径：`registry/registry.json`
  - 行动：为五个 item 写入元数据并构建
  - 预期输出：产物中出现五个新 JSON，依赖声明完整
  - 验收引用：004-AC07
  - 计划验证：检查每个 item 的 `dependencies` 与 `registryDependencies`
  - 完成证据：未完成；检查未执行。

## 验收标准

- [ ] **004-AC01：菜单键盘可达**
  - 计划验证：方向键移动、Enter 选中、Esc 关闭、焦点回到触发元素
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **004-AC02：菜单视觉与参考一致**
  - 计划验证：最小宽度 160、内边距 6、圆角 16、`shadow-popup` 生效
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **004-AC03：提示可被读屏关联**
  - 计划验证：触发元素存在 `aria-describedby` 指向提示内容，或等价的可访问关联
  - 所需环境：浏览器与可访问性检查工具
  - 验证证据：未执行。

- [ ] **004-AC04：弹层焦点管理正确**
  - 计划验证：打开时焦点进入、Tab 不逃逸、关闭后焦点回收、打开时背景不可滚动
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **004-AC05：标签页键盘行为正确**
  - 计划验证：左右方向键、Home/End 切换且面板同步
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **004-AC06：通知按上限堆叠并可消失**
  - 计划验证：超过上限时最早的通知被移除；超时消失；手动关闭生效
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **004-AC07：五个 item 单独可安装**
  - 计划验证：逐个在空项目安装并渲染最小示例
  - 所需环境：网络可用
  - 验证证据：未执行。

### 完成与交接要求

- 006 的组件页依赖本阶段的全部示例；005 不依赖本阶段
- 在单独授权的实施期间，任务完成且所需检查通过后必须勾选任务复选框；验收验证通过后必须勾选验收复选框。记录实际命令或步骤、结果和证据位置。
- 在准备完成提交前，必须勾选所有必需任务和验收项。失败、跳过、阻塞或未执行的检查保持未勾选，并阻止阶段完成。
- 更新此文档和总计划的阶段状态，然后检查工作区和暂存区变更；只使用明确路径或已审阅代码块暂存该阶段的实施变更和进度更新。保留无关修改和预先存在的暂存工作；如果无法安全分离则暂停。
- 在开始依赖阶段前，为本阶段创建一次独立完成提交。遵循仓库约定；否则使用 `feat(p0seid0n-vue-ui): complete subplan 004 - overlays-and-nav`。不要合并已完成子计划，也不要为每个复选框创建提交。
- 验证成功并报告提交哈希。提交失败时阶段关闭仍等待提交；不要声称完全完成。缺少 Git、仓库或身份信息、钩子失败或变更已提交时请求用户指导。不要自动初始化 Git、修改身份、绕过钩子、推送、改写历史或创建空提交。
- 验证结果：未执行；本文档只描述计划工作。
- 实施需要单独授权；生成计划时不要执行任务或创建完成提交。

## 风险与缓解措施

| 风险 | 影响 | 缓解或回滚 | 相关任务 |
| --- | --- | --- | --- |
| 自实现 toast 与第三方浮层同时存在时的层级冲突 | 通知被遮挡 | 固定通知层级高于 dialog；写入组件文档 | 004-T05 |
| reka-ui 的 Vue API 与预期差异导致包装层过厚 | 维护成本上升 | 包装层只做样式与默认值，不重构原语行为 | 004-T01 至 004-T04 |
| tooltip 与 dropdown-menu 的触发互相干扰 | 误触发 | 验收时专门覆盖组合场景 | 004-T03 |

## 延期决策

| 问题 | 已接受的影响 | 解决任务 | 阻塞对象 |
| --- | --- | --- | --- |
| 是否需要 sheet 与 command 组件 | 使用者需自行组合 dialog 实现 | 006 完成后按实际需要另开阶段 | 无，非阻塞 |
