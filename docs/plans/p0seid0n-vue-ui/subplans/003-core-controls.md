# 003：基础控件

## 元数据

- 阶段 ID：003
- 总计划：[p0seid0n：Vue UI 库（首版）](../README.md)
- 实施状态：已完成
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

- [x] **003-T01：button 与 badge**
  - 依赖：002
  - 目标路径：`registry/ui/button/`、`registry/ui/badge/`
  - 行动：用 cva 定义 variant 与 size；按钮含 `loading`（禁用交互并显示 progress 文案位）与 `progress` slot；badge 四变体
  - 预期输出：两个 item 可独立安装并渲染全部变体
  - 验收引用：003-AC01、003-AC02
  - 计划验证：在临时 Vite 项目安装并逐一渲染变体，比对令牌值
  - 完成证据：`registry/ui/button/` 与 `registry/ui/badge/` 各含组件、`variants.ts` 与 `index.ts`。形状与尺寸用 cva 定义，未用 `VariantProps` 推导——Vue SFC 编译器无法解析 cva 的 `TSConditionalType`，构建会以 `Unresolvable type: TSConditionalType` 失败；改为导出 `ButtonVariant`/`ButtonSize`/`BadgeVariant` 显式联合，并用 `satisfies Record<...>` 让 cva 的 variant 表与联合保持同步。按钮实现了 `as`（字符串或组件）、`loading`（`aria-busy`、`aria-disabled`、`disabled`）、`progress`/`leading`/`default`/`trailing` 四个 slot；`as` 非 `button` 时点击由组件自身的监听器拦截，`loading` 与 `disabled` 都不会冒泡到使用者的 `@click`（实测连点 2 次 enabled 与 inert 后计数为 2）。headless Chrome 实测：primary `rgb(21,24,31)` 底 `rgb(245,246,248)` 字、secondary `rgb(231,234,239)`/`rgb(21,24,31)`、ghost 透明底、danger 派生橙底配 surface 字；三档 `min-height` 为 32/44/52px，内边距 12/24/32px，圆角 12px。

- [x] **003-T02：separator 与 card**
  - 依赖：003-T01
  - 目标路径：`registry/ui/separator/`、`registry/ui/card/`
  - 行动：separator 支持横竖与 decorative；card 提供 `raised`/`surface` 两种外观与 header/content/footer
  - 预期输出：卡片在两种外观下的背景、描边与圆角与令牌一致
  - 验收引用：003-AC03
  - 计划验证：渲染两种外观并检查是否出现未定义色值
  - 完成证据：`Separator.vue` 按 `orientation` 输出 `h-px w-full` 或 `h-full w-px self-stretch`，`decorative` 为真（默认）时 `role="presentation"` 且 `aria-hidden="true"`，为假时输出 `role="separator"` 与 `aria-orientation`；实测三例的 `role`/`aria-hidden`/`aria-orientation` 与 1x1 像素几何均符合。`Card.vue` 用 `appearance` 选择 `bg-raised` 或 `bg-surface`，两者共用 `rounded-panel border border-line`；headless Chrome 实测 raised `rgb(255,255,255)`、surface `rgb(245,246,248)`，圆角均 16px，描边均 `rgb(221,225,231)`。`CardHeader` 提供 `title`/`description`/`action` 槽且默认槽填入标题，`CardFooter` 带 `border-t border-line`。四个分区组件都把非 `class` 属性透传到根元素。

- [x] **003-T03：input 与 label**
  - 依赖：003-T01
  - 目标路径：`registry/ui/input/`、`registry/ui/label/`
  - 行动：输入框含聚焦环与 `invalid` 态（用 `aria-invalid` 驱动样式）；label 支持 `required` 标记与 `for` 关联
  - 预期输出：键盘 Tab 到输入框时可见焦点环；错误态与禁用态外观确定
  - 验收引用：003-AC04
  - 计划验证：手动 Tab 遍历、切换 `invalid`、验证 `htmlFor` 与 `id` 关联
  - 完成证据：`Input.vue` 用 `defineModel` 支持 `v-model`，`invalid` 输出 `aria-invalid="true"` 并驱动描边与聚焦环颜色，`disabled` 置原生属性并降到 55% 不透明度；`Label.vue` 把 `for` 渲染为原生 `for`，`required` 追加 `aria-hidden` 的星号。headless Chrome 无障碍树实测：输入框 `role=textbox`、`name` 取自关联 label（Name/Invalid）、invalid 字段 `invalid=true`；`<input>.labels` 三例均回指对应 label，关联生效。Tab 到输入框时 `outline: solid 2px rgb(21,24,31)`、`offset 2px`。焦点环用 `focus-visible:outline-solid` 显式声明，否则被 `outline-none` 的 `--tw-outline-style: none` 覆盖成不可见（见复审记录）。

- [x] **003-T04：switch**
  - 依赖：003-T01
  - 目标路径：`registry/ui/switch/`
  - 行动：基于 reka-ui 包装；滑块位移与尺寸按参考站点（24/44 为 md，32/64 为 lg）；支持 `prefers-reduced-motion` 下取消过渡
  - 预期输出：键盘空格可切换，状态与视觉同步
  - 验收引用：003-AC05
  - 计划验证：键盘操作与读屏可读性检查；减少动效偏好下无过渡
  - 完成证据：`Switch.vue` 包装 reka-ui 的 `SwitchRoot`/`SwitchThumb`，`defineModel` 双向绑定，非 `class` 属性透传（`aria-label` 等），`thumb` 槽可放图标。md 轨道 44x28、滑块 24x24，lg 轨道 64x40、滑块 32x32（CSS 像素，headless Chrome 实测）。空格与回车均可切换，`aria-checked`、`data-state` 与轨道底色同步（`rgb(21,24,31)`/`rgb(231,234,239)`）；禁用状态下点击不改变 `aria-checked`。`prefers-reduced-motion: reduce` 下轨道与滑块的 `transition-property` 均为 `none`。

- [x] **003-T05：登记 item 并产出 JSON**
  - 依赖：003-T01 至 003-T04
  - 目标路径：`registry/registry.json`
  - 行动：为七个 item 写入 `name`/`type`/`dependencies`/`registryDependencies`/`files`/`docs`，然后构建
  - 预期输出：`r/` 下出现对应 JSON，且依赖声明正确
  - 验收引用：003-AC06
  - 计划验证：`pnpm build:registry` 成功，检查每个 item 的 `registryDependencies` 均包含 `utils` 与 `theme`
  - 完成证据：`registry/registry.json` 增至 9 个 item。七个组件 item 均为 `registry:ui`，`registryDependencies` 统一为 `["utils", "theme"]`；`dependencies` 按实际导入声明：button/badge 为 `class-variance-authority`、`clsx`、`tailwind-merge`，separator/card/input/label 为 `clsx`、`tailwind-merge`，switch 另加 `reka-ui`。`files` 含组件、变体与 `index.ts`（`index.ts` 必须随 item 分发，否则安装后目录没有入口，消费者 `import '@/components/ui/card'` 会报 `Is a directory`）。`pnpm build:registry` 输出 12 个文件，`apps/docs/public/r/` 下并排落地 `button.json` 至 `switch.json` 与四类汇总产物。根 `devDependencies` 新增 `class-variance-authority@0.7.1` 与 `reka-ui@2.11.0`，只为让仓库内 `typecheck`/`lint` 能解析这两个导入，不改变 item 的依赖声明。

## 验收标准

- [x] **003-AC01：按钮全部变体与尺寸可渲染**
  - 计划验证：在临时项目渲染 4 变体 x 3 尺寸，外观与令牌对照表一致
  - 所需环境：002 完成、网络可用
  - 验证证据：在 `/tmp/ui3`（Vite 8.3.8 + Vue 3.5.45 + Tailwind 4.3.5）经 `npx shadcn-vue@2.9.0 add` 安装七个 item 后，headless Chrome 156 读取 `getComputedStyle`：4 变体 x 3 尺寸共 7 个按钮全部渲染，`min-height` 32/44/52px、`padding-inline` 12/24/32px、`border-radius` 12px、字号 13/15/17px，与设计表逐项一致；背景与前景色对应 `--p0seid0n-ink`/`--p0seid0n-surface`/`--p0seid0n-control`。在 375、640、1024、1440 四个宽度下尺寸不变（令牌取参考站点移动端实测值，计划风险表所述「桌面端偏小」不成立：三档尺寸在断点间恒定，只是绝对值偏紧凑）。

- [x] **003-AC02：按钮交互态正确**
  - 计划验证：hover、focus-visible、disabled、loading 四态可见且互不冲突
  - 所需环境：浏览器
  - 验证证据：headless Chrome 逐态实测。hover（强制 `:hover` 且 `(hover: hover)` 为真的窗口）：primary `oklab(0.316...)`、secondary 加深、ghost 变 `rgb(231,234,239)`、danger 加深一档，四者互不冲突。focus-visible（CDP `CSS.forcePseudoState`）：`outline: solid 2px rgb(21,24,31)`、`offset 3px`，鼠标点击后 `:focus-visible` 不匹配且无描边。disabled 与 loading 均为 `opacity 0.55`、`cursor: default`、原生 `disabled`，加载态另带 `aria-busy="true"` 与 `aria-disabled="true"`。对 `as="a"`，`aria-disabled` 与 `aria-busy` 同样生效，且点击被组件拦截。对比度（canvas 解析 oklab 后计算）：primary 16.43:1、secondary 14.73:1、danger 4.61:1、danger hover 5.69:1（见复审记录）。

- [x] **003-AC03：卡片两外观与令牌一致**
  - 计划验证：`raised` 使用 `--color-raised`，`surface` 使用 `--color-surface`；圆角为 16px
  - 所需环境：无
  - 验证证据：headless Chrome 实测 `#card-raised` 背景 `rgb(255,255,255)`（`--color-raised`）、`#card-surface` 背景 `rgb(245,246,248)`（`--color-surface`），两者 `border-radius` 均为 16px、`border` 均为 `1px rgb(221,225,231)`（`--color-line`）。浅色与深色两种 `prefers-color-scheme` 下均取到令牌对应值（深色分别为 `rgb(26,29,36)` 与 `rgb(18,20,25)`）。未出现未定义色值：`grep -rnE "#[0-9A-Fa-f]{3,8}\b|rgba?\(|hsla?\(" registry/ui/` 无命中。

- [x] **003-AC04：输入框可访问**
  - 计划验证：`label[for]` 与 `input#id` 关联生效；`aria-invalid` 时描边使用危险色；Tab 焦点环可见
  - 所需环境：浏览器
  - 验证证据：`<input>.labels[0]` 对三个字段分别返回 `Name*`、`Invalid`、`Disabled`，即 `label[for]` 与 `input#id` 关联生效；无障碍树中 `role=textbox` 的 `name` 为该 label 文本。`aria-invalid="true"` 时描边为 `oklab(0.55136 0.0567671 0.0946894)`（由 `--color-accent-alt` 与 ink 混合），对控件底色 4.13:1、对 surface 4.22:1，均高于非文本 3:1 门槛；未设 `invalid` 时为 `rgb(221,225,231)`。Tab 聚焦时 `outline: solid 2px rgb(21,24,31)`、`offset 2px`，invalid 字段的环为危险色。

- [x] **003-AC05：开关可用键盘操作**
  - 计划验证：空格切换、状态属性同步、减少动效下无过渡
  - 所需环境：浏览器
  - 验证证据：headless Chrome 中聚焦开关后发送空格，`aria-checked` 由 `true` 变 `false`、轨道底色由 `rgb(21,24,31)` 变 `rgb(231,234,239)`、滑块 `translate` 归零；点击与回车同样切换。无障碍树 `role=switch`、`checked=true/false`、`focusable=true`、禁用时 `disabled=true`。`prefers-reduced-motion: reduce` 下轨道与滑块 `transition-property` 均为 `none`，按下到稳态无过渡。

- [x] **003-AC06：七个 item 单独可安装**
  - 计划验证：逐个 item 在空项目中安装并渲染，无缺失依赖
  - 所需环境：网络可用
  - 验证证据：为每个 item 准备一份把 `registryDependencies` 改写为同源 URL 的临时副本（原因见复审记录），在七个独立的空消费者目录 `/tmp/inst-{button,badge,separator,card,input,label,switch}` 中逐个 `npx shadcn-vue@2.9.0 add <file>`，全部报 `Created 4-7 files`，每个目录都落地 `src/styles/p0seid0n.css`（theme）与 `src/lib/utils.ts`（utils）；随后各自 `pnpm build` 均成功，无缺失依赖。安装产物与 `registry/ui/` 源文件逐字一致（逐文件 `diff` 无输出）。在合并消费者 `/tmp/ui3` 中同时装入七个 item 后 `pnpm build` 亦成功。

- [x] **003-AC07：无硬编码色值与 `dark:` 变体**
  - 计划验证：检索这七个组件目录，十六进制色值与 `dark:` 均无命中
  - 所需环境：无
  - 验证证据：`grep -rnE "#[0-9A-Fa-f]{3,8}\b" registry/ui/` 无命中；`grep -rn "dark:" registry/ui/` 无命中；`grep -rnE "rgba?\(|hsla?\(" registry/ui/` 无命中。颜色只用 `bg-raised`、`bg-surface`、`text-ink`、`text-ink-muted`、`text-ink-faint`、`border-line`、`bg-control`、`bg-ink`、`text-surface`、`bg-accent`、`bg-accent-alt` 等语义名，以及从这些令牌派生 `color-mix()` 的透明/加深档。

### 复审记录

**危险色对比度不足，已提升为独立令牌。** 计划风险表首行要求在 003-AC01 时实测对比度，不足则在 001 追加独立 `--color-danger`。实测：`--color-accent-alt` 原值（浅色 `#C8731A`）配 `text-surface` 只有 3.28:1，`--color-accent` 是 4.30:1，都低于正文 4.5:1。经用户确认后本轮直接新增令牌而非在组件里散落派生值：`registry/styles/p0seid0n.css` 增加 `--p0seid0n-danger: color-mix(in oklab, var(--p0seid0n-upload) 80%, var(--p0seid0n-ink))`，`@theme inline` 桥接为 `--color-danger`。九个取自参考站点的色值一分未改，新令牌明确标注为「派生、非参考站点来源」，因此 001-AC02 的逐字一致性仍然成立；使用者的覆盖面与其余令牌相同（改 `--p0seid0n-danger` 即换危险色）。实测派生值浅色 4.61:1（对 surface）、深色 7.07:1，hover 加深一档为 5.69:1 与 8.07:1。button 的 `danger`、badge 的 `accent-alt`、input 的 invalid 描边与聚焦环、label 的必填星号全部回填为 `bg-danger`/`text-danger`/`border-danger`/`outline-danger`。`--color-accent` 仍在 4.30:1，badge 的 `accent` 因此保留组件内的 88% 混合（5.13:1）；该档未提升为令牌，因为目前只有 badge 一个消费者。


**`outline-none` 会吞掉焦点环。** 首版按钮写 `outline-none` 加 `focus-visible:outline-2`，实测 `outline-style` 仍是 `none`：Tailwind 的 `outline-none` 会置 `--tw-outline-style: none`，而 `outline-2` 只设置 `outline-width` 并把 `outline-style` 读回该变量。必须在 `focus-visible` 上显式补 `outline-solid`。button、input、switch 三处已统一为 `focus-visible:outline-2 focus-visible:outline-solid`，实测 `outline: solid 2px rgb(21,24,31)`。

**`v-bind="$attrs"` 让 `loading`/`disabled` 拦不住点击。** 父组件的 `@click` 会作为 `onClick` 出现在 `$attrs` 里，与本组件自己的 `@click` 是两个独立监听器，早退只停掉自己的那个。改为组件独占点击：从透传属性中剔除 `class` 与 `onClick`，由 `onClick` 判断 `loading`/`disabled` 后再调用使用者的处理器。实测连点启用与 inert 按钮各两次，计数只增加两次。

**`inheritAttrs: false` 需要显式转发。** 七个组件都关闭了自动继承以便合并 `class`，因此每个组件都要把剩余属性透传到根元素（`button` 的 `href`、`input` 的 `placeholder`、`switch` 的 `aria-label` 都依赖这一点）。复审时为 badge、card 四个分区、separator、input、label、switch 补齐了转发。

**cva 的 `VariantProps` 不能进 `defineProps` 泛型。** `defineProps<ButtonVariants & {...}>` 会让 `@vue/compiler-sfc` 在构建期抛 `Unresolvable type: TSConditionalType`（来自 cva 的 `OmitUndefined`），消费者 `vite build` 直接失败。改为在 `variants.ts` 导出显式联合类型，并用 `satisfies Record<ButtonVariant, string>` 让 cva 的键与联合保持同步。

**`index.ts` 必须随 item 分发。** 首版只登记了 `.vue` 与 `variants.ts`，安装后目录没有入口，消费者 `import '@/components/ui/card'` 报 `Is a directory (os error 21)`。七个 item 的 `files` 都已补上 `index.ts`。

**插值类名不会生成 CSS。** input 的 invalid 样式首版写成模板字符串拼接（`` `aria-[invalid=true]:border-[${invalidLine}]` ``），Tailwind 提取不到完整字面量，构建产物里没有该规则，`aria-invalid` 状态没有任何视觉变化。改为把两个类的完整字面量直接写在模板里；复审时用产物 CSS 中的选择器命中与运行时 `border-color` 双向确认。

**占位符与 invalid 描边对比度。** 占位符原用 `text-ink-faint`，对控件底色只有 1.96:1，改为 `text-ink-muted`（5.08:1）。invalid 描边原用 `accent-alt` 原值，对控件底色 2.94:1，低于非文本 3:1 门槛，改为同一派生色后为 4.13:1（浅色）与 5.08:1（深色）。

**上游 CLI 无法用裸名解析跨 item 依赖。** 003-AC06 原计划直接把 `r/{name}.json` 交给 `shadcn-vue` 安装，实测失败：`button.json` 声明 `registryDependencies: ["utils", "theme"]` 后，CLI 把这两个裸名当作官方 registry 的条目，去取 `https://shadcn-vue.com/r/styles/new-york-v4/theme.json` 并报 404，`utils` 则被它自带的同名条目顶替。这证实 002 的结论只对「依赖本身也是同源 URL」成立。两种绕法都已实测可用：把依赖改写成绝对 URL，或在 `components.json` 的 `registries` 中声明 `@p0seid0n` 命名空间并用 `@p0seid0n/utils` 形式引用。清单本身保留裸名（002 的校验要求 `registryDependencies` 引用清单内 name），依赖解析交给 007 的自有 CLI 按 `r/registry.json` 处理。**该限制必须在 006（文档站安装说明）与 007（CLI）中显式处理，不能假设上游 CLI 能直接消费 `r/{name}.json`。**

**危险色语义。** `danger` 复用 `--color-accent-alt` 的色相，未引入 download/upload 命名，符合 D06 与 009 的命名约束。

### 完成与交接要求

- 004 复用 button、card 与 utils；005 复用 card 与 button
- 在单独授权的实施期间，任务完成且所需检查通过后必须勾选任务复选框；验收验证通过后必须勾选验收复选框。记录实际命令或步骤、结果和证据位置。
- 在准备完成提交前，必须勾选所有必需任务和验收项。失败、跳过、阻塞或未执行的检查保持未勾选，并阻止阶段完成。
- 更新此文档和总计划的阶段状态，然后检查工作区和暂存区变更；只使用明确路径或已审阅代码块暂存该阶段的实施变更和进度更新。保留无关修改和预先存在的暂存工作；如果无法安全分离则暂停。
  - 实际执行：工作区里存在 001/002 完成之后遗留的 `ocean` -> `p0seid0n` 全量改名（计划文档目录搬迁、两个样式文件改名、eslint 插件名、根包名），本阶段开工前它们处于已暂存的重命名状态。新 item 的 JSON 与构建产物都指向 `styles/p0seid0n.css`，因此无法只提交 003 路径而得到可构建的树。经用户确认后拆成两次提交：先 `chore(p0seid0n-vue-ui): rename ocean identifiers to p0seid0n` 提交改名，再 `feat(p0seid0n-vue-ui): complete subplan 003 - core-controls` 提交本阶段的源码、清单、产物与文档。
- 在开始依赖阶段前，为本阶段创建一次独立完成提交。遵循仓库约定；否则使用 `feat(p0seid0n-vue-ui): complete subplan 003 - core-controls`。不要合并已完成子计划，也不要为每个复选框创建提交。
- 验证成功并报告提交哈希。提交失败时阶段关闭仍等待提交；不要声称完全完成。缺少 Git、仓库或身份信息、钩子失败或变更已提交时请求用户指导。不要自动初始化 Git、修改身份、绕过钩子、推送、改写历史或创建空提交。
- 验证结果：已执行。T01 至 T05 与 AC01 至 AC07 全部通过，证据见各任务与验收项的完成证据。验证环境：Node 25.9.0、pnpm 12.8.1、Vue 3.5.45、Vite 8.3.8、Tailwind 4.3.5、shadcn-vue 2.9.0、reka-ui 2.11.0、headless Chrome 156（CDP 驱动）。临时验证目录 `/tmp/ui3`、`/tmp/ui3b`、`/tmp/inst-*`、`/tmp/inst2-*`、`/tmp/shadcn-vue-pkg`、`/tmp/tw4` 未纳入仓库。
- 实施需要单独授权；生成计划时不要执行任务或创建完成提交。

## 风险与缓解措施

| 风险 | 影响 | 缓解或回滚 | 相关任务 |
| --- | --- | --- | --- |
| 把危险色绑定到 `--color-accent-alt`（源自 upload 色）后语义偏弱 | 危险操作提示不够醒目 | 已关闭。原值配 `text-surface` 仅 3.28:1，已在 `p0seid0n.css` 追加派生的 `--p0seid0n-danger`（80% 向 ink 混合）并桥接为 `--color-danger`，实测 4.61:1 / 7.07:1。九个参考站点色值未改 | 003-T01 |
| `as`/`asChild` 在 Vue 中的实现方式与 React 差异大 | 按钮无法渲染为链接 | 已按计划只实现 `as`（字符串或组件），不实现 `asChild`；`aria-disabled`/`aria-busy` 与点击拦截在非 button 根元素上同样生效 | 003-T01 |
| 尺寸令牌来自参考站点的移动端值 | 桌面端偏小 | 已在 375、640、1024、1440 四档实测：三档尺寸恒定，无断点跳变。「绝对值偏紧凑」已接受，与参考站点一致 | 003-T01 |
| 上游 CLI 用裸名解析跨 item 依赖时会转向官方 registry | `r/{name}.json` 无法被上游 CLI 直接消费 | 已实测确认。清单保留裸名，改由 007 的自有 CLI 按 `r/registry.json` 解析；006/007 必须显式处理，不得假设上游 CLI 可用 | 003-T05 |
| `badge` 的 `accent` 仍在组件内做 88% 混合 | 换肤时该档不随令牌改变（其余危险色已随 `--p0seid0n-danger` 联动） | 目前仅 badge 一个消费者；若 005 的 stat tone 也要用，应提升为第二个令牌 | 003-T01 |

## 延期决策

| 问题 | 已接受的影响 | 解决任务 | 阻塞对象 |
| --- | --- | --- | --- |
| 是否需要 `xl` 尺寸与圆形按钮 | 使用者需自行组合 | 003-T01 后按实际示例需要追加 | 无，非阻塞 |
| 是否把 `--color-accent` 的加深档也提升为令牌（当前仅 badge 使用） | badge 的 accent 底层颜色不随令牌覆盖变化 | 005 若出现第二个消费者时提升，并回填 badge | 无，非阻塞 |
| `color-mix(in oklab, ...)` 的浏览器基线 | 旧浏览器会退回 `@supports` 之前的实色后退值（Tailwind 自动生成），配色略偏但不会失效 | 与 001 的 `light-dark()` 基线一并记录，不单独设降级路径 | 无，非阻塞 |
