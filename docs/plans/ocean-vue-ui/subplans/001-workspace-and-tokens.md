# 001：workspace 与令牌层

## 元数据

- 阶段 ID：001
- 总计划：[ocean：Vue UI 库（首版）](../README.md)
- 实施状态：已完成
- 依赖：无
- 目标引用：G02
- 决策引用：D01、D04、D05、D09、D10

## 目标

建立 pnpm workspace 骨架与唯一的令牌来源，使 Tailwind v4 能从 `--ocean-*` 变量派生全部语义工具类，并让深浅色由 `color-scheme` 决定。

## 范围

### 包含

- 根 `package.json`、`pnpm-workspace.yaml`、`tsconfig.base.json`、`.gitignore`
- `registry/styles/ocean.css`：令牌定义、`@theme inline` 桥接、`color-scheme` 开关
- `registry/styles/ocean-shadcn.css`：可选 shadcn 语义别名
- 令牌值对照表（来自参考站点源码）
- 构建工具基线：Tailwind v4、Vue 3.5、TypeScript、prettier 与 eslint 的最小配置

### 排除

- 任何组件实现（交给 003 至 005）
- registry 清单与产物（交给 002）
- 文档站（交给 006）

## 前置条件

- 用户授权在仓库根执行 `git init`（本计划不自动执行）：已于实施时获得授权并执行，仓库现为 git 仓库
- 确认 pnpm 为唯一包管理器：已满足（pnpm 12.8.1，根 `packageManager` 已声明）
- 若 `light-dark()` 被判定为目标浏览器不可接受，需先确认是接受双写回退还是放弃该机制（G02 与 D05 受影响）：001-T03 实测 Chrome 156 正常，无需回退
- 参考站点源码的可读方式：本仓库内没有 `speed-ref/` 副本，实际取自上游 `github.com/SukkaW/speed.skk.moe`（Apache-2.0）的 `src/styles/` 同名文件，经 `raw.githubusercontent.com` 读取。逐字比对以此为准；若需离线复核，需自行放置一份 `speed-ref/`

## 设计

### 模块边界与目标路径

| 模块或路径 | 现有或拟议 | 职责 | 计划变更 |
| --- | --- | --- | --- |
| `package.json` | 拟议 | 私有根包、workspace 脚本 | 新建 |
| `pnpm-workspace.yaml` | 拟议 | 声明 `apps/*` 与 `packages/*` | 新建 |
| `tsconfig.base.json` | 拟议 | 共享 TS 配置与路径别名 | 新建 |
| `.gitignore` | 拟议 | 忽略 node_modules、构建产物、文档站安装产物 | 新建 |
| `registry/styles/ocean.css` | 拟议 | 唯一色值来源与 Tailwind 桥接 | 新建 |
| `registry/styles/ocean-shadcn.css` | 拟议 | shadcn 语义别名映射 | 新建 |

### 接口与数据

令牌取自参考站点 `src/styles/tokens.stylex.ts`，全部经 `light-dark()` 写为单行双值：

```text
surface      light-dark(#F5F6F8, #121419)
raised       light-dark(#FFFFFF, #1A1D24)
ink          light-dark(#15181F, #ECEEF2)
ink-muted    light-dark(#5B6270, #969CAA)
ink-faint    light-dark(#A3A9B5, #5E6473)
line         light-dark(#DDE1E7, #2A2E37)
control      light-dark(#E7EAEF, #2B303A)
download     light-dark(#2F6FE4, #5B8DEF)
upload       light-dark(#C8731A, #C97C26)
radius-control    12px
radius-panel      16px
radius-panel-lg   20px
shadow-popup      0 12px 32px -8px light-dark(rgba(26,36,34,.18), rgba(0,0,0,.6))
```

九个色值与三项尺寸、一项阴影全部以 `--ocean-*` 形式定义在 `:root`，构成唯一的可覆盖入口。`@theme inline` 只做 `var()` 桥接，不写入字面量：

`@theme inline` 桥接出的使用面：

```css
--color-surface, --color-raised
--color-ink, --color-ink-muted, --color-ink-faint
--color-line, --color-control
--color-accent: var(--ocean-download)
--color-accent-alt: var(--ocean-upload)
--radius-control: var(--ocean-radius-control)     /* 控件 */
--radius-panel: var(--ocean-radius-panel)         /* 卡片 */
--radius-panel-lg: var(--ocean-radius-panel-lg)   /* lg 断点下的大面板 */
--font-sans: var(--font-barlow, "Barlow"), system-ui, sans-serif
--font-condensed: var(--font-barlow-semi-condensed, "Barlow Semi Condensed"), var(--font-barlow, "Barlow"), system-ui, sans-serif
--shadow-popup: var(--ocean-shadow-popup)
```

桥接一律使用 `var()` 而非字面量。原因：`@theme inline` 会把字面量在编译期固化进工具类，使 `--radius-panel: 16px` 编译成 `border-radius: 16px`，使用者重定义变量也无法生效。改为 `var()` 后，工具类保留变量引用，尺寸、阴影与颜色三者行为一致。

`--color-accent` 与 `--color-accent-alt` 是组件层唯一允许使用的强调色名，`download`/`upload` 仅作为其来源保留，以满足 D09。

`color-scheme` 规则：

```css
:root { color-scheme: light dark; }
:root.light { color-scheme: light; }
:root.dark { color-scheme: dark; }
```

`ocean-shadcn.css` 只做映射，不重新定义色值：

```css
--color-background: var(--ocean-surface)
--color-foreground: var(--ocean-ink)
--color-card: var(--ocean-raised)
--color-primary: var(--ocean-ink)
--color-muted-foreground: var(--ocean-ink-muted)
--color-border: var(--ocean-line)
--color-input: var(--ocean-line)
--color-ring: var(--ocean-ink)
```

### 运行行为

- 令牌文件不包含任何组件选择器，只包含 `:root` 与主题桥接
- 使用者若整体替换令牌，组件无需改动即可换肤。已实测：`--ocean-*` 任一处被重定义后，使用该语义名的元素立即换色（`--ocean-raised` 改 `#00FF00` 时面板背景同步变化），子树内重定义亦生效
- 尺寸与阴影与颜色同权可覆盖：在 `:root` 重定义 `--ocean-radius-panel`、`--ocean-shadow-popup` 后，`rounded-panel` 与 `shadow-popup` 立即跟随；子树内重定义同样生效。实测一次注入同时改动颜色、圆角与阴影，三者均按新值渲染
- 不引入 `dark:` 变体，任何需要暗色差异的地方都必须通过令牌表达

## 实施任务

- [x] **001-T01：建立 workspace 骨架**
  - 依赖：无
  - 目标路径：`package.json`、`pnpm-workspace.yaml`、`tsconfig.base.json`、`.gitignore`
  - 行动：写入根包（private、`packageManager: pnpm@12`、脚本 `build:registry`、`ui:install`、`docs:dev`、`docs:build` 的占位定义）、workspace 声明、共享 TS 配置；`.gitignore` 覆盖 `node_modules`、`apps/docs/public/r` 之外的所有构建输出与三个安装产物路径
  - 预期输出：`pnpm install` 在空 workspace 下成功
  - 验收引用：001-AC01
  - 计划验证：`pnpm install` 无错误；`git status` 只显示计划文档与新骨架文件
  - 完成证据：已写入 `package.json`（private、`packageManager: pnpm@12.8.1`、`build:registry`/`ui:install`/`docs:dev`/`docs:build`/`typecheck`/`lint`/`format` 脚本）、`pnpm-workspace.yaml`（`apps/*`、`packages/*`）、`tsconfig.base.json`（含 `@/*` -> `registry/*`）、`tsconfig.json`（根 typecheck 入口）、`.gitignore`。空 workspace 下 `pnpm install` 退出码 0；在无 `node_modules` 的副本中 `pnpm install --frozen-lockfile` 同样退出码 0。

- [x] **001-T02：写入令牌与桥接 CSS**
  - 依赖：001-T01
  - 目标路径：`registry/styles/ocean.css`、`registry/styles/ocean-shadcn.css`
  - 行动：按设计写入九个 `--ocean-*` 令牌、`@theme inline` 桥接、`color-scheme` 规则、popup 阴影；`ocean-shadcn.css` 只做变量映射
  - 预期输出：两个 CSS 文件，`ocean.css` 是仓库中唯一包含十六进制色值的文件
  - 验收引用：001-AC02、001-AC03
  - 计划验证：`grep -rn "#[0-9A-Fa-f]\{6\}" registry/` 只命中 `ocean.css`
  - 完成证据：`registry/styles/ocean.css` 含十三个 `--ocean-*` 令牌（九个色值 + 三项圆角 + 一项阴影）、`color-scheme` 三条规则与 `@theme inline` 桥接；`registry/styles/ocean-shadcn.css` 仅含八个 `--color-*` 映射，无任何色值。`grep -rn "#[0-9A-Fa-f]\{6\}" registry/` 只命中 `ocean.css`。字体族用 `var(--font-barlow, "Barlow")` 形式给出回退名，避免未定义变量导致 `font-sans`/`font-condensed` 退化为浏览器默认字体栈（实测未写回退名时 `font-sans` 计算出系统默认栈）；使用者定义 `--font-barlow` 后即覆盖该名，实测设为 `"Inter"` 时 `font-family` 变为 `Inter, system-ui, sans-serif`。

- [x] **001-T03：验证 Tailwind v4 能派生语义工具类**
  - 依赖：001-T02
  - 目标路径：临时验证目录（不提交）
  - 行动：临时安装 Tailwind v4 CLI，以 `registry/styles/ocean.css` 为输入，扫描一个含 `bg-raised`、`text-ink-muted`、`ring-line`、`rounded-panel`、`font-condensed` 的 HTML 文件并编译
  - 预期输出：编译后的 CSS 中存在这些工具类，其值与令牌一致
  - 验收引用：001-AC04
  - 计划验证：检查编译产物的声明值；同时用 `.light` 与 `.dark` 类观察 `color-scheme` 生效
  - 完成证据：在临时目录用 `@tailwindcss/cli@4.3.5` 以 `@import "tailwindcss"` + `ocean.css` + `ocean-shadcn.css` 编译，产物含 `.bg-raised{background-color:var(--ocean-raised)}`、`.text-ink-muted{color:var(--ocean-ink-muted)}`、`.ring-line{--tw-ring-color:var(--ocean-line)}`、`.rounded-panel{border-radius:var(--ocean-radius-panel)}`、`.font-condensed{font-family:var(--font-barlow-semi-condensed, "Barlow Semi Condensed"), var(--font-barlow, "Barlow"), system-ui, sans-serif}`、`.shadow-popup`，以及 shadcn 别名 `.bg-card`/`.bg-background`/`.text-muted-foreground`。headless Chrome 实测：`<html>` 无类时跟随 `prefers-color-scheme` 模拟得到 surface `rgb(18,20,25)`；加 `.light` 变 `rgb(245,246,248)`；加 `.dark` 变 `rgb(18,20,25)`，`color-scheme` 同步为 `light`/`dark`。九组值与设计表逐一相符。另在真实 Vite 8 + `@tailwindcss/vite` + Vue 3.5 消费者项目中构建并实测，同一元素在 `.light`/`.dark` 下实际颜色随令牌切换。

- [x] **001-T04：建立开发工具基线**
  - 依赖：001-T01
  - 目标路径：根 `package.json`、`eslint.config.js`、`.prettierrc`
  - 行动：加入 `tailwindcss`、`@tailwindcss/vite`、`vue`、`typescript`、`vue-tsc`、prettier 与 eslint 的最小配置；禁止 emoji 的提示写入仓库约定由 001-AC05 覆盖
  - 预期输出：`pnpm lint` 与 `pnpm typecheck` 在空项目下以零退出
  - 验收引用：001-AC05
  - 计划验证：执行两个命令并检查退出码
  - 完成证据：`pnpm lint` 与 `pnpm typecheck` 在空项目下退出码均为 0。devDependencies 为 `tailwindcss`、`@tailwindcss/vite`、`vue`、`typescript`、`vue-tsc`、`prettier`、`eslint`、`@eslint/js`、`typescript-eslint`、`eslint-plugin-vue`、`vue-eslint-parser`、`eslint-config-prettier`、`globals`、`@types/node`。`eslint.config.js` 内置 `ocean/no-emoji` 规则（`\p{Extended_Pictographic}`），实测能报出 `.ts` 字符串与 `.vue` 模板中的 emoji；`vue-eslint-parser` 的 `VText` 选择器形式无法命中，故改用源码文本扫描。`tsconfig.json` 只纳入 `registry/`、`scripts/`、`packages/`，实测类型错误会以退出码 2 失败。附加 `.prettierignore`（排除 `docs/` 与 `registry/styles/ocean.css`），否则 `prettier --write` 会把色值改成小写并重排计划文档；`prettier --check .` 现为全通过。

## 验收标准

- [x] **001-AC01：workspace 可安装**
  - 计划验证：在新 clone 的仓库执行 `pnpm install`，退出码为零
  - 所需环境：pnpm 12
  - 验证证据：在 `/tmp/ocean-fresh` 的干净副本（无 `node_modules`）执行 `pnpm install --frozen-lockfile`，退出码 0，安装 14 个 devDependency 完成。

- [x] **001-AC02：令牌值与参考站点一致**
  - 计划验证：逐个比对 `registry/styles/ocean.css` 中的九组值与参考站点 `tokens.stylex.ts`
  - 所需环境：参考源码可读
  - 验证证据：逐条比对 `registry/styles/ocean.css` 与上游 `SukkaW/speed.skk.moe` 的 `src/styles/tokens.stylex.ts`（经 `raw.githubusercontent.com` 读取，见前置条件），九个令牌的 light 与 dark 值全部逐字一致（含大小写）。

- [x] **001-AC03：色值集中**
  - 计划验证：全文检索十六进制色值，结果只出现在 `registry/styles/ocean.css`
  - 所需环境：无
  - 验证证据：全文 `grep -rn "#[0-9A-Fa-f]\{6\}" .`（排除 `node_modules`、`.git`）只命中 `registry/styles/ocean.css`；命中文件清单另含计划文档自身的令牌表（属文档记录，非色值来源）。

- [x] **001-AC04：Tailwind 语义类可用且随主题切换**
  - 计划验证：Tailwind v4 编译产物的工具类声明正确；给 `<html>` 加 `.light` / `.dark` 时同一元素的实际颜色随之改变
  - 所需环境：临时 Tailwind 编译环境
  - 验证证据：Tailwind v4.3.5 编译产物声明值见 001-T03；headless Chrome 中给 `<html>` 加 `.light`/`.dark` 后同一元素 `background-color` 在 `rgb(255,255,255)` 与 `rgb(26,29,36)` 之间切换，`bg-accent` 在 `rgb(47,111,228)` 与 `rgb(91,141,239)` 之间切换。

- [x] **001-AC05：仓库无 emoji 且 lint 干净**
  - 计划验证：`pnpm lint` 零退出；用正则检索提交文件中的 emoji 范围无命中
  - 所需环境：eslint 已安装
  - 验证证据：`pnpm lint` 退出码 0；Python 正则扫描全部 37 个非 `node_modules` 文件，emoji 命中 0。反向测试：`.ts` 字符串与 `.vue` 模板各插一个 emoji 时 lint 以退出码 1 报错。

### 完成与交接要求

- 002 需要 `registry/styles/ocean.css` 作为令牌 item 的文件来源；003 至 005 需要其工具类可编译
- 在单独授权的实施期间，任务完成且所需检查通过后必须勾选任务复选框；验收验证通过后必须勾选验收复选框。记录实际命令或步骤、结果和证据位置。
- 在准备完成提交前，必须勾选所有必需任务和验收项。失败、跳过、阻塞或未执行的检查保持未勾选，并阻止阶段完成。
- 更新此文档和总计划的阶段状态，然后检查工作区和暂存区变更；只使用明确路径或已审阅代码块暂存该阶段的实施变更和进度更新。保留无关修改和预先存在的暂存工作；如果无法安全分离则暂停。
- 在开始依赖阶段前，为本阶段创建一次独立完成提交。遵循仓库约定；否则使用 `feat(ocean-vue-ui): complete subplan 001 - workspace-and-tokens`。不要合并已完成子计划，也不要为每个复选框创建提交。
- 验证成功并报告提交哈希。提交失败时阶段关闭仍等待提交；不要声称完全完成。缺少 Git、仓库或身份信息、钩子失败或变更已提交时请求用户指导。不要自动初始化 Git、修改身份、绕过钩子、推送、改写历史或创建空提交。
- 验证结果：已执行。T01 至 T04 与 AC01 至 AC05 全部通过，证据见各任务与验收项的完成证据。验证环境：Node 25.9.0、pnpm 12.8.1、Tailwind 4.3.5、Chrome 156。临时验证目录 `/tmp/tw-verify`、`/tmp/vite-consumer`、`/tmp/ocean-fresh` 未纳入仓库。
- 实施需要单独授权；生成计划时不要执行任务或创建完成提交。

### 复审记录

复审在完成提交之后独立执行：从 `HEAD` 重新 clone 到空目录，重跑 AC01 至 AC05 的全部检查，并在真实 Vite 消费者项目中复核运行时行为。

通过项：

- AC01 至 AC05 在 clone 出的干净仓库中全部重现通过
- `bg-raised/50`、`text-ink/80`、`border-line/60` 等透明度变体可用，`color-mix` 回退到纯色声明
- 消费者在自身 `@theme` 中重定义 `--radius-panel` 时，`rounded-panel` 跟随变为该值（实测 8px）
- `ocean-shadcn.css` 在 `ocean.css` 之前或之后引入都能正常产出 `bg-card` 等别名

复审发现并已修复：

- `.gitignore` 的 `.vitepress/cache/` 与 `.vitepress/dist/` 含内部斜杠，被 git 锚定到仓库根，未匹配 `apps/docs/.vitepress/cache/`。改为 `**/` 前缀，并用临时仓库验证：三个安装产物与两类 VitePress 输出均被忽略，`apps/docs/public/r/` 仍可提交
- `@types/node` 原为 `^26`，与本机 Node 25.9.0 不一致，改为 `^25`

参考源核对：仓库内没有计划假设的 `speed-ref/` 副本，本阶段实际从上游公开仓库 `SukkaW/speed.skk.moe` 取源码。已复取并确认：`src/styles/` 下的 `tokens.stylex.ts`、`globals.css`、`menu.stylex.ts`、`breakpoints.stylex.ts` 全部返回 200；`breakpoints.stylex.ts` 的 `639px`/`1024px` 与计划记录的 Tailwind `sm`/`lg` 一致，但 001 不使用断点，未纳入本阶段验证。同时核对总计划所记形状字段，均属实：popup 的 `minWidth 160`、`padding 6`、`borderRadius 16`、`borderColor line`、shadow `0 12px 32px -8px`；`start-button` 的 `minHeight 44` 与 `borderRadius 12`；`stat-value` 与 `speed-readout` 的 `fonts.condensed` + `tabular-nums` + `letterSpacing -0.01em`。这三份组件源码位于 `src/app/components/`，总计划原本只写了文件名，已补全路径。

复审发现并已修复（续）：

- `@theme inline` 会把字面量在编译期固化进工具类：原先直接写 `--radius-panel: 16px`，产物为 `border-radius: 16px`，重定义变量无效。颜色因为已桥接 `var(--ocean-*)` 而不受影响，导致同一份令牌文件里尺寸与颜色可覆盖性不一致。已修复：把三项圆角与一项阴影下沉为 `--ocean-*` 令牌，桥接改为 `var()`，产物变为 `border-radius: var(--ocean-radius-panel)`。消费者项目实测：一次 `:root` 注入同时改色、改圆角、改阴影，三者全部生效，子树覆盖同样有效

## 风险与缓解措施

| 风险 | 影响 | 缓解或回滚 | 相关任务 |
| --- | --- | --- | --- |
| `light-dark()` 在目标浏览器缺失 | 暗色不生效 | 在 001-T03 的验证里实测；若判定不可接受，回到本阶段改用双写回退并重新批准 D05 | 001-T02、001-T03 |
| Tailwind v4 的 `@theme inline` 与 `light-dark()` 组合行为与预期不符 | 工具类产不出正确值 | 用 001-T03 先验证再进入组件阶段；必要时把桥接改为 `var()` 直接映射 | 001-T02 |
| 令牌命名在组件阶段被证明不够用 | 需回改令牌并波及全部组件 | 组件层只允许用 `--color-accent` 与既有语义名；新增令牌必须在本阶段追加 | 001-T02 |

## 延期决策

| 问题 | 已接受的影响 | 解决任务 | 阻塞对象 |
| --- | --- | --- | --- |
| 是否需要在裸 HTML（非 Vue、非 Tailwind）环境下提供可用样式 | 使用者的非 Tailwind 场景需自行编写样式 | 001-T02 后评估是否追加预构建 CSS | 无，非阻塞 |
