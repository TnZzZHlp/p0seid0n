# p0seid0n：Vue UI 库（首版）

## 计划信息

- 计划名：`p0seid0n-vue-ui`
- 项目根目录：仓库根（`/root/github/0cean`，相对描述即本文档所在仓库）
- 计划目录：`docs/plans/p0seid0n-vue-ui/`
- 规划状态：已批准
- 实施状态：进行中（001、002、003、004、005、006 已完成）
- 批准依据：用户在评审后回复「批准」，批准范围为下述目标、范围、架构与 001-007 阶段拆分。批准时未提出「一条命令装全部」需求，因此该能力不进入 v1 范围（见 Q01）。

## 概述

从零构建一个 Vue UI 库。分发模型照搬 shadcn-vue：不发运行时包，而是发布符合 registry-item schema 的 JSON 清单，CLI 按 item 把组件源码写进使用者项目。首版视觉母题取自 `speed.skk.moe`（Apache-2.0，源码 `github.com/SukkaW/speed.skk.moe`）：双层背景、三级文字、`light-dark()` 内联深浅双值、Barlow 与 Barlow Semi Condensed 的字阶、12/16/20 圆角、640 与 1024 两档断点。

组件外观保留该母题的色彩与字阶，但 API 是通用 variant（primary/secondary/ghost/danger），不复制测速产品的 download/upload 语义。

## 目标与成功标准

- [ ] **G01：外部项目可用一条命令装机并正常渲染** — 在一个仅有 Vue 3.5 + Tailwind v4 的空项目里执行 `p0seid0n add button card dialog`，`pnpm dev` 后组件可见，深浅色与令牌一致。
  - 计划验证：在仓库外的临时 Vite 项目执行安装与 dev server 启动，人工观察两个断点与两种配色方案。
  - 验证证据：未执行。

- [ ] **G02：视觉母题被完整继承且可被使用者覆盖** — 令牌值来自参考站点，组件 class 只引用语义名；修改 `--p0seid0n-*` 后组件外观随之变化。
  - 计划验证：文档站令牌页修改一个令牌值，观察受影响组件的即时变化。
  - 验证证据：未执行。

- [ ] **G03：registry 产物符合上游 schema 且能被上游 CLI 消费** — `apps/docs/public/r/*.json` 满足 `https://shadcn-vue.com/schema/registry-item.json` 的约束，`npx shadcn-vue@latest add <本地 URL>` 能成功写入文件并解析 `registryDependencies`。
  - 计划验证：本地起静态服务，用上游 CLI 安装 button 与 dialog（含跨 item 依赖）。
  - 验证证据：未执行。

- [ ] **G04：文档站构建即是分发链路门禁** — `apps/docs/src/components/ui/`、`apps/docs/src/lib/utils.ts`、`apps/docs/src/styles/p0seid0n.css` 均为安装产物且不被提交；清空后重跑安装脚本能完整还原。
  - 计划验证：删除三个生成路径后执行 `pnpm ui:install`，再 `pnpm docs:build` 成功。
  - 验证证据：未执行。

- [ ] **G05：CLI 可发布** — `pnpm pack` 产物在临时项目里通过 `npx` 安装可用。
  - 计划验证：安装 tarball 后执行 `p0seid0n init` 与 `p0seid0n add badge`。
  - 验证证据：未执行。

## 范围

### 包含

- pnpm workspace 骨架：根级 `registry/`、`scripts/`、`packages/`，以及 `apps/docs/`
- 令牌层：`--p0seid0n-*` 变量、`@theme inline` Tailwind 桥接、可选 shadcn 语义别名
- registry 清单与构建脚本，输出 `registry.json`、`index.json`、`all.json` 与逐 item JSON
- 15 个组件（文档站 14 页，label 与 input 合页）：button、input、label、badge、separator、card、switch、dropdown-menu、tooltip、dialog、tabs、toast、stat、sparkline、theme-switcher
- 配套工具组件 theme-provider，与 theme-switcher 同批交付，在指南页而非独立组件页记录
- registry item 总数 18：上述 16 个组件与工具 item，加上 002 的 `theme` 与 `utils`
- VitePress 文档站：安装说明、令牌页、逐组件页（实时示例 + 源码）
- `p0seid0n` CLI：`init`、`add`，含跨 item 依赖解析、别名替换、包管理器探测
- Cloudflare Pages 部署配置（同时提供文档站与 `/r/*.json`）

### 非目标

- Nuxt 模块、Vite 插件、任何运行时 npm 组件包
- JavaScript 产物（仅 TypeScript，SFC 统一 `<script setup lang="ts">`）
- 暗色之外的额外主题（品牌色套装、高对比度主题）
- 图表库依赖（sparkline 为手写 SVG）
- 文档站之外的示例应用
- 组件单元测试套件、视觉回归测试
- 与上游 shadcn-vue registry 的双向同步
- i18n 与 RTL 专项优化
- 图标库绑定（组件只接收 slot，不自带图标依赖）

## 当前状态与依据

| 发现 | 依据 | 对规划的影响 |
| --- | --- | --- |
| 项目根目录曾为空目录，非 git 仓库 | `ls -la /root/github/0cean` 当时仅有 `.` 与 `..`；001 实施时经用户授权已执行 `git init` | 001 的全部文件为新建；后续阶段的完工提交可直接进行 |
| Git 身份已配置 | `git config --get user.name` 返回 `TnZzZHlp`，邮箱 `98214647+TnZzZHlp@users.noreply.github.com` | 只需 `git init`，无需配置身份 |
| Node 25.9.0、pnpm 12.8.1 可用 | `node -v`、`pnpm -v` | 可直接用 Node 原生 TypeScript 类型剥离运行构建脚本 |
| 参考站点令牌与断点 | 上游 `SukkaW/speed.skk.moe` 的 `src/styles/tokens.stylex.ts`、`src/styles/breakpoints.stylex.ts`（本仓库内无 `speed-ref/` 副本，经 `raw.githubusercontent.com` 读取） | 令牌值可逐字继承，断点为 639/1024，等价于 Tailwind 默认 `sm` 640 与 `lg` 1024 |
| 参考站点深浅色机制 | 上游 `src/styles/globals.css` | 采用 `color-scheme` + `light-dark()`，不使用 `dark:` 变体 |
| 参考站点 popup 形制 | 上游 `src/styles/menu.stylex.ts` | 菜单：min-width 160、padding 6、radius 16、内描边 line、shadow `0 12px 32px -8px` |
| 参考站点按钮与数字形制 | 上游 `src/app/components/start-button.tsx`、`stat-value.tsx`、`speed-readout.tsx` | 按钮 min-height 44 + radius 12 + 内嵌进度层；数字用 condensed + `tabular-nums` + `letter-spacing: -0.01em` |
| registry-item schema 字段 | `https://shadcn-vue.com/schema/registry-item.json` | item 支持 `dependencies`、`registryDependencies`、`files[].target`、`css`、`cssVars`、`docs` |
| 文档站无法直连参考站点 | `curl https://speed.skk.moe` 返回 403（Cloudflare 验证） | 视觉依据来自开源源码而非线上页面；本仓库不含 `speed-ref/` 副本，源码经 `raw.githubusercontent.com` 从上游读取 |

## 约束

- 命名统一为 `p0seid0n`：registry name `p0seid0n`、CSS 变量前缀 `--p0seid0n-*`、npm 包 `p0seid0n`、CLI 命令 `p0seid0n`、Tailwind 主题命名空间 `--color-*` / `--radius-*` / `--font-*` / `--shadow-*`
- 品牌词写为 `P0seid0n`（仅用于文档标题与页面文字）；所有标识符按原样小写 `p0seid0n`，因为 npm 包名不允许大写，且 CSS 变量、目录名与文件路径大小写敏感
- 运行基线 Vue 3.5+，仅 TypeScript
- 样式底座 Tailwind v4；variant 用 `class-variance-authority`；类名合并用 `clsx` + `tailwind-merge`
- 无头层 reka-ui
- 组件 class 只写语义工具类（`bg-raised`、`text-ink-muted`、`ring-line`），十六进制色值只允许出现在令牌定义文件
- 字体不随库分发：只声明 `--font-sans` / `--font-condensed` 与回退栈；文档站自行引入 `@fontsource`
- 未使用 `dark:` 变体：深浅色由 `color-scheme` 与 `light-dark()` 决定
- 全部文本不含 emoji

## 架构

### 职责边界

| 模块 | 职责 | 所有状态或契约 |
| --- | --- | --- |
| `registry/` | 组件与令牌的唯一源码 | `registry.json` 是唯一清单，源码只在这里编辑 |
| `registry/styles/` | 令牌与桥接 CSS | 唯一允许出现色值的目录 |
| `scripts/build-registry/` | 清单 + 源码 -> registry-item JSON | 输出契约：上游 schema；不解析 Vue SFC |
| `apps/docs/` | 展示与自证 | 只消费安装产物，不手写组件 |
| `packages/cli/` | 安装器 | 契约：上游 `components.json` 语义子集 |

### 拟议目录结构

```text
p0seid0n/
├── package.json                 私有根包，workspace 与脚本入口
├── pnpm-workspace.yaml          apps/* 与 packages/*
├── tsconfig.base.json
├── .gitignore                   忽略 docs 安装产物与构建输出
├── registry/
│   ├── registry.json            创作期清单
│   ├── styles/
│   │   ├── p0seid0n.css            --p0seid0n-* 令牌 + @theme inline 桥接 + color-scheme
│   │   └── p0seid0n-shadcn.css     可选：shadcn 语义别名映射
│   ├── lib/
│   │   ├── utils.ts             cn()
│   │   └── theme.ts             主题读写与首屏脚本片段
│   └── ui/
│       ├── button/{Button.vue,index.ts}
│       ├── badge/…              共 14 组
│       └── theme-switcher/…
├── scripts/
│   └── build-registry/index.ts  清单内联 -> 分发 JSON
├── apps/docs/
│   ├── components.json          供 CLI 解析别名
│   ├── .vitepress/{config.ts,theme/}
│   ├── public/r/                构建产物（提交，因为它是发布物）
│   └── src/
│       ├── components/ui/       安装产物，gitignore
│       ├── lib/utils.ts         安装产物，gitignore
│       ├── styles/p0seid0n.css     安装产物，gitignore
│       └── pages/               指南与组件页
└── packages/cli/
    ├── package.json             name: p0seid0n, bin: p0seid0n
    └── src/{index.ts,add.ts,init.ts,resolve.ts,fs.ts}
```

`apps/docs/public/r/` 是发布物，需要提交；`apps/docs/src` 下的三个安装产物路径被忽略。

### 接口与数据流

```text
registry/registry.json + registry/ui/** + registry/lib/**
        │  scripts/build-registry
        ▼
apps/docs/public/r/{name}.json  单个 item，files[].content 已内联
apps/docs/public/r/registry.json  全部 item 的清单（供跨 item 依赖解析）
apps/docs/public/r/index.json    仅 name/type/title 列表
apps/docs/public/r/all.json      合并单 item 的安装载荷
        │  静态托管于 https://<host>/r/
        ▼
npx shadcn-vue@latest add https://<host>/r/button.json   上游 CLI
p0seid0n add button                                         自有 CLI
        │
        ▼
使用者项目 components/ui/** 与 lib/utils.ts 与 styles/p0seid0n.css
```

故障行为：构建脚本遇到缺失文件、缺字段、未知 `type` 或非法 `target` 时立刻非零退出并打印该 item 名；CLI 遇到目标文件已存在时默认不覆盖并提示 `--overwrite`，遇到缺 `components.json` 时提示先执行 `p0seid0n init`，网络失败不做静默重试。

### 运行要求

- 构建：`pnpm build:registry` 幂等，重复执行不产生差异
- 文档站构建前必须先安装 UI 产物，CI 与本地同一条命令
- `/r/*.json` 需要 `Cache-Control: public, max-age=300` 以便改名后及时生效
- 无密钥、无环境变量要求；部署凭证只在部署任务时需要

## 决策

| 编号 | 决策 | 理由 | 替代方案与权衡 |
| --- | --- | --- | --- |
| D01 | Tailwind v4 + CSS 变量令牌 | 与 shadcn-vue registry 生态同构，使用者可用工具类微调 | 纯 CSS 需自建全部工具类；UnoCSS 需自建 preset |
| D02 | 自有 registry（shadcn 兼容 schema）+ 自有 CLI，分两阶段 | 先证明「拷源码进项目」链路，再替换工具 | 只复用上游 CLI 无法控制别名与错误体验；直接自建 CLI 则风险前置 |
| D03 | reka-ui 作为无头层 | 可访问性成本外移，dependencies 与生态一致 | 自研开关与菜单需承担键盘与焦点管理 |
| D04 | `--p0seid0n-*` 语义命名 + 可选 shadcn 别名 | 保留三级文字与双强调色 | 纯 shadcn 命名会丢失层级；双轨全量发布需长期同步 |
| D05 | `light-dark()` 内联双值 + `.light`/`.dark` 类覆盖 | 每个令牌只写一次，不会漏写暗色 | `.dark` 变量块令牌数量翻倍且可漏写 |
| D06 | 通用 variant 集，不复制产品语汇 | 库需可复用 | 严格保真会让组件无法用于非测速场景 |
| D07 | 文档站只消费安装产物 | 构建即成为链路门禁 | alias 直引源码会让链路无人验证 |
| D08 | 16 个组件 item（文档站 14 页）覆盖底层控件、覆盖层、两个展示件与主题切换 | 足以证明风格可落地 | 20-30 个组件会把维护面一次摊开 |
| D09 | 令牌保留 `download`/`upload` 双色，`@theme` 同时暴露通用 `accent`/`accent-alt` 指向它们 | 组件写通用名，母题色值不丢 | 只留通用名会丢失来自参考站点的可追溯性 |
| D10 | 主题以 CSS 文件形式投递（`registry:file` + `target`），使用者加一行 `@import` | 无需解析 CSS 或拼装 `cssVars`，跨 tailwind 版本稳定 | 比自动合并进主 CSS 多一步手工导入 |
| D11 | CLI 排在最后，且只依赖 registry 产物格式，可与组件阶段并行 | 避免 CLI 反过来改动 registry 格式 | 串行执行周期更长 |
| D12 | 构建脚本自校验结构，不引入 ajv | 少一个依赖；真实兼容性由上游 CLI 安装验证 | 完整 schema 校验会在错误结构上更早失败 |

## 已接受的假设

| 编号 | 假设 | 如果错误的影响 | 用户接受依据 |
| --- | --- | --- | --- |
| A01 | npm 包名 `p0seid0n` 当前可用 | 需改为带 scope 的包名并使 CLI 命令与包名解耦，影响 007 的 T01 与发布脚本；registry name 与 CSS 前缀不受影响 | 已核实：`npm view p0seid0n` 无记录，`p0seid0n-ui`、`psdn`、`@p0seid0n/ui` 同样空闲；原 `ocean` 已被占用（0.0.1pre），本次改名即为此风险的解决方案 |
| A02 | 部署平台账号与域名在实施阶段可用 | 006 的部署任务阻塞，但不影响本地构建、安装与验收 | 用户选择 Cloudflare Pages / Vercel 同时托管文档站与 registry |
| A03 | Node 原生 TypeScript 类型剥离足以运行构建脚本 | 需退回 `tsx` 作为 devDependency | 本机 Node 25.9.0 支持该能力 |

## 子计划

| 编号 | 子计划 | 目标与交付物 | 依赖 | 验收边界 | 实施状态 |
| --- | --- | --- | --- | --- | --- |
| 001 | [workspace 与令牌层](subplans/001-workspace-and-tokens.md) | 仓库骨架、`--p0seid0n-*` 令牌、`@theme inline` 桥接、shadcn 别名、构建工具基线 | 无 | Tailwind 编译后能产出 `bg-raised` 与 `text-ink-muted` 等工具类 | 已完成 |
| 002 | [registry 流水线](subplans/002-registry-pipeline.md) | `registry.json`、`build-registry`、`/r/*.json` 产物、结构校验 | 001 | 产物通过结构校验，且 `r/registry.json` 可解析跨 item 依赖 | 已完成 |
| 003 | [基础控件](subplans/003-core-controls.md) | button、badge、separator、card、input、label、switch（`utils` 已由 002 交付） | 001、002 | 七个 item 可被单独安装并渲染 | 已完成 |
| 004 | [覆盖层与导航](subplans/004-overlays-and-nav.md) | dropdown-menu、tooltip、dialog、tabs、toast | 003 | 键盘可达、焦点可回收，Esc 与外部点击行为正确 | 已完成 |
| 005 | [数据展示](subplans/005-data-display.md) | 4 个展示 item：stat、sparkline、theme-provider、theme-switcher | 003（T04 另需 004 的 dropdown-menu） | 四个 item 均已验收，theme-switcher 的跨 item 依赖已验证 | 已完成 |
| 006 | [文档站](subplans/006-docs-site.md) | VitePress、安装脚本、令牌页、逐组件页、部署配置 | 002、004、005 | 从零 clone 后两条命令可构建出完整站点 | 已完成（AC07 待部署复验） |
| 007 | [CLI](subplans/007-cli.md) | `p0seid0n init`、`p0seid0n add`、依赖解析、别名替换、发布配置 | 002 | tarball 装进空项目后 `init` + `add` 成功 | 未开始 |

### 执行顺序

001 -> 002 -> 003 -> 004、005 并行 -> 006 -> 007。

007 只依赖 002 的产物格式，可与 003 至 006 并行开展；但 007 的最终验收要求 006 的站点能提供 `/r/*.json`，因此并行时以本地文件路径作为 registry 来源完成 T01 至 T04，T05 的发布验收放在 006 之后。

## 验证策略

| 标准 | 计划检查 | 环境或前置条件 | 状态 |
| --- | --- | --- | --- |
| G01 | 临时 Vite 项目中 `npx p0seid0n add button card dialog`，启动 dev server 观察 | 007 已可发布、网络可用 | 未执行 |
| G02 | 文档站令牌页修改一个 `--p0seid0n-*` 值，观察组件变化 | 006 完成 | 未执行 |
| G03 | 本地静态服务 + `npx shadcn-vue@latest add http://localhost:<port>/r/dialog.json` | 002 产物存在、网络可用 | 未执行 |
| G04 | 删除生成路径后 `pnpm ui:install && pnpm docs:build` | 006 完成 | 未执行 |
| G05 | `pnpm pack` 后在临时项目 `npm i <tarball>`，执行 `p0seid0n init` 与 `p0seid0n add badge` | 007 完成 | 未执行 |

计划中的命令均未执行。仓库尚无 `package.json`，脚本名以本计划的约定为准，实施时以实际写入的脚本为准。

## 风险

| 风险 | 影响 | 缓解措施 | 受影响阶段 |
| --- | --- | --- | --- |
| `light-dark()` 在旧版浏览器缺失 | 暗色失效或颜色不生效 | 令牌页标注基线浏览器；在文档站实测而非假设 | 001、006 |
| 上游 CLI 解析不到跨 item 依赖 | 安装 button 时缺 utils 或令牌 | 额外产出 `r/registry.json` 作为 manifest；用上游 CLI 真实验收 | 002、006 |
| 文档站「只留安装产物」拖慢迭代 | 每次改组件需重跑安装 | 安装脚本幂等且一条命令；产物路径 gitignore 以避免手改 | 006 |
| npm 包名 `p0seid0n` 被占用 | 无法按计划发布 | 见 Q02（当前已核实空闲，风险仅在发布前被他人抢占） | 007 |
| CLI 与上游 `components.json` 语义漂移 | 文件写到错误位置 | 只实现 `aliases`、`tailwind.css`、`style` 三个字段的语义 | 007 |
| sparkline 手写 SVG 边界情况多 | 数据异常时渲染错乱 | 契约限定为 `number[]` 与可选 `max`，空数组与单点必须有确定表现 | 005 |
| 仓库未初始化 git | 无法创建阶段完成提交 | 001 前置条件中要求用户授权 `git init` | 001 |

## 已接受的延期问题

| 编号 | 延期问题 | 已接受的影响 | 解决步骤 | 必须在何时解决 |
| --- | --- | --- | --- | --- |
| Q01 | 是否提供 `p0seid0n add all` 一次性安装全部 item | v1 使用者需按名安装；item 数量增长后体验变差 | 在 007-T03 实现 `add` 时评估：若依赖解析已能批量处理，则加 `all` 作为 `add` 的别名展开 | 007-T03 开始前 |
| Q02 | npm 包名 `p0seid0n` 若已被占用，改用哪个名字 | 影响 007-T01 的包名、bin 与发布脚本；不影响 registry name 与 CSS 前缀 | 已核实空闲。发布前在 007-T01 用 `npm view p0seid0n name` 复核；若届时被抢占，改用 `@p0seid0n/ui` 并保持 bin 为 `p0seid0n` | 007-T01 开始前 |
| Q03 | 文档站具体域名 | 部署地址与 registry 默认地址继续使用占位值 | 用户决定 006 阶段保留占位；真实域名在 007 发布前回填 registry `homepage` 与 CLI 默认 registry 地址 | 007 发布前 |

## 实施进度与提交

- 在获得单独实施授权后，任务完成且验证通过时必须勾选对应子计划中的任务和验收复选框，并同步此处的阶段状态。只有完整结果验证通过后才勾选总计划成功标准复选框，并记录实际证据。
- 一个完成的子计划必须勾选全部任务和验收项。失败、跳过、阻塞或未执行的检查会阻止子计划完成。
- 每个子计划的实施变更和已验证的计划进度必须在一个独立的完成提交中提交，然后才能开始下一个依赖它的子计划。不要把多个完成的子计划合并为一次提交。
- 检查工作区和暂存区变更；只为该子计划暂存已审阅的路径或代码块。保留无关修改和预先存在的暂存工作。如果无法安全分离，暂停并请求指导。
- 遵循仓库提交约定；否则使用 `feat(p0seid0n-vue-ui): complete subplan <NNN> - <phase-name>`。在交接中报告已验证的提交哈希，不要在本文档中编造哈希。
- 提交失败时，阶段关闭仍处于等待提交状态。缺少 Git、仓库或身份信息、钩子失败或变更已提交时请求用户指导；不要自动初始化 Git、修改身份、绕过钩子、改写历史、推送或创建空提交。
- 计划生成和仅更新计划不会创建这些完成提交。

## 交接

第一个阶段是 001。它有两个前置条件：用户授权在 `/root/github/0cean` 执行 `git init`（本计划不自动执行），以及确认 pnpm 为唯一包管理器。001 完成后，002 才能建立清单与产物。

生成本计划不启动任何实施工作。
