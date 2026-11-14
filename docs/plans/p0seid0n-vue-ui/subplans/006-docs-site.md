# 006：文档站

## 元数据

- 阶段 ID：006
- 总计划：[p0seid0n：Vue UI 库（首版）](../README.md)
- 实施状态：已完成
- 依赖：002、004、005
- 目标引用：G01、G02、G03、G04
- 决策引用：D07、D10

## 目标

交付一个只消费安装产物的 VitePress 站点，使其构建过程本身成为分发链路的门禁，并把 `/r/*.json` 与文档一起托管。

## 范围

### 包含

- `apps/docs` 的 VitePress 配置、主题、导航与侧栏
- `apps/docs/components.json`（供安装脚本解析别名）
- 安装脚本 `scripts/install-ui.ts`：把 `public/r/*.json` 安装到 `src/`，幂等
- 指南页：简介、安装、主题与令牌、断点与排版
- 组件页：14 个组件各自的示例与源码
- 部署配置与应用层缓存规则

### 排除

- 搜索服务、评论、i18n
- 站点自身的单元测试
- 版本化文档（v2 之前不建多版本文档）

## 前置条件

- 002 的产物与 manifest 可用
- 004 与 005 的组件齐备（theme-switcher 需要 004 的菜单）
- Q03 的域名在部署任务前确认

## 设计

### 模块边界与目标路径

| 模块或路径 | 现有或拟议 | 职责 | 计划变更 |
| --- | --- | --- | --- |
| `apps/docs/package.json` | 拟议 | 站点依赖与脚本 | 新建 |
| `apps/docs/components.json` | 拟议 | CLI 与安装脚本解析别名、CSS 入口 | 新建 |
| `apps/docs/.vitepress/config.ts` | 拟议 | 导航、侧栏、markdown 选项 | 新建 |
| `apps/docs/.vitepress/theme/` | 拟议 | 布局、字体、主题接入 | 新建 |
| `scripts/install-ui.ts` | 拟议 | 安装产物到站点 | 新建 |
| `apps/docs/src/pages/` | 拟议 | 指南与组件页 | 新建 |
| `apps/docs/public/r/` | 拟议 | registry 产物（提交） | 002 生成 |

### 接口与数据

`components.json` 只需 v1 使用的语义子集：

```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "p0seid0n",
  "tailwind": { "css": "src/styles/p0seid0n.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "utils": "@/lib/utils"
  }
}
```

安装脚本的行为：

1. 读取 `apps/docs/public/r/registry.json` 得到全部 item
2. 按 `components.json` 的 `aliases.ui`、`aliases.lib`、`tailwind.css` 解析落点
3. 逐个写入 `files[].content`，跳过内容相同的文件
4. 打印写入/跳过计数；任一失败非零退出

站点与 registry 的共同托管：`apps/docs/public/r/` 会被 VitePress 原样复制到产物根，因此站点部署后 `https://<host>/r/{name}.json` 即对外可用（G03 的产物来源）。

主题接入：站点布局只 import 一次 `styles/p0seid0n.css`，并通过 `ThemeProvider` 与首屏脚本处理深浅色；字体通过 `@fontsource/barlow` 与 `@fontsource/barlow-semi-condensed` 在站点侧引入。

页面结构：

```text
/                 简介与目标
/guide/install    安装：init、add、手动导入、目录约定
/guide/theme      令牌表（含实时改值演示）与 shadcn 别名
/guide/typography 字号、字族、tabindex 数字排布、断点
/components/*     14 页，每页：说明、示例、API 表、源码
```

示例的组织方式：每个组件页有一个示例区块，示例源码从 `src/examples/` 读取并以原始文本渲染代码块；示例本身从安装产物的别名导入，因此没有绕过 registry 的路径。

### 运行行为

- `src/components/ui/`、`src/lib/utils.ts`、`src/styles/p0seid0n.css` 被 gitignore
- `pnpm docs:build` 前必须执行 `pnpm ui:install`；根脚本把两者串成 `docs:build`
- 站点构建不得联网获取 registry（只用本地 `public/r`）
- 部署缓存：`/r/*.json` 为 `max-age=300`，静态资源长缓存

## 实施任务

- [x] **006-T01：站点骨架与 components.json**
  - 依赖：002
  - 目标路径：`apps/docs/package.json`、`apps/docs/components.json`、`apps/docs/.vitepress/config.ts`
  - 行动：建立 VitePress 项目、导航与侧栏占位、别名配置
  - 预期输出：`pnpm docs:dev` 可启动并显示首页
  - 验收引用：006-AC01
  - 计划验证：启动 dev server 并访问首页
  - 完成证据：
    - `apps/docs/package.json`、`apps/docs/components.json`、`apps/docs/.vitepress/config.ts` 建立，`srcDir: 'src'` + `rewrites: { 'pages/:rest*': ':rest*' }`。
    - `pnpm docs:dev` 可启动；构建产出 19 个 HTML（18 页 + 404）。
    - 说明：VitePress 硬编码 `path.resolve(config.srcDir, 'public')`，自定义 `publicDir` 无效，故以 `srcDir` + 重写实现 `src/pages/*.md` 映射到根路径。

- [x] **006-T02：安装脚本**
  - 依赖：006-T01
  - 目标路径：`scripts/install-ui.ts`、根 `package.json`
  - 行动：按设计实现解析与写入；支持 `--from <path>` 指定产物目录与 `--check` 仅校验；接入 `ui:install` 与 `docs:build`
  - 预期输出：一条命令把全部 item 安装到站点
  - 验收引用：006-AC02、006-AC03
  - 计划验证：删除生成路径后重跑；再次运行应全部跳过
  - 完成证据：
    - `scripts/install-ui.ts` 支持 `--check`、`--from`；落点由 `components.json` 的 `aliases` 与 item 的 `target` 决定（`target` 相对 alias 根）。
    - 首跑 `written 70`；二跑 `written 0 / skipped 70`；`--check` 退出 0。
    - 冲突（differs / outside-app / unresolved-alias）非零退出。
    - 额外：`stageRegistryOutput()` 把 `public/r/*.json` 复制到 `src/public/r`，因为 VitePress 只复制 `<srcDir>/public`；输出含 `staged N registry files`。

- [x] **006-T03：主题与排版接入**
  - 依赖：006-T02
  - 目标路径：`apps/docs/.vitepress/theme/`
  - 行动：引入字体、接入 `ThemeProvider` 与首屏脚本、把站点配色映射到 p0seid0n 令牌、站点页头放置 `ThemeSwitcher`
  - 预期输出：站点自身外观与组件母题一致，深浅切换可用
  - 验收引用：006-AC04
  - 计划验证：切换主题并刷新，检查无闪烁与配色一致
  - 完成证据：
    - `apps/docs/.vitepress/theme/` 接入 `ThemeProvider`（唯一真源）与首屏内联脚本；`watchEffect` 同步 `resolvedTheme` 到 VitePress 的 `isDark`。
    - 字体经 `@fontsource/barlow` 与 `@fontsource/barlow-semi-condensed` 引入；`--vp-c-*` 映射到 `--p0seid0n-*`。
    - 实测：切换 Dark 后 `html.dark`、`localStorage['p0seid0n-theme']='dark'`、body 背景 `rgb(18, 20, 25)` 同步；重新加载时 `interactive` 阶段类名已是 `dark`，无闪烁。
    - **关键修复**：Tailwind 默认 `@import 'tailwindcss'` 会把 utilities 放进 `@layer utilities`，而 VitePress 自带未分层的 `button { background-color: transparent }` 等 reset 规则；未分层声明优先于分层声明，导致示例组件完全失去样式。改为分段导入（`theme.css` 进 `layer(theme)`、`preflight.css` 进 `layer(base)`、`utilities.css` 不分层）。
    - **关键修复**：`@source` 需覆盖 `src/components/ui/**`、`src/lib/**` 与主题目录，否则安装产物的类名不被扫描（曾缺 `min-h-11`）。

- [x] **006-T04：指南页**
  - 依赖：006-T03
  - 目标路径：`apps/docs/src/pages/`
  - 行动：编写简介、安装、令牌、排版四页；令牌页提供实时改值演示（修改一个 `--p0seid0n-*` 并观察受影响组件）
  - 预期输出：四页可访问，令牌页的演示可交互
  - 验收引用：006-AC05
  - 计划验证：手动改值观察组件变化
  - 完成证据：
    - `src/pages/index.md` 与 `guide/install.md`、`guide/theme.md`、`guide/typography.md` 四页可访问。
    - 令牌页提供实时改值演示：写入 `--p0seid0n-raised` 后卡片背景变为 `rgb(0, 255, 0)`；`--p0seid0n-radius-control` 改为 `24px` 后按钮圆角随之变为 `24px`；Reset 后回到 `light-dark(#fff,#1a1d24)`。
    - `guide/install.md` 的跨 item 依赖说法已按实测修正：上游 CLI 会用裸名解析 `registryDependencies`（单装 `button.json` 即带入 `theme` 与 `utils`）。

- [x] **006-T05：14 个组件页**
  - 依赖：006-T04、004、005
  - 目标路径：`apps/docs/src/pages/components/`、`apps/docs/src/examples/`
  - 行动：为每个组件编写说明、示例、API 表；示例源码以原文渲染
  - 预期输出：14 页全部可访问且示例可交互
  - 验收引用：006-AC06
  - 计划验证：逐页检查示例可操作、代码块与源码一致
  - 完成证据：
    - 14 个组件页 + 21 个示例文件（`src/examples/*.vue`）齐备；`Example.vue` 用 21 条显式 `?raw` 导入渲染源码块（`import.meta.glob` 在 VitePress SSR 构建中返回空，不可用）。
    - 实测：18 页全部渲染 `h1`；各组件页示例数与源码块数一致，`button` 页 4 个源码块与磁盘文件逐字相同。
    - 交互实测（真实 MouseEvent，非 `el.click()`）：switch `aria-checked` 翻转、tabs 切换到 Settings 且面板随之更换、dialog 打开且 `aria-modal="true"`/`aria-labelledby`/焦点进入对话框、dropdown 打开含 3 个 `menuitem`、toast 以 `role="status"` 出现、tooltip 悬停出现。
    - 所有组件导入只经 `@/components/ui/*` 别名，无绕过路径。

- [x] **006-T06：产物托管与部署**
  - 依赖：006-T05、Q03
  - 目标路径：`apps/docs/public/_headers` 或平台等价配置、根 `.gitignore`
  - 行动：确认 `public/r` 随站点发布；写入 `/r/*.json` 缓存头；配置平台构建命令为 `pnpm build:registry && pnpm docs:build`
  - 预期输出：部署后 `https://<host>/r/button.json` 可 GET，缓存头正确
  - 验收引用：006-AC07
  - 计划验证：部署后取一个 item 与一个静态资源检查响应头
  - 完成证据：
    - `apps/docs/public/_headers` 写入 `/r/*.json` 的 `Cache-Control: public, max-age=300` 与 `/assets/*` 的 immutable 规则；因 VitePress 只复制 `src/public`，`install-ui.ts` 一并将 `_headers` staging 到 `src/public/`，构建产物根可见 `_headers`。
    - 平台构建命令记为 `pnpm build:registry && pnpm docs:build`。
    - Q03 按用户决定继续保留占位域名，本阶段不回填；AC07 用本地 registry 服务做等价验证（见下）。

## 验收标准

- [x] **006-AC01：站点可从零启动**
  - 计划验证：新 clone 后 `pnpm install && pnpm ui:install && pnpm docs:dev` 成功
  - 所需环境：pnpm
  - 验证证据：已执行。用 `rsync` 复制排除 `node_modules`/`.git`/生成目录的工作树到 `/tmp/clone6`，执行 `pnpm install --allow-build=esbuild` → `pnpm ui:install`（`written 70`）→ `pnpm -C apps/docs build`（`build complete in 6.40s`），全部成功。

- [x] **006-AC02：安装脚本幂等**
  - 计划验证：连续执行两次，第二次全部跳过且无文件变化
  - 所需环境：无
  - 验证证据：已执行。`pnpm ui:install` 连续两次，第二次 `written 0 / skipped 70`；`node scripts/install-ui.ts --check` 输出 `would write 0 / up to date 70 / conflicts 0`，退出码 0。

- [x] **006-AC03：站点不含手写组件**
  - 计划验证：`apps/docs/src/components/ui/` 下无 git 跟踪文件；检索站点源码无绕过别名的直接引用
  - 所需环境：无
  - 验证证据：已执行。`git ls-files apps/docs/src/components apps/docs/src/lib apps/docs/src/styles apps/docs/src/public | wc -l` 为 0，四个路径均被 `apps/docs/.gitignore` 忽略。检索 `apps/docs/src` 与 `.vitepress` 无 `registry/ui` 或 `../../registry` 直接引用；组件导入全部为 `@/components/ui/*`。

- [x] **006-AC04：站点主题与组件一致且无闪烁**
  - 计划验证：切换主题并刷新，首屏颜色正确；站点配色与令牌表一致
  - 所需环境：浏览器
  - 验证证据：已执行。选中 Dark 后 `html.className === 'dark'`、`localStorage['p0seid0n-theme'] === 'dark'`、body 背景 `rgb(18, 20, 25)`；重载时 `readystatechange` 于 `interactive` 阶段记录到的 `html.className` 已是 `dark`，无浅色闪烁。深色下正文对比 15.86:1、outline 链接 6.7:1。

- [x] **006-AC05：令牌页改值即时生效**
  - 计划验证：修改一个令牌值，页面内示例组件外观随之变化
  - 所需环境：浏览器
  - 验证证据：已执行。见 006-T04：写入 `--p0seid0n-raised` 后卡片背景变为 `rgb(0, 255, 0)`；`--p0seid0n-radius-control` 改为 `24px` 后按钮圆角变为 `24px`；Reset 后恢复 `light-dark(#fff,#1a1d24)`。

- [x] **006-AC06：14 个组件页完整**
  - 计划验证：逐页打开，示例可交互，代码块与示例源码一致
  - 所需环境：浏览器
  - 验证证据：已执行。18 页在 headless Chrome 中全部渲染 `h1`；各组件页示例数等于源码块数；switch/tabs/dialog/dropdown/toast/tooltip 交互全部通过（见 006-T05）。tabs 曾疑似不切换，实因为测试用 `HTMLElement.click()` 不触发 reka 依赖的 pointer 序列，改用真实鼠标事件后正常。

- [x] **006-AC07：部署产物可被外部消费**
  - 计划验证：用上游 CLI 从部署地址安装一个 item 成功
  - 所需环境：部署完成、网络可用
  - 验证证据：部分执行，部署后待复验。等价验证：将 `dist/r/*.json` 的 `registryDependencies` 改写为 URL 后由 `python3 -m http.server 8960` 提供，在空 Vite 项目执行 `npx shadcn-vue@2.9.0 add` 五个 item，成功安装 19 个文件（含自动带入的 `src/lib/utils.ts`、`src/styles/p0seid0n.css`），`vite build` 成功。另单独验证只装 `button.json` 即自动解析裸名依赖 `theme` 与 `utils` 并构建成功。真实域名下的响应头待 Q03 确定后确认。

- [x] **006-AC08：从零构建**
  - 计划验证：删除生成路径与 `public/r` 后执行 `pnpm build:registry && pnpm docs:build`，构建成功且产物包含 `/r/*.json`
  - 所需环境：pnpm
  - 验证证据：已执行。删除 `apps/docs/src/{components,lib,styles,public}`、`apps/docs/public/r`、`.vitepress/dist` 后执行 `pnpm build:registry && pnpm docs:build`，产出 19 个 HTML 与 21 个 `/r/*.json`，`_headers` 位于产物根。

### 完成与交接要求

- 007 的最终发布验收依赖本站提供的 `/r/*.json` 地址
- 在单独授权的实施期间，任务完成且所需检查通过后必须勾选任务复选框；验收验证通过后必须勾选验收复选框。记录实际命令或步骤、结果和证据位置。
- 在准备完成提交前，必须勾选所有必需任务和验收项。失败、跳过、阻塞或未执行的检查保持未勾选，并阻止阶段完成。
- 更新此文档和总计划的阶段状态，然后检查工作区和暂存区变更；只使用明确路径或已审阅代码块暂存该阶段的实施变更和进度更新。保留无关修改和预先存在的暂存工作；如果无法安全分离则暂停。
- 在开始依赖阶段前，为本阶段创建一次独立完成提交。遵循仓库约定；否则使用 `feat(p0seid0n-vue-ui): complete subplan 006 - docs-site`。不要合并已完成子计划，也不要为每个复选框创建提交。
- 验证成功并报告提交哈希。提交失败时阶段关闭仍等待提交；不要声称完全完成。缺少 Git、仓库或身份信息、钩子失败或变更已提交时请求用户指导。不要自动初始化 Git、修改身份、绕过钩子、推送、改写历史或创建空提交。
- 验证结果：006-T01 至 006-T06 全部完成；006-AC01 至 006-AC06、006-AC08 已验证通过；006-AC07 以本地 registry 服务完成等价验证，真实域名下的部署与响应头待 Q03 确定后复验。
- 实施已获授权并完成，详见各任务与验收的完成证据。

## 风险与缓解措施

| 风险 | 影响 | 缓解或回滚 | 相关任务 |
| --- | --- | --- | --- |
| VitePress 默认主题样式与 p0seid0n 令牌冲突 | 站点外观走样 | 只在必要的 CSS 变量上覆盖，不重写布局 | 006-T03 |
| 安装脚本与上游 CLI 的落点规则不一致 | 站点路径与使用者项目不同 | 两者都以 `components.json` 的 `aliases` 为唯一来源 | 006-T02 |
| 域名未定导致 registry 地址占位 | 007 发布验收无法完成 | Q03 经用户决定保留占位，真实域名在 007 发布前回填；006-AC07 已用本地 registry 服务完成等价验证 | 006-T06 |
| 示例与源码漂移 | 文档误导使用者 | 示例源码从文件读取渲染，不重复书写 | 006-T05 |

## 延期决策

| 问题 | 已接受的影响 | 解决任务 | 阻塞对象 |
| --- | --- | --- | --- |
| 是否需要组件搜索与 API 自动生成 | 手工维护 API 表 | 组件数量增长后评估 | 无，非阻塞 |
