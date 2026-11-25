# Harness 工程工作坊：从零开始构建真实代理 —— 五天完整笔记

> 课程主题：Harness Engineering（线束/控制器工程）。用 5 天时间，从零构建一个**极简但生产级**的智能体 harness（命名 **Odysseus**，学员可自起名）。
> 课程用一份配套书《Harness 书》作为深度参考，本笔记整合五天录音稿 + 课件 PPT 全部要点。

---

## 0. 课程总览与核心框架

### 0.1 本课程要构建的东西
- 目标：打造"全球最简约的智能体 harness"，命名 **Odysseus**（讲者喜欢《奥德赛》电影；开源 harness 都爱用希腊名）。
- 对照对象：
  - **闭源 harness**：Claude Code、Codex（全球最流行，但内部机制不可见）。
  - **开源 harness**：Py（~82k stars，约 12 万行代码）、Hermes（~200k stars，发布不到 6 个月，约 70 万行代码）、OpenClaw、Tao（Hugging Face 自研，~1 万行，自称"最小编码智能体"）。
- Odysseus 目标规模：**仅约 894~1000 行代码**（最终 14 个 Python 文件，约 1000~1200 行）。
- 核心哲学：**harness 本身尽量小，人类努力集中在"技能文件（skill files）"的设计上**。

### 0.2 核心比喻（贯穿全程，最需牢记）
| 概念 | 比喻 |
|---|---|
| LLM（大型语言模型） | 汽车的**引擎**（强大的"罐子里的大脑"） |
| 工具（Tools） | 汽车的**轮子** |
| 上下文（Context） | 引擎的**燃料** |
| 安全（Security） | 汽车的**安全带** |
| 子智能体/任务分配 | **导航（Google 地图）+ 自动驾驶调度** |
| **Harness（线束）** | 把以上全部组装起来的**整辆车** |

- LLM = **无状态机器**（stateless machine）/ "罐子里的大脑"：只做下一个词预测，无记忆、无环境感知、无工具。
- Agent = LLM + 工具（打破玻璃罐，让 LLM 接触外部世界）。
- Harness = 把 LLM、工具、上下文/记忆管理、子智能体编排、安全、持久性组合成可自主运行的系统。

### 0.3 术语谱系（由浅入深）
**提示工程 → 上下文工程 → Harness 工程 → 循环工程 → 图形工程**

- **提示工程**：写系统提示 + 用户提示的艺术（garbage in garbage out）。
- **上下文工程**：管理进入 LLM 上下文的一切（系统提示、用户输入、记忆、工具、RAG 文档、技能文件、CLAUDE.md 等），本质是"有效填充有限上下文"的艺术+科学。
- **Harness 工程**：组装整辆车（本课程核心，前两者的超集）。
- **循环工程**（约 1 个月前才出现的热词）：把任务做成有时间限制的自动化闭环（loop）。
- **图形工程**（最新，Peter Steinberger 一条推文催生的领域）：**循环之间的互联**构成图（graph）。

> 讲者观点：提示/上下文/harness 值得当作独立领域；循环/图形目前偏主观热词，但趋势明显。

### 0.4 Harness 的五个组成部分（金字塔式）
1. **循环（Loop）** —— 心跳，最基础原子单元
2. **工具（Tools）**
3. **上下文与记忆（Context & Memory）**
4. **耐久性（Durability）**
5. **整体编排（Orchestration，含子智能体）**

---

## 1. 第 1 天：循环（Loop）—— harness 的心跳

### 1.1 今天的目标
- 理解什么是 harness、为什么要自建 harness。
- 认识 harness 的最小原子单元：**循环（loop）**。
- 亲手构建前两个代码文件：**`loop.py`** 和 **`provider.py`**。

### 1.2 从 A 点到 B 点（为什么只有 LLM 不够）
- A 点 = 只有 ChatGPT/LLM；B 点 = 拥有一个可查询的、能"自动运营一家公司"的接口。
- 例子：模拟 CEO/CTO/CFO/CMO 的公司，3 个月做到 100 万美元 ARR，全自动化（网站、营销、销售、财务，用户反馈自动开 GitHub issue，CTO 智能体自动关闭并更新网站）。
- 结论：**只有 LLM 无法到达 B 点**，因为 LLM：
  1. 无状态、无记忆；
  2. 无工具，无法与外部环境交互（不能访问 GitHub API、Twitter API 等）；
  3. 缺少编排（时间调度）、任务分配、上下文/记忆管理、安全。
- 依次补上：工具 → 变成 Agent；再加上下文管理（燃料）、任务分配（导航）、安全（安全带）→ 变成完整的车（harness）。

### 1.3 REACT 循环（Thought-Action-Observation，思考-行动-观察）
- 名字来源：**Re**asoning + **Act**ing 的研究论文（不是 React 网络框架）。
- 流程示例（Claude Code 处理"打开第 87 号 GitHub issue 并提交 PR"）：
  思考 → 行动（用 GitHub MCP 工具）→ 观察 → 思考 → 行动（读工具）→ 观察 → … → 提交 PR → 跳出循环。
- **循环是每个编码智能体（Cursor/Claude Code/Codex）内部都在运行的原子单位**，代码不到 100 行。

### 1.4 消息数组（messages array）—— LLM 看到的唯一状态
- LLM 无状态，所以**每次调用都把整个"消息数组"传给模型**，这就是它看到的全部状态。
- 消息数组 = 一轮轮"思考-行动-观察"的累积，包含：
  - 系统提示、用户提示、工具（含描述）、技能文件、CLAUDE.md / agents.md、记忆、对话历史等。
- **一轮（turn）** = 一次完整的思考-行动-观察循环。
- 短期记忆本质 = 这个消息数组；关闭会话即消失。
- **压缩**：只有"消息的来回"会被压缩；系统提示、工具、技能、CLAUDE.md **永不被压缩**。
- 避免无限循环：设 `max_turns`（最大轮数）；多数时候模型能自己识别"已完成"并退出（`/exit` 类命令并非用来结束循环，只有目标达成才结束）。

### 1.5 本日代码：`loop.py` + `provider.py`
- `loop.py`：核心函数 `run_loop`——while True 调用模型（传 messages + tools），若无工具调用则返回文本退出；否则按顺序执行每个工具调用并追加结果；**工具崩溃时提取错误信息返回，不让循环静默失败**。
- `provider.py`：模型提供者（如何与 loop 交互），本课用 Gemini API（也可用 Anthropic、任意 API key、本地 LLM）。

### 1.6 其他要点
- 自建 harness 的好处：**不依赖闭源供应商**（成本可能上升、垄断风险、补贴不可持续）。
- 用 Claude Code/Codex 等编码智能体来"写" harness 代码（提示词即"新编程语言"）。
- 建议安装并探索 Hermes、Py（`curl` 命令即可装，约 2 分钟），对比不同模型（Kimi K3、GLM5.2 等开源模型）。
- 作业：通读配套材料、完成测验、探索 Hermes/Py。

---

## 2. 第 2 天：工具（Tools）与安全（Security）

### 2.1 今天的目标
- 深入理解"工具"的定义与**工具合同（tool contract）**。
- 构建 **`tools.py`** 和 **`security.py`**。
- 理解安全的三层 + 沙箱 + 三种执行环境。

### 2.2 工具的本质
- 工具 = 让 LLM 接触外部世界的"轮子"；打破"玻璃罐"。
- 外部世界 = GitHub 仓库、Zoom API、终端、Google Drive、Slack、Jira、Notion、Salesforce 等。
- **MCP（Model Context Protocol）**：标准化的工具访问方式，像 USB 接口。如 GitHub MCP 默认提供 27 个工具；10 个团队无需各自为 GitHub Actions/Issues 写集成。

### 2.3 工具的两种分类
1. **预构建工具（built-in）**：随 harness 交付。
2. **外部工具（external）**：用户自定义（运行时/设计时），如 MCP 插件或自己写的 Python 脚本。

- **Claude Code / Py 的 7 个预构建工具**：`read`（读）、`write`（写/创建）、`edit`（编辑）、`bash`（最危险也最强大）、`grep`（正则/模式搜索文件内容）、`find`（找文件位置）、`ls`（列目录）。
  - grep vs find：grep 搜"文件里的文本"，find 找"文件位置"。
- **设计取舍**：
  - **Py**：极简，只带 7 个基础工具，其余靠插件（→ 代码量小，约 Hermes 的 1/7）。
  - **Hermes**：自带 100+ 工具（网页搜索、看板、视频、浏览器等）和大量技能（开箱即用 → 代码库庞大）。
- 为什么有 bash 还要单独 grep/ls？——**爆炸半径（blast radius）**：bash 影响范围大，单独小工具更安全。
- 工具描述会占用上下文窗口，所以不能太冗长。

### 2.4 工具合同（Tool Contract）—— 一个工具分两部分
**① 接口层（LLM 能看到）**：
- **name（名称）**：如 "read"。
- **label/tag（标签）**：给工具分类，便于多工具时分组（像集会上给人贴名签）。
- **description（描述）**：最重要，决定 LLM 能否选对工具。
- **parameters（参数）**：执行所需输入（如 read 的 path；edit 的 path + old_string + new_string）。

**② 实现层（LLM 完全看不到）**：
- 实际执行的 Python 代码/函数。
- 执行者接收：工具调用 ID、参数、`on_update` 回调。
- `on_update` = 回调/事件，用于工具长时间执行时向用户流式反馈进度（= Claude Code 里的 hook 概念）。

- 写工具描述的反例（很差）：描述含糊、无参数说明。正例：明确"这个工具做什么 + 何时用 + 需要哪些参数"。
- 工业案例教训：100 个工具里 3 个功能重叠，LLM 就难以区分 → 工具应**单一职责、描述间减少重叠**。
- 例子：Py 的 read 工具，参数有 path、offset、limit（分页读大文件），描述注明"大文件用 offset/limit 直到读完"。

1. grep 命令用于在大量文件中搜索特定文本或模式，适用于需要查找文本出现在哪些文件中的场景，实现高效的内容匹配。
2. find 命令专注于查找特定文件及其位置，适用于在指定目录下搜索文件的需求，提供精确的文件定位功能。
3. ls 命令用于列出指定目录下的所有文件，是查看文件夹内容的基础工具，对文件管理至关重要。
4. 与 find 相比，grep 更深入地处理文本内容搜索，而 find 主要关注文件本身的定位，两者在文件处理中各有侧重。
5. 通过结合使用 grep、find 和 ls 命令，可以实现对文件系统更全面和灵活的管理和搜索，满足不同场景下的需求。


1. 大型语言模型在理解工具时，仅能获取名称、标签、描述和参数，而无法洞察工具的实际执行过程，这是模型认知的局限性。
2. 对于与设计系统合作的经验者而言，他们能够理解界面的术语和实现细节，这与大型语言模型的视角形成鲜明对比。
3. 卡兰在定义工具时，强调了行动的重要性，这表明在工具定义中，行动或执行部分是核心考量之一，但大型语言模型对此缺乏直观理解。

### 2.5 安全（构建 harness 最关键的环节之一）
安全必须**紧密融入设计**，不是事后附加。三层 + 沙箱：

1. **第一层：工具调用门控（tool call gating）**——权限门（permission gate）对每个动作做三种决定：立即允许 / 询问人类 / 直接拒绝。`rm`、force push 等危险命令会被拦截询问。
   - **YOLO 模式** = 绕过权限，只能在沙箱中运行。
   - 只读模式 / 安全模式 / YOLO 模式（本课 Odysseus 做三种模式）。
   - 门控基于**正则表达式**（确定性）；若用 LLM 门控则引入非确定性。
2. **第二层：受保护路径（protected paths）**——定义永不触碰/永不写入/永不编辑的路径。
3. **第三层：用户级安全（user-level access）**——基于登录/OU（组织单位）的 RBAC 权限，限制某些用户只能访问特定工具/部分（企业刚需，Py/Hermes 都未实现，是开放机会）。

- **沙箱（sandbox）**：给智能体一个"自由环境"（一个文件夹/隔离环境），爆炸半径固定，逃逸会在路径解析层失败。
- **三种执行环境（Py 的实现）**：
  - 本地（local）
  - 远程（SSH，如租虚拟机跑危险 bash）
  - 沙箱（sandbox，本机 OS 内建"监狱"）
  - 特点：项目级可切换后端，**工具级**也可切换（如"bash 只在远程跑，read 本地跑"）；通过"操作层（operation layer）"把工具功能与运行位置**分离**。

### 2.6 本日代码：`tools.py` + `security.py`
- `tools.py`：写 6 个默认工具（read_file、write_file、edit_file、bash、list_files、grep；为保持轻量，不单独写 find）。
- `security.py`：实现 3 种模式（只读 / 安全 / YOLO）+ 拒绝模式（deny patterns，如 rm、force push）+ 路径解析（任何试图逃出工作目录的操作抛错，实现沙箱）。
- 安全流程图：工具定义 → 安全检查（工具级 + 路径级）→ 安全则执行并追加消息数组 → 继续循环；不安全则询问人类 → 拒绝则告知模型 → 模型重新循环提替代方案。
- 错误处理：工具崩溃不静默失败，把错误信息反馈回循环，让 LLM 自我纠正。

---


```
description: `Read the contents of a file. Supports text files and images (jpg, png, gif, webp, bmp). Images are sent as attachments. For text files, output is truncated to ${DEFAULT_MAX_LINES} lines or ${DEFAULT_MAX_BYTES} / 10 (whichever is hit first). Use offset/limit for large files. When you need the full file, continue with offset until complete.`
```
> **描述：读取文件内容。支持文本文件与图片（jpg、png、gif、webp、bmp）。图片将以附件形式返回。对于文本文件，输出会截断至【DEFAULT_MAX_LINES】行，或是【DEFAULT_MAX_BYTES/10】大小（两个阈值，哪个先触发就按哪个截断）。读取大文件请使用偏移量(offset)/读取上限(limit)参数；如需读取完整文件，请持续递进偏移量，直到读取完毕。**

---

```
Stop and notice what this is. Those constants resolve to 2000 lines and 50KB — the real limits, baked into truncate.ts. But look past the numbers to the sentences. This isn't documentation for a human. It is an instruction manual written for the model, telling it exactly when the tool will hold back output and precisely what to do about it:
"Use offset/limit for large files. When you need the full file, continue with offset until complete."
```
> 停下来想一想这到底是什么。这些常量对应的实际上限是 2000 行、50KB，这个硬性限制写死在 `truncate.ts` 里面。但不要只盯着数字，重点看里面这段文字。
> 这并不是写给人看的文档，而是写给大模型的操作手册，精准告诉模型：工具什么时候会截断输出、遇到这种情况该怎么做：
> “读取大文件时使用 offset（偏移量）和 limit（读取上限）；如果需要拿到完整文件，就持续向后递进偏移量，直到全部读取完成。”

---

```
That sentence is the entire mechanism of paging, taught in one line. The schema allows offset and limit; the description teaches the model to reach for them, and to keep bumping offset forward until it has seen the whole file. Take that sentence away and the model still technically …
```
> 就这么一句话，讲清楚了整套分页读取机制。参数 schema 定义了 offset 和 limit，而这段描述，是教会大模型主动去使用这两个参数、不断向后推移偏移量，直到读完整个文件。如果删掉这句话，即便参数还在，模型在理论上依然……


# Agent 文件读取工具设计 技术笔记（配套 read.ts 工具 + 分页机制）
> 背景：这是 Coding Agent 里 `read` 文件读取工具完整设计思想，分为【参数Schema定义】和【写给大模型的描述词（分页逻辑）】两部分，和前面 `ToolDefinition` 接口配套

## 一、工具参数层：TypeBox Schema（机器校验契约）
文件位置：`packages/coding-agent/src/core/tools/read.ts`
```typescript
const readSchema = Type.Object({
  path: Type.String({ 
    description: "Path to the file to read (relative or absolute)"
  }),
  offset: Type.Optional(Type.Number({ 
    description: "Line number to start reading from"
  })),
  limit: Type.Optional(Type.Number({ 
    description: "Maximum number of lines to read"
  })),
});
```
✅ 字段说明
1. **path（必填）**：待读取文件路径，支持相对路径、绝对路径
2. **offset（可选）**：起始读取行号（偏移量）
3. **limit（可选）**：本次最多读取行数

✅ 核心作用：**机器可校验的契约**
Schema 负责参数合法性校验：大模型调用工具返回参数时，如果不符合规范（比如不传 path、limit 传字符串而不是数字），会在进入 `execute` 执行函数之前直接拦截拒绝，提前阻断非法调用。
> 👉 Schema 只定义「有哪些参数、参数类型、是否必填」，**不会告诉模型什么时候该用、该怎么循环分页**。

---

## 二、工具描述词层：给 LLM 的指令（模型行为规则）
```
description: `Read the contents of a file. Supports text files and images (jpg, png, gif, webp, bmp). Images are sent as attachments. For text files, output is truncated to ${DEFAULT_MAX_LINES} lines or ${DEFAULT_MAX_BYTES} / 10 (whichever is hit first). Use offset/limit for large files. When you need the full file, continue with offset until complete.`
```
✅ 翻译：
读取文件内容。支持文本文件与图片（jpg、png、gif、webp、bmp）。图片将以附件形式返回。对于文本文件，输出会截断至 DEFAULT_MAX_LINES 行 或 DEFAULT_MAX_BYTES/10，两个阈值哪个先触发，就按哪个截断。读取大文件请使用 offset（偏移量）和 limit（读取上限）；如需读取完整文件，请持续递进偏移量，直到读取完毕。

✅ 底层硬限制
常量对应的实际上限：**2000行、50KB**，硬编码在 `truncate.ts`。
> ⚠️ 重点区分：
> Schema 是给代码、校验器看的；这段 description **是专门写给大模型看的操作手册**。
> 它告诉模型：工具存在截断上限，遇到大文件时，要主动利用 offset + limit 分页，不断向后推移 offset，循环调用工具，分片读完整个文件。
> 如果删掉这句引导文字，就算参数还在，模型也很难自主意识到要分页读取大文件。

## 三、设计要点总结（5条核心要点，整理精简版）
1. **分块读取海量文本**：将长文本切分为多个可管理片段分步读取，避免单次传入信息过载。
2. **分页机制**：依靠 offset 偏移量实现接续读取，是大文件读取的核心方案，提升读取稳定性。
3. **工具设计要适配超大文件场景**：设计工具时，提前考虑上千行、上万行等大文件场景，保障健壮性。
4. **Harness/Agent框架需要覆盖多元场景**：搭建Agent运行框架时，需要兼顾不同文件大小、不同读取模式的需求。
5. **分步处理优化体验**：针对大规模数据集采用分批读取策略，提升工具实用性，降低出错概率。

## 四、补充：Schema 与 description 的分工对比（非常关键）
| 模块 | 给谁看 | 职责 |
|---|---|---|
| TypeBox Schema | 代码、校验器 | 定义参数结构、类型、必填项，做静态校验，拦非法参数 |
| tool description | LLM大模型 | 业务规则、使用策略、异常处理逻辑（比如截断后分页），引导模型怎么用参数 |

## 五、关联前置知识
和上一张图 `ToolDefinition<TParams, TDetails>` 接口是一套体系：
- `ToolDefinition` 定义工具整体结构：name / label / description / parameters / execute
- `parameters` 填入上面这份 TypeBox schema
- description 就是写在这里，用来引导模型调用逻辑

### 译文
（承接上文）
同时它还有结果渲染逻辑 —— `read` 工具会用 `renderResult` 对刚刚读取到的文件做语法高亮展示。而 `executionMode` 用来标记工具为**串行（sequential）**或者**并行（parallel）**：标识该工具是否可以在同一轮次里和其他工具调用安全并发执行。这些配置都不会改变工具本身的业务能力，它们只是用来精细化控制工具的展示方式与调度协同策略。

---
# 亲眼观察这个运行过程
让 Pi 去处理一个大文件，你就能看到这两套机制协同工作的效果。你可以向它下达指令：**“读取这份3000行日志的全部内容，并总结里面的报错信息。”**
模型读取过 `read` 工具的描述文本之后，不会只调用一次 `read(path)` 就停止。它先调用 `read(path, offset=1)`，拿到返回的2000行内容，同时收到提示：`[...Use offset=2001 to continue.]`（……使用 offset=2001 继续读取）。紧接着，它就会严格按照描述里的指引，发起 `read(path, offset=2001)` 调用，读完文件剩余部分。

仅仅是写在 description 字段里的三句自然语言，就实现了正确的多轮工具调用行为，**框架侧不需要额外编写任何配套代码**。


### 译文
描述文本，才是大模型真正的API。模型永远看不到你写的 `execute` 执行函数。它能获取到的只有工具名称、参数结构和描述文本；而在这三者之中，**描述文本是你唯一可以向模型说明「何时调用工具、如何调用工具」的地方**。它虽然是自然语言，但承担着核心的功能逻辑，写它的时候要像编写代码函数一样严谨审慎。

这就是为什么 Pi 内置工具的描述通常篇幅较长、偏向指令化，而不是简短一句话。
`bash` 工具的描述也是同样思路：在 `bash.ts` 里，它会提前告知模型：
> “输出会被截断，只保留最后2000行或50KB内容（二者先达到哪个阈值就按哪个截断）。一旦发生截断，完整输出会保存到临时文件中。”

这样一来，模型在执行 `cat huge.log` 之前就清楚：自己只能拿到日志末尾片段，剩余内容存放在哪里。

---
# 描述文本 = 模型的API（配图标题）
配图逻辑说明：
1. 给模型读取 `read` 工具的描述文本：
> 读取文件内容。遇到大文件时，模型必须使用 offset 参数持续向后读取，直到读完文件；offset 参数用于指定后续读取的起始位置（单位字节）。
2. 模型自主生成多轮分页调用：
`read(path, offset=1)` → `read(path, offset=2001)` → `read(path, offset=4001)`
之所以会自动分页，正是这段自然语言指令告诉它要这么做。
> （补充小字：原本一共5000行，单次只能读到2000行）

---
### 核心要点提炼（方便合并进笔记）
✅ 模型看不到底层 `execute` 代码，**description 是和模型沟通行为逻辑的唯一载体**
✅ description 不是简单备注，是承载业务规则、异常处理策略的“自然语言API契约”
✅ bash、read 这类工具统一范式：提前告知截断规则、配套补救方案，引导模型自主处理长输出


这是一份**机器可校验的契约**：模型必须传入字符串类型的 `path` 参数，也可以选择性传入数字类型的 `offset` 和 `limit` 参数。如果模型返回的参数不符合规范——比如缺失 `path`、`limit` 传了字符串类型——那么在 `execute` 执行函数运行之前，这份 Schema 就会直接拒绝该调用。

接下来是最重要的部分，也是本章的核心。下面就是 `read` 工具真正的描述文本：
```
description: `Read the contents of a file. Supports text files and images
(jpg, png, gif, webp, bmp). Images are sent as attachments. For text files,
output is truncated to ${DEFAULT_MAX_LINES} lines or ${DEFAULT_MAX_BYTES / 10}
(whichever is hit first). Use offset/limit for large files. When you need the
full file, continue with offset until complete.`
```
> 描述：读取文件内容。支持文本文件与图片（jpg、png、gif、webp、bmp）。图片将以附件形式返回。对于文本文件，输出会截断至 `${DEFAULT_MAX_LINES}` 行或者 `${DEFAULT_MAX_BYTES / 10}` 大小（两个阈值，哪个先触发就按哪个截断）。读取大文件请使用 offset/limit 参数；如果需要读取完整文件，请持续递进偏移量，直到读取完毕。

停下来思考这一段的本质。这些常量对应的实际限制是 **2000行、50KB**，这个硬限制写死在 `truncate.ts` 里面。

---
右侧小字注释翻译：
> ² TypeBox 值得了解一下。它可以让我们一次编写 Schema，同时自动生成对应的 TypeScript 类型。`Static<typeof readSchema>` 就是用来校验模型入参是否合法的类型。它为模型和代码提供了统一的可信来源。



## 3. 第 3 天：上下文管理（Context Management）与技能（Skills）

> 讲者称这是"整个研讨会最重要的一次讲座"（上下文 + 记忆）。本课重点是**上下文管理/压缩**（记忆顺延到第 4 天）。

### 3.1 上下文的关键组成（9 个组件，分 NC / C 两类）
| # | 组件 | 是否被压缩 |
|---|---|---|
| 1 | 系统提示（system prompt / 基础模板） | NC（永不压缩） |
| 2 | 工具（含 name/label/description） | NC |
| 3 | 技能文件（只加载 name + 简短描述） | NC |
| 4 | 记忆文件（agents.md / claude.md 等） | NC |
| 5 | 当前工作目录 CWD | NC |
| 6 | 日期（date） | NC |
| 7 | 用户消息（user） | C（会压缩） |
| 8 | 助手消息（assistant） | C |
| 9 | 工具调用（tool call） | C |

- **日期注入**很重要（否则模型不知道"明天/下周"是什么时候）。
- 系统提示 vs 用户消息：系统提示是固定的全局指导；用户消息是本次会话的具体提问。
- Py 的上下文组装分 5 部分：基础模板（系统提示+工具列表合并）、项目上下文（遍历所有 agents.md/claude.md）、技能、消息历史等。
  - **项目上下文（祖先系统）**：从当前目录向上到根目录，收集所有 `agents.md`/`claude.md`，去重，子目录文件覆盖根级（最接近本地仓库的优先）；会话中改了这些 md 文件，下次重建立即生效。

### 3.2 上下文压缩（Context Compaction）—— 深度层次
只回答"用另一个 LLM 总结"= 第一层深度（面试会暴露不懂 harness）。生产级要问四个层次：
1. **何时压缩？**
2. **在哪里压缩？**
3. **如何展示压缩结果？**
4. **失败/边缘情况怎么处理？**

#### Py 的压缩方式
- 阈值：预留 **16384 tokens**（保留空间给压缩后的回复）。
- 保留最近 **约 2000 tokens**（讲者表述有 2000/20000 出入），对更早内容做总结。
- **切割边界（关键细节）**：只能在 **user 消息**或 **assistant 消息**处切，**绝不能在 tool result（工具结果）处切**（否则新上下文会从孤立的工具结果开始，丢失"为什么调用"的提问）。
- 摘要结构（6 部分）：目标、约束、进展、关键决策、下一步、重要背景。

#### Hermes 的压缩方式（比 Py 细致得多）
- 有效窗口 = 上下文长度 − 最大输出 token 数；**达到有效窗口 50% 就触发**（Py 是等到窗口快满才压）。
- **保留形状**：保护头部（开头前 3 条用户消息，反映用户初衷）+ 保护尾部（最后 20%），只压缩**中间部分**。
- **预压缩旧工具结果**：先把旧工具结果重写为简短描述性语句（零成本、无 LLM、完全确定性；工具结果常占上下文大头，如 5000 行报错只留最后一行）。
- **微压缩（micro-compaction）**：每轮结束后就把该轮总结进一个**滚动摘要**，而非批量压缩。→ 上下文大小曲线：Py 呈"震荡波动"，Hermes 呈"平稳"。
- 摘要结构（11 部分）：历史任务快照、目标约束偏好、已完成行动、当前状态、阻塞、关键决策、已解决问题、相关文件、重要背景、预简化技能。
- **失败/边缘情况处理（4 种）**：地板 64000 tokens；两次尝试后放弃；遇速率限制冷却 600 秒；主 LLM 不可用时用备用模型，再不行用**确定性字符预算**手动总结（不依赖模型）；若"永不被压缩的固定内容"本身超出窗口则无法处理。

### 3.3 Token 估算（Py 的做法）
- 优先找**最后一条带 usage block 的助手消息**（API 返回使用量）。
- 之后的"尾随 token"用启发式估算：文本 = 字符数 ÷ 4；工具调用 = name + JSON 参数之和；图像 = 固定 4800 字符。

### 3.4 缓存控制（Cache Control）
- 无缓存时，每轮都重发整个前缀 → 重复付费。**缓存控制**把不变内容（系统提示、工具、历史轮次）缓存断点，只传增量。
- 与 Anthropic 服务器端缓存、**KV cache** 相关：预填充（prefill）阶段已算好的键/值向量不再重算 → 省钱 + 降延迟，大幅降低 **TTFT（首次令牌时间）**。
- **TTL（生存时间）**：缓存保持时长（Py 支持 1 小时等，可独立跟踪）。

### 3.5 技能文件（Skills）与渐进式披露
- **技能 ≠ 工具**：技能是"做什么 + 何时做"（过程指导 markdown），工具是"怎么做"（独立代码）。技能可引用工具。
- **渐进式披露（progressive disclosure）**：上下文中**只加载技能的 name + description**；只有 LLM 选中某技能时，才加载完整技能文件正文。→ name/description 必须写好，否则技能永远找不到。
- Anthropic 写技能文件的最佳实践：
  1. **别写 LLM 已懂的常识**（如"PDF 是什么""Rust 优点"），保持简短。
  2. **description 要写两件事**：技能做什么 + **何时使用**。
  3. **name 按活动命名**（如"处理PDF/分析表格/测试代码"），**绝不用** util/tools/data/helper 等模糊词。
  4. **自由度**：窄桥（如数据迁移）写具体、可给脚本；开阔领域（如代码审查）给自由，别过度具体。
  5. **长度**：skill.md 控制在 **500 行以内**，大了拆成多个 md；引用深度最多 **1 层**。
  6. **两种模式**：清单式（纵向工作流，checkbox 防遗漏）；**反馈循环式**（自我检查：改→验证→修→通过才继续）。
  7. **上线前测试**：用一个会话写技能，另一个会话（不带偏见）严格批评/验证（类似 GAN 的对抗）；作者用 AI 检测 API 设阈值（如 AI 检测率 <5%）来验证"写作风格"技能。
- 例子：讲者做"DeepSeek 书"时写 `Writing style.md`（避免双破折号、AI 腔词）；做产品前端写了约 **75 个技能文件**，每个上线前都测试。
- Hermes 的 **slash learn**：能从对话中自动生成技能文件（自我优化，连 Claude Code 也未必做到）。

### 3.6 本日代码：`context.py`（只做压缩部分）
- 简化版设计：保留最近 6 条消息，用 LLM 总结更早内容；token 估算用"每 token ≈ 4 字符"。
- 压缩摘要要求：保留原始任务、每条消息中工具调用的文本、文件创建/编辑及其目的、关键决策、未解决的错误、下一步。
- `skills.py` 和 `memory.py` 顺延到第 4 天。

---

## 4. 第 4 天：内存（Memory）、子智能体编排（Subagents）、持久性（Durability）

### 4.1 内存管理（Memory）
- 内存在循环中的体现 = **消息数组**（存的记忆越多，消息数组增长越快）。
- **权衡**：记忆越强 → 越个性化（深刻的人类体验）→ 但消息数组膨胀、超出上下文。

#### 短期记忆 vs 长期记忆
- **短期记忆**：对话中来回的用户/助手/工具调用消息；会话结束即消失。处理方式：限制轮数 / 超过轮数提前总结 / 选择性保留（关键词匹配）。
- **长期记忆**：持久化在磁盘（本地/虚拟机/数据库）。

#### 各 harness 的长期记忆对比
| Harness | 做法 | 特点 |
|---|---|---|
| **Py** | 只有 `agents.md` / `claude.md` | 最弱，依赖用户手写，无自动记忆 |
| **Hermes** | `memory.md`（智能体自写）+ `user.md`（用户偏好）+ `slash learn`（自我生成技能） | 自我改进；7 天回顾、30 天标记过时、90 天归档（有"策展人"） |
| **OpenClaw** | `SOUL.md` + `daily notes.md` + `memory.md` + **dreams（梦境）** | 背景巩固：短期→长期；RAG/向量索引 + 混合搜索（向量相似 + 关键词） |
| **Codex** | 仅在用户明确要求时记住/忘记/更新 | 不自动创建 |
| **Claude Code** | `CLAUDE.md` + **自动记忆（auto-memory）** | 会自存偏好/代码风格，但不自动生成技能；机制未公开 |

- **梦境（dreams）**：后台智能体（像睡觉时）扫视短期记忆，把合格条目提升为长期记忆（评分阈值、召回频率门、查询多样性过滤器）。→ 用户第二天回来，harness 已识别出重要内容，甚至反问"要存这个吗"，带来魔幻级个性化。
- **企业级记忆系统（开放机会）**：现有开源 harness 都**缺安全层**；可加角色级/OU 级访问控制，做成独立产品（可能数十亿美元市场）。
- 企业安全四要素：① 用户访问控制 ② OU 访问权限 ③ 沙箱隔离（明确爆炸半径）④ 速率限制 + 防蒸馏/防恶意。
- 最安全组合 = 开源 harness + 开源模型（如 Kimi K3 需 8~10 张 B300 才能托管，成本高）。

### 4.2 子智能体编排（Subagent Orchestration）
- **核心机制：所有子智能体都"被视作工具"**（在基础提示里和工具一样有 name + description，LLM 判断任务可并行时就调用）。
- 子智能体 vs 技能：技能是 markdown（做特定操作）；子智能体是**有自己上下文、记忆、基础提示、工具、模型**的独立智能体。
- **三种模式**（Py 默认）：单（single）/ 并行（parallel）/ 链式（chain）。
- **关键差异：子智能体"住在哪"**
  | Harness | 子智能体实现 | 并发上限 | 隔离 |
  |---|---|---|---|
  | **Py** | 独立 OS 进程（全新上下文/记忆/工具/模型，无内存共享） | 4 | 好（父不共享，父只为"答案"付费，子承担探索成本） |
  | **Hermes** | 同一进程/线程（共享工具） | 3 | 差（需上下文变量隔离） |
  | **Codex** | 同一进程 | 4/会话 | 差 |
  | **Claude Code** | 未公开 | — | — |
- **深度限制**：Hermes=1，Claude Code=3（可层层嵌套，像盗梦空间）。
- Py 预定义 4 个子智能体：**Scout（侦查）、Planner（规划）、Worker（执行）、Reviewer（评审）**，并已默认连成链（scout→planner，worker→reviewer）。
- **交接（handoff）**：与压缩、子智能体不同——**用户主动发起**（如 `/handoff`），从当前庞大会话中提炼一个**目标**，交给一个全新上下文的新绘画（只带目标，完全重置）。子智能体是**系统/模型自动发起**，交接是**用户发起**。
- **三层子智能体协调**（易混淆点）：
  1. 子智能体（父子进程）
  2. 交接会话（浓缩目标，全新上下文）
  3. **舰队（Fleet）**：多个实例在多目录/多机器并行（监督者控制 N 个实例）。

### 4.3 持久性（Durability，最少被讨论的话题）
- 目标：崩溃后能从断点恢复；执行前先记录状态。
- **四个存储（four stores）对比**：
  | Harness | 存储方式 | 写入时机 |
  |---|---|---|
  | **Py** | 每会话一个 JSONL 文件 | 每条消息末尾追加 |
  | **Hermes** | SQL 数据库（state.db） | 每轮写 3 次（API 调用前 / 每批工具后 / 轮末） |
  | **Codex** | JSONL + 后台数据库 | 逐项后台追加 |
  | **Claude Code** | 每会话 ID 一个 JSONL 转录 | 未公开（推测类似 Codex） |
- **崩溃处理**：最后一行中断时，Py 丢弃该行；Codex 补缺失换行。
- **文件保留**：Hermes 在文件变更前做**影子 git 快照**；Codex 曾有 git 机制后删除；Claude Code 每次用户提示前建检查点（保留最近 100 个）+ `/rewind` 回放。

### 4.4 本日代码：`memory.py`、`skills.py`、`session.py`、`subagents.py`
- `memory.py`：维护 `odyssey.md`（类似 CLAUDE.md 的长期记忆）。
- `skills.py`：维护技能目录，技能整合进基础提示，有工具读取完整技能。
- `session.py`：持久性，JSONL 每行一条消息，调用前先写日志。
- `subagents.py`：子智能体工具（`@tool` 装饰器），生成独立任务的新智能体，返回最终报告，达最大深度时返回错误。
- 第 4 天结束后应有 9 个文件（provider/loop/tools/security/context/memory/skills/session/subagents）。

---

## 5. 第 5 天：组装 Harness、Fleet、CLI 与测试 / 循环与图形工程

### 5.1 组装最后 3 个文件
- **`harness.py`**：实例化 **Harness 类**（把所有模块缝合）。类可带策略（yolo/安全模式）、工具、子智能体工具，构建系统提示，内含运行循环（心跳）。
  - **预算检查时机差异**：Py 在**模型调用后**检查上下文预算（再压）；Hermes/Codex 在**调用模型前**检查。Odysseus 采用 Py 模型（模型调用后、工具运行后）。
  - 模块化设计：可随时加短期记忆（memory.py）、可观测性（OpenTelemetry 追踪）、评估器（evaluator.py）。
- **`fleet.py`**：创建 Harness 类的**多个实例**（舰队），每个有独立 name/workdir/task，在各工作目录并行运行（唯一限制是 LLM 速率）。
- **`client.py`**：命令行接口 CLI，两种模式——**交互模式**（人类用）+ **无头模式（headless）**（自动化/远程，类似 `claude -p` 命令）。
- 最终：**14 个 Python 文件，约 1000~1200 行**。

### 5.2 测试 harness（构建产品验证）
- 首次测试：用 harness 并行构建多个简单产品（手工咖啡、任务管理工具、清洁器等）。
- 关键：此时 Claude Code **只是被动接口**（发指令），真正执行的是自建 harness；理想下一步是脱离 Claude Code，用终端命令或加 UI 层直接运行。

### 5.3 案例：用 Odysseus 构建 "Ablation" 产品（AI 研究通讯）
- **构建产品前先写清楚**：目标（收入？订阅？）、重要的事（深入无废话、可视化讲数学、写作风格简单、美学优雅简约如 Lenny 通讯、订阅增长）。
- **把"重要的事"转成技能文件**（这是人类该努力的地方）：
  1. `Lenny 设计`（设计系统，可用开源模型 GLM5.2 扫网站生成）
  2. `写作声音`（writing voice，禁用双破折号、"delve""真正的游戏改变者"等 AI 腔词）
  3. `深度探讨结构`（每期：主张→为何困难→解决过程→证据→延伸阅读）
  4. `编辑`（校验反馈循环）
- 提示词分四阶段：建站+第一期 → 生成 4 篇文章（派生 4 个子智能体各写一篇）→ 整合输出 → 生成验证子智能体审核。
- 结果：仅靠 4 个技能文件 + Odysseus，就产出干净简约、带亮/暗模式、带原创图示的通讯（约 80~100 次思考-行动-观察循环）。

### 5.4 循环工程（Loop Engineering）—— 在 harness 之上加循环
- 循环 = 有时间限制的自动化闭环；循环越多，自动化越强。
- **把 Ablation 变成"个人公司"需要 3 个循环**：
  1. **产品循环**：用户反馈 → 自动生成 GitHub issue → **Scout**（发现/判断）→ **Forge**（写修复）→ **Mentor**（复现漏洞、挑战修复）→ 创建 PR → 产品自动更新。实现文件：`feedback.py`。
  2. **营销循环**：新文章 → **Harold**（读文章写帖子）→ 生成 LinkedIn 帖 + 邮件营销帖 → **Mentor** 审核 → 用 **Typefully API** 发布 → 追踪点赞/评论 → 反馈影响后续文章。
  3. **销售循环**：**Ranger**（Apollo API 找潜在客户）→ **Judge**（评分）→ **Lawyer**（写专属冷邮件）。
- 核心思想：**线 vs 圆**——线性 = 决定新内容就结束；循环 = 自动闭环 + 反馈机制持续改进。

### 5.5 图形工程（Graph Engineering）
- 图 = **循环之间开始互相连接**（产品循环 ↔ 营销循环 ↔ 销售循环）。
- 两年后每个大组织可能有 100 个循环互连。
- 技术栈全貌：**Provider/Loop/Harness/Security/Context/Memory/Skills/Session/Subagents/Fleet** → 之上建**循环** → 之上建**图**。

### 5.6 四个开放问题（Open Problems，均有 GitHub 仓库）
1. **Agamemnon**：为企业 harness 做沙盒/安全层（"谁允许这个智能体这么做？"——当前缺失的一环；类似 Nemo Claw 为 OpenClaw 做的事）。需有企业经验者。
2. **Penelope**：循环工程 + 图形工程的库（目前无人写过）。
3. **Telemachus**：技能文件的**自我进化**（技能是可训练的，非静态；Hermes 用 GEPA 优化器/DSPy 起步，但缺"判断进化技能是否更好 + 安全投产"环节）。
4. **Benchmark**：可靠的 harness 评估基准（现有 Claude SWE bench 太新、非标准）。

### 5.7 结尾观点
- 未来会有"Harness 即服务（SaaS）"：企业因安全不愿依赖 Claude Code，会买专属 harness。
- 趋势预测：先转向"闭源模型 + 开源 harness"，再转向"开源模型 + 开源 harness"。
- 建议：发布自己的 harness（GitHub/Hugging Face/LinkedIn），作为个人项目展示。
- 提醒：从"线性思维"转向"循环/图思维"。

---

## 6. 五天代码文件总览（Odysseus 最终形态）

| 文件 | 功能 | 对应天数 |
|---|---|---|
| `provider.py` | 模型提供者（LLM API） | Day 1 |
| `loop.py` | 运行循环（心跳，思考-行动-观察） | Day 1 |
| `tools.py` | 6 个工具 + 工具合同 | Day 2 |
| `security.py` | 3 种模式 + 拒绝模式 + 沙箱路径解析 | Day 2 |
| `context.py` | 上下文压缩 | Day 3 |
| `memory.py` | 长期记忆（odyssey.md） | Day 4 |
| `skills.py` | 技能目录 + 渐进式披露 | Day 4 |
| `session.py` | 持久性（JSONL 日志） | Day 4 |
| `subagents.py` | 子智能体工具 | Day 4 |
| `harness.py` | Harness 类（缝合所有模块） | Day 5 |
| `fleet.py` | 多实例编排 | Day 5 |
| `client.py` | CLI（交互 + 无头模式） | Day 5 |

> 另可扩展：OpenRouter 集成、短期记忆、梦境、可观测性（OpenTelemetry）、评估器、UI 层等。

---

## 7. 关键数字速查表

| 项目 | 数值 |
|---|---|
| Odysseus 代码量 | 约 894~1000 行（最终 14 文件 ~1000~1200 行） |
| Hermes 代码量 | 约 70 万行 |
| Py 代码量 | 约 12 万行 |
| Tao 代码量 | 约 1 万行 |
| Hermes stars | 约 200k（发布 <6 个月） |
| Py stars | 约 82k |
| Py 预构建工具 | 7 个（read/write/edit/bash/grep/find/ls） |
| Hermes 工具 | 100+ 个 |
| Hermes 技能 | 讲者先后提到 177 个 / 约 1000 个 |
| Py 压缩阈值 | 预留 16384 tokens |
| Py 保留最近 | 约 2000 tokens |
| Py 摘要结构 | 6 部分 |
| Hermes 摘要结构 | 11 部分 |
| Hermes 压缩触发 | 有效窗口 50% |
| Hermes 保留尾部 | 最后 20% |
| Hermes 失败地板 | 64000 tokens |
| Hermes 冷却时间 | 600 秒 |
| Token 估算 | 文本字符÷4；图像=4800 字符 |
| 子智能体并发上限 | Py=4，Hermes=3，Codex=4 |
| 子智能体深度 | Hermes=1，Claude Code=3 |
| 技能文件长度 | ≤500 行，引用深度 ≤1 层 |

---

*注：录音稿为中文机翻配音转写，部分专有名词（Py/Pai、Hermes、OpenClaw/Open Cloud、Claude、Gemini、MCP、REACT、YOLO、Typefully、Apollo、GLM、Kimi K3 等）与数字在转写中存在同音异译或前后出入（如 2000/20000 tokens、177/1000 技能），本笔记已尽量归并并标注，关键概念以讲者反复强调的口径为准。*
