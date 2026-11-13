# 003：基础控件

## 元数据

- 阶段 ID：003
- 总计划：[ocean：Vue UI 库（首版）](../README.md)
- 实施状态：未开始
- 依赖：001、002
- 目标引用：G01、G02
- 决策引用：D03、D06、D08、D09、D11

## 目标

交付第一批可被单独安装并直接渲染的基础控件，使视觉母题在最少组件上被固定下来，后续阶段据此保持一致。

## 范围

### 包含

- `button`：variant `primary`/`secondary`/`ghost`/`danger`，size `sm`/`md`/`lg`，含 `loading` 与内嵌进度槽
- `badge`：variant `neutral`/`accent`/`accent-alt`/`outline`
- `separator`：水平与垂直，可选 `decorative`
- `card`：`surface` 与 `raised` 两种外观，带 header/content/footer 组合
- `input` + `label`：聚焦环、错误态、禁用态、与 label 的 `for`/`id` 关联
- `switch`：reka-ui 底座，含滑块与可选的滑块内图标 slot

### 排除

- 任何菜单、弹层、提示（交给 004）
- 数字排版与图表（交给 005）

## 前置条件

- 001 的令牌与 Tailwind 桥接可用
- 002 的构建流水线可追加 item
- 组件默认外观以通用 variant 为准（D06），不得引入 download/upload 命名

## 设计

### 模块边界与目标路径

| 模块或路径 | 现有或拟议 | 职责 | 计划变更 |
| --- | --- | --- | --- |
| `registry/ui/button/` | 拟议 | 按钮与其变体定义 | 新建 |
| `registry/ui/badge/` | 拟议 | 徽标 | 新建 |
| `registry/ui/separator/` | 拟议 | 分隔线 | 新建 |
| `registry/ui/card/` | 拟议 | 卡片容器与分区 | 新建 |
| `registry/ui/input/` | 拟议 | 输入框 | 新建 |
| `registry/ui/label/` | 拟议 | 标签 | 新建 |
| `registry/ui/switch/` | 拟议 | 开关 | 新建 |

每个目录含一个或多个 `.vue` 文件与一个 `index.ts`（导出组件与变体函数）。

### 接口与数据

尺寸与形状取自参考站点实测值（`start-button.tsx`、`menu.stylex.ts`、`stat-value.tsx`）：

| 项 | 值 |
| --- | --- |
| 控件圆角 | 12px（`rounded-control`） |
| 按钮最小高度 | `md` 44px、`sm` 32px、`lg` 52px |
| 按钮横向内边距 | `md` 24px、`sm` 12px、`lg` 32px |
| 焦点环 | 2px 实线 `--color-ink`，`outline-offset` 2 至 3px |
| 过渡 | `background-color, color, border-color, box-shadow`，150ms |

组件公开 API 约定：

```text
Button       props: variant, size, loading, disabled, as / asChild
             slots: default, leading, trailing, progress
Badge        props: variant
Separator    props: orientation, decorative
Card         props: appearance ('raised' 默认 | 'surface')
CardHeader   slots: title, description, action
CardContent / CardFooter
Input        props: modelValue, invalid, disabled, id
Label        props: for, required
Switch       props: modelValue, disabled, size; slots: thumb
```

颜色只使用语义名：`bg-raised`、`bg-surface`、`text-ink`、`text-ink-muted`、`text-ink-faint`、`border-line`、`bg-control`、`ring-line`、`bg-accent`、`text-accent`。

变体色规则（D06 与 D09）：

```text
primary      bg-ink text-surface            hover: color-mix(ink 86%, surface)
secondary    bg-control text-ink            hover: 加深一档
ghost        bg-transparent text-ink        hover: bg-control
danger       bg-accent-alt text-surface     hover: 加深一档
```

`danger` 复用 `--color-accent-alt`（源自 upload 色）作为唯一允许的通用危险色，不新增令牌。

### 运行行为

- 所有组件只依赖 `utils` 与 `theme` 两个 registry item 作为 `registryDependencies`
- `dependencies` 仅声明实际用到的包（`class-variance-authority`、`clsx`、`tailwind-merge`；`switch` 额外声明 `reka-ui`）
- 组件不引入图标包；需要图标的位置只提供 slot
- 禁止在组件内写 `dark:` 变体

## 实施任务

- [ ] **003-T01：button 与 badge**
  - 依赖：002
  - 目标路径：`registry/ui/button/`、`registry/ui/badge/`
  - 行动：用 cva 定义 variant 与 size；按钮含 `loading`（禁用交互并显示 progress 文案位）与 `progress` slot；badge 四变体
  - 预期输出：两个 item 可独立安装并渲染全部变体
  - 验收引用：003-AC01、003-AC02
  - 计划验证：在临时 Vite 项目安装并逐一渲染变体，比对令牌值
  - 完成证据：未完成；检查未执行。

- [ ] **003-T02：separator 与 card**
  - 依赖：003-T01
  - 目标路径：`registry/ui/separator/`、`registry/ui/card/`
  - 行动：separator 支持横竖与 decorative；card 提供 `raised`/`surface` 两种外观与 header/content/footer
  - 预期输出：卡片在两种外观下的背景、描边与圆角与令牌一致
  - 验收引用：003-AC03
  - 计划验证：渲染两种外观并检查是否出现未定义色值
  - 完成证据：未完成；检查未执行。

- [ ] **003-T03：input 与 label**
  - 依赖：003-T01
  - 目标路径：`registry/ui/input/`、`registry/ui/label/`
  - 行动：输入框含聚焦环与 `invalid` 态（用 `aria-invalid` 驱动样式）；label 支持 `required` 标记与 `for` 关联
  - 预期输出：键盘 Tab 到输入框时可见焦点环；错误态与禁用态外观确定
  - 验收引用：003-AC04
  - 计划验证：手动 Tab 遍历、切换 `invalid`、验证 `htmlFor` 与 `id` 关联
  - 完成证据：未完成；检查未执行。

- [ ] **003-T04：switch**
  - 依赖：003-T01
  - 目标路径：`registry/ui/switch/`
  - 行动：基于 reka-ui 包装；滑块位移与尺寸按参考站点（24/44 为 md，32/64 为 lg）；支持 `prefers-reduced-motion` 下取消过渡
  - 预期输出：键盘空格可切换，状态与视觉同步
  - 验收引用：003-AC05
  - 计划验证：键盘操作与读屏可读性检查；减少动效偏好下无过渡
  - 完成证据：未完成；检查未执行。

- [ ] **003-T05：登记 item 并产出 JSON**
  - 依赖：003-T01 至 003-T04
  - 目标路径：`registry/registry.json`
  - 行动：为七个 item 写入 `name`/`type`/`dependencies`/`registryDependencies`/`files`/`docs`，然后构建
  - 预期输出：`r/` 下出现对应 JSON，且依赖声明正确
  - 验收引用：003-AC06
  - 计划验证：`pnpm build:registry` 成功，检查每个 item 的 `registryDependencies` 均包含 `utils` 与 `theme`
  - 完成证据：未完成；检查未执行。

## 验收标准

- [ ] **003-AC01：按钮全部变体与尺寸可渲染**
  - 计划验证：在临时项目渲染 4 变体 x 3 尺寸，外观与令牌对照表一致
  - 所需环境：002 完成、网络可用
  - 验证证据：未执行。

- [ ] **003-AC02：按钮交互态正确**
  - 计划验证：hover、focus-visible、disabled、loading 四态可见且互不冲突
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **003-AC03：卡片两外观与令牌一致**
  - 计划验证：`raised` 使用 `--color-raised`，`surface` 使用 `--color-surface`；圆角为 16px
  - 所需环境：无
  - 验证证据：未执行。

- [ ] **003-AC04：输入框可访问**
  - 计划验证：`label[for]` 与 `input#id` 关联生效；`aria-invalid` 时描边使用危险色；Tab 焦点环可见
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **003-AC05：开关可用键盘操作**
  - 计划验证：空格切换、状态属性同步、减少动效下无过渡
  - 所需环境：浏览器
  - 验证证据：未执行。

- [ ] **003-AC06：七个 item 单独可安装**
  - 计划验证：逐个 item 在空项目中安装并渲染，无缺失依赖
  - 所需环境：网络可用
  - 验证证据：未执行。

- [ ] **003-AC07：无硬编码色值与 `dark:` 变体**
  - 计划验证：检索这七个组件目录，十六进制色值与 `dark:` 均无命中
  - 所需环境：无
  - 验证证据：未执行。

### 完成与交接要求

- 004 复用 button、card 与 utils；005 复用 card 与 button
- 在单独授权的实施期间，任务完成且所需检查通过后必须勾选任务复选框；验收验证通过后必须勾选验收复选框。记录实际命令或步骤、结果和证据位置。
- 在准备完成提交前，必须勾选所有必需任务和验收项。失败、跳过、阻塞或未执行的检查保持未勾选，并阻止阶段完成。
- 更新此文档和总计划的阶段状态，然后检查工作区和暂存区变更；只使用明确路径或已审阅代码块暂存该阶段的实施变更和进度更新。保留无关修改和预先存在的暂存工作；如果无法安全分离则暂停。
- 在开始依赖阶段前，为本阶段创建一次独立完成提交。遵循仓库约定；否则使用 `feat(ocean-vue-ui): complete subplan 003 - core-controls`。不要合并已完成子计划，也不要为每个复选框创建提交。
- 验证成功并报告提交哈希。提交失败时阶段关闭仍等待提交；不要声称完全完成。缺少 Git、仓库或身份信息、钩子失败或变更已提交时请求用户指导。不要自动初始化 Git、修改身份、绕过钩子、推送、改写历史或创建空提交。
- 验证结果：未执行；本文档只描述计划工作。
- 实施需要单独授权；生成计划时不要执行任务或创建完成提交。

## 风险与缓解措施

| 风险 | 影响 | 缓解或回滚 | 相关任务 |
| --- | --- | --- | --- |
| 把危险色绑定到 `--color-accent-alt`（源自 upload 色）后语义偏弱 | 危险操作提示不够醒目 | 003-AC01 时实测对比度；不足则在 001 追加独立 `--color-danger` | 003-T01 |
| `as`/`asChild` 在 Vue 中的实现方式与 React 差异大 | 按钮无法渲染为链接 | 只实现 `as` 接受组件类型；不实现 `asChild`，改用 slot 透传 | 003-T01 |
| 尺寸令牌来自参考站点的移动端值 | 桌面端偏小 | 在 003-AC01 中同时在 640 与 1024 两侧检查 | 003-T01 |

## 延期决策

| 问题 | 已接受的影响 | 解决任务 | 阻塞对象 |
| --- | --- | --- | --- |
| 是否需要 `xl` 尺寸与圆形按钮 | 使用者需自行组合 | 003-T01 后按实际示例需要追加 | 无，非阻塞 |
