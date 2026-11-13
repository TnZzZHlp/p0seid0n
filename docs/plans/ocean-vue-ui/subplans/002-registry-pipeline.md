# 002：registry 流水线

## 元数据

- 阶段 ID：002
- 总计划：[ocean：Vue UI 库（首版）](../README.md)
- 实施状态：未开始
- 依赖：001
- 目标引用：G03、G04
- 决策引用：D02、D10、D12

## 目标

把 `registry/` 下的清单与源码转成静态可分发的 registry-item JSON，产物既满足上游 schema，也能被自有 CLI 解析依赖图。

## 范围

### 包含

- `registry/registry.json`：创作期清单，含 `name`、`homepage`、`items`
- `scripts/build-registry/index.ts`：清单内联、文件内容读取、结构校验、输出
- 令牌与工具 item：`theme`（`registry:theme`）、`utils`（`registry:lib`）
- 输出四类产物与 `docs` 字段渲染
- 构建报告的终端输出

### 排除

- 组件 item 的具体内容（交给 003 至 005）
- 上传与托管（交给 006）
- CLI 实现（交给 007）

## 前置条件

- 001 完成：令牌 CSS 与 workspace 存在
- 确认 `registry.json` 的 `homepage` 使用占位域名，并在 006-T06 回填（Q03）

## 设计

### 模块边界与目标路径

| 模块或路径 | 现有或拟议 | 职责 | 计划变更 |
| --- | --- | --- | --- |
| `registry/registry.json` | 拟议 | 唯一清单与 item 元数据 | 新建 |
| `scripts/build-registry/index.ts` | 拟议 | 构建入口 | 新建 |
| `scripts/build-registry/validate.ts` | 拟议 | 结构校验（D12） | 新建 |
| `scripts/build-registry/manifest.ts` | 拟议 | 生成四类产物 | 新建 |
| `apps/docs/public/r/` | 拟议 | 构建产物目录 | 新建 |

### 接口与数据

清单 item 形态（与上游 `registry-item.json` 对齐，仅使用 v1 需要的字段）：

```json
{
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "…",
  "dependencies": ["class-variance-authority", "clsx", "tailwind-merge"],
  "registryDependencies": ["utils"],
  "files": [{ "path": "ui/button/Button.vue", "type": "registry:ui" }],
  "docs": "…"
}
```

非 `registry:ui` 的 item 使用 `type: registry:lib`/`registry:theme`/`registry:file`，并在需要指定落地路径时带 `files[].target`（D10）：

```json
{ "path": "lib/utils.ts", "type": "registry:lib", "target": "lib/utils.ts" }
{ "path": "styles/ocean.css", "type": "registry:file", "target": "styles/ocean.css" }
```

产物契约：

| 产物 | 内容 | 用途 |
| --- | --- | --- |
| `r/{name}.json` | 单个 item，`files[].content` 已内联为源码文本 | 上游 CLI 与自有 CLI 的直接安装来源 |
| `r/registry.json` | `{ name, homepage, items: [{ name, type, title }] }` | 跨 item 依赖解析所需的最小清单 |
| `r/index.json` | 仅 `name`/`type`/`title`/`description` 的平铺数组 | 文档站列表页与 CLI 搜索 |
| `r/all.json` | 合并全部 item 的载荷 | 全量安装（Q01 若启用则使用） |

构建行为：读取清单 -> 逐 item 解析 `files[].path`（相对 `registry/`）-> 读文件文本 -> 校验 -> 写出。任何缺失文件、未知 `type`、非法 `target`、缺 `name`/`type` 都非零退出并打印 item 名与字段名。重复执行不产生差异（保持稳定键序与固定缩进）。

### 运行行为

- 脚本零第三方依赖，使用 Node 原生 TypeScript 类型剥离运行（A03）；若不可用则回退 `tsx` 并记录在根 `devDependencies`
- 输出路径通过参数覆盖，默认 `apps/docs/public/r`
- 构建不联网

## 实施任务

- [ ] **002-T01：编写清单与两个基础 item**
  - 依赖：001
  - 目标路径：`registry/registry.json`
  - 行动：写入清单骨架与 `theme`、`utils` 两个 item；`theme` 的 `files` 指向 `styles/ocean.css`（`target` 为 `styles/ocean.css`），`utils` 指向 `lib/utils.ts`（`target` 为 `lib/utils.ts`）；同时写入 `registry/lib/utils.ts` 的 `cn()`
  - 预期输出：清单与两个源文件存在，`cn()` 由 `clsx` 与 `tailwind-merge` 组合
  - 验收引用：002-AC01、002-AC02
  - 计划验证：人工核对清单字段与上游 schema 的必填项
  - 完成证据：未完成；检查未执行。

- [ ] **002-T02：实现结构校验**
  - 依赖：002-T01
  - 目标路径：`scripts/build-registry/validate.ts`
  - 行动：校验必填字段、`type` 枚举、`files[].path` 存在、`registry:file`/`registry:page` 必须带 `target`、`registryDependencies` 只能引用本清单内的 name 或 `http(s)` URL、item name 唯一
  - 预期输出：非法清单会给出包含 item 名与字段名的错误并退出码 1
  - 验收引用：002-AC03
  - 计划验证：临时插入一个缺 `target` 的 `registry:file` item，确认构建失败且错误信息准确
  - 完成证据：未完成；检查未执行。

- [ ] **002-T03：实现产物生成**
  - 依赖：002-T02
  - 目标路径：`scripts/build-registry/manifest.ts`、`scripts/build-registry/index.ts`
  - 行动：按产物契约写出四类文件；`files[].content` 内联源码；保持稳定输出顺序与缩进
  - 预期输出：`apps/docs/public/r/` 下出现 `theme.json`、`utils.json`、`registry.json`、`index.json`、`all.json`
  - 验收引用：002-AC04、002-AC05
  - 计划验证：连续构建两次并比较目录哈希一致
  - 完成证据：未完成；检查未执行。

- [ ] **002-T04：接上根脚本与忽略规则**
  - 依赖：002-T03
  - 目标路径：根 `package.json`、`.gitignore`
  - 行动：把 `build:registry` 指向脚本；确认 `apps/docs/public/r` 不被忽略（它是发布物）
  - 预期输出：`pnpm build:registry` 一条命令产出全部产物
  - 验收引用：002-AC06
  - 计划验证：清理产物目录后重跑并检查文件数
  - 完成证据：未完成；检查未执行。

## 验收标准

- [ ] **002-AC01：清单结构合法**
  - 计划验证：构建在校验阶段通过，无警告
  - 所需环境：001 完成
  - 验证证据：未执行。

- [ ] **002-AC02：`utils` item 可独立安装**
  - 计划验证：把 `r/utils.json` 交给上游 CLI 安装，得到 `lib/utils.ts`
  - 所需环境：网络可用（`npx`）、本地静态服务
  - 验证证据：未执行。

- [ ] **002-AC03：非法清单被拒绝**
  - 计划验证：三种非法输入（缺 `target`、未知 `type`、引用不存在的 registry 依赖）均非零退出且错误含 item 名
  - 所需环境：无
  - 验证证据：未执行。

- [ ] **002-AC04：产物字段完整**
  - 计划验证：`r/{name}.json` 的 `files[].content` 非空且与源文件逐字一致；`r/registry.json` 列出全部 item
  - 所需环境：无
  - 验证证据：未执行。

- [ ] **002-AC05：构建幂等**
  - 计划验证：两次构建的产物哈希相同
  - 所需环境：无
  - 验证证据：未执行。

- [ ] **002-AC06：单命令构建**
  - 计划验证：删除 `apps/docs/public/r` 后执行 `pnpm build:registry`，目录被完整重建
  - 所需环境：pnpm
  - 验证证据：未执行。

- [ ] **002-AC07：上游 CLI 能解析跨 item 依赖**
  - 计划验证：用上游 CLI 安装一个带 `registryDependencies` 的 item，确认被依赖的 item 也被写入
  - 所需环境：网络可用、本地静态服务
  - 验证证据：未执行。

### 完成与交接要求

- 003 至 005 通过向 `registry.json` 追加 item 参与构建；007 依赖 `r/{name}.json` 与 `r/registry.json` 两个契约
- 在单独授权的实施期间，任务完成且所需检查通过后必须勾选任务复选框；验收验证通过后必须勾选验收复选框。记录实际命令或步骤、结果和证据位置。
- 在准备完成提交前，必须勾选所有必需任务和验收项。失败、跳过、阻塞或未执行的检查保持未勾选，并阻止阶段完成。
- 更新此文档和总计划的阶段状态，然后检查工作区和暂存区变更；只使用明确路径或已审阅代码块暂存该阶段的实施变更和进度更新。保留无关修改和预先存在的暂存工作；如果无法安全分离则暂停。
- 在开始依赖阶段前，为本阶段创建一次独立完成提交。遵循仓库约定；否则使用 `feat(ocean-vue-ui): complete subplan 002 - registry-pipeline`。不要合并已完成子计划，也不要为每个复选框创建提交。
- 验证成功并报告提交哈希。提交失败时阶段关闭仍等待提交；不要声称完全完成。缺少 Git、仓库或身份信息、钩子失败或变更已提交时请求用户指导。不要自动初始化 Git、修改身份、绕过钩子、推送、改写历史或创建空提交。
- 验证结果：未执行；本文档只描述计划工作。
- 实施需要单独授权；生成计划时不要执行任务或创建完成提交。

## 风险与缓解措施

| 风险 | 影响 | 缓解或回滚 | 相关任务 |
| --- | --- | --- | --- |
| 上游 CLI 只认 `r/{name}.json`，不去取 `r/registry.json` | 跨 item 依赖安装不完整 | 002-AC07 真实验收；若失败，把被依赖 item 的源码并入依赖方 files 作为回退 | 002-T03 |
| Node 类型剥离对 `import type` 之外语法有限制 | 构建脚本无法直接运行 | 脚本只用可擦除语法；否则加入 `tsx` | 002-T03 |
| 产物键序不稳定导致无意义 diff | 仓库噪声 | 固定键序与缩进，并用 002-AC05 守住 | 002-T03 |

## 延期决策

| 问题 | 已接受的影响 | 解决任务 | 阻塞对象 |
| --- | --- | --- | --- |
| `r/all.json` 的合并语义（仅 files 还是含依赖声明） | v1 不启用全量安装，产物为将来预留 | 007-T03 处理 Q01 时定稿 | 无，非阻塞 |
