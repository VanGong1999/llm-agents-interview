https://www.youtube.com/watch?v=RtywqDFBYnQ

# Memory and dreaming for self-learning agents

# 《Agent Memory 导论》完整知识点总结

这是一份 Anthropic 平台团队产品经理 Mahes 的演讲实录，主题是 **Agent Memory（智能体记忆）** 以及新产品 **Dreaming**。以下按章节梳理全部知识点与细节。

---

## 第一章：Agent Memory 导论

**背景与定位**
- 演讲者 Mahes 是 Anthropic 平台团队产品经理，过去一年半参与过 MCP、Skills 等原语（primitive）的建设。
- 他认为 **memory 是下一个最重要的原语**，也是他最兴奋的方向。
- 本次发布：**Dreaming**，一个全新产品，在 managed agents API 中以 research preview 形式上线。

**为什么现在做记忆**
- 过去两年模型能力快速提升，agent 能处理耗时数小时甚至接近数天的任务。
- 随着模型和 agent 变强，Anthropic 持续构建更高层的原语，让模型"让路"、获得更多环境访问能力并随时间变强：
  - **MCP**：让 agent 访问外部工具和数据。
  - **Harness（如 Claude Code、Agent SDK）**：强大的运行框架。
  - **Skills（10 月发布）**：让 agent 获得全新能力，这些能力可由其他 agent 或人类设计并共享。
- 每个原语都让 agent 能更长时间地做更强的事，但**仍有一个未解决的问题：长周期任务中的持续自我学习与上下文管理**。

---

## 第二章：记忆在 Agent 中的作用

**记忆是下一个原语**
- 记忆将带来**能基于任务和经验自我进化、自我改进的自学习 agent**。

**Agent 通过记忆能学到什么**
1. **关于任务**：成功标准、常见错误、有效/无效策略。
2. **关于环境**：交互的代码库、需要持续更新的文件和资产。
3. **关于其他 agent**：在同一环境中共享学习成果，发现系统中其他地方出了什么问题并纳入自己的记忆。

**多智能体系统愿景**
- 演讲者最兴奋的点：**自管理记忆（self-managed memory）** 在大型复杂多 agent 系统中至关重要——一群在同一环境、处理离散任务的 agent 会随时间**构建自己对所处世界的理解/世界模型**。

**Claude Managed Agents 中的 Memory（公测）**
- 几周前上线 public beta，提供开箱即用的前沿记忆系统：
  - 默认最大化智能（maximize intelligence by default）；
  - 支持同一环境下大量并发 agent；
  - 给企业和开发者生产环境所需的灵活性与控制力。
- **客户案例 Rokt（Rockutin）**：内部知识 agent 的"首次即错"（first-pass mistakes）下降 **90%**；agent 能捕获错误并分享给下一代 agent，同时带来更好的 token 效率、更低成本和更低延迟。

---

## 第三章：记忆系统的设计

**核心需求一：默认最大化智能**
- 记忆系统演进史：
  - 约一年半前随 Claude Code 推出 **CLAUDE.md**：受限的早期记忆，agent 和用户都可在同一记忆文件里留笔记。
  - SDK 中的 **memory tool**：规格明确的工具调用，有特定参数和输出格式。
- 随着 agent 变强，Anthropic 倾向于**少约束、把决策权交给 Claude**。
- 借鉴 Skills 的思路：既然 agent 能管理虚拟环境和自己的文件系统，记忆也可以如此。
- **设计结论：把记忆建模为文件系统**——一系列有特定层级和格式的文件，Claude 可自行管理和更新，用熟悉的 **bash 和 grep** 工具维护组织、随任务不断调整。
- 这与最新模型 **Claude Opus 4.7**（上月发布）的表现一致：它在**基于文件系统的记忆**上达到 SOTA——更擅长判断什么内容值得记、什么结构合适（拆成几个文件、如何在文件系统内组织），且仅靠 bash 和 grep 工具完成。

**核心需求二：随多 agent 系统扩展**
- 现状：已有用户同时跑 10–15 个 Claude Code 会话；企业中（包括 Anthropic 自身）有数百甚至数千个 agent 并行，共享同一份状态和记忆。
- 由此产生两个特性：
  1. **权限范围（permission scopes）**：agent 可在不同记忆库间混搭权限。例如对组织级知识库（最佳实践、runbook）**只读**，对另一个存储工作记忆的库**读写**（更具体、更新更频繁）。
  2. **并发（concurrency）**：数百/数千 agent 同时操作同一记忆状态时，不能互相覆盖。实现了**乐观并发（optimistic concurrency）**——agent 用**内容哈希（content hash）** 在更新前检查是否会覆盖其他 agent 的写入。

**核心需求三：企业与开发者控制（生产环境最关键）**
1. **版本历史（version history）**：开发者可看到每次记忆更新的完整审计日志；未来也可让 agent 访问同一审计日志以追踪变更。还有**归因元数据（attribution metadata）**：哪个 agent、什么时间、哪个会话做了哪次具体修改，粒度极细，可预测且受开发者控制。
2. **独立 API（standalone API）**：很多客户在 managed agents 之外构建定制系统来管理/策展记忆——如 **PII 扫描**确保敏感内容不入库、用独立流水线清理记忆、克隆到外部系统。因此提供**可移植 API**，避免锁定。

**前沿记忆系统的分层图景**
- **存储层（storage layer）**：数据实际存放处，以及附带的元数据和归因数据。
- **结构与内容层（structure & content layer）**：如"把记忆建模为文件系统中的文件"的决策；Skills 作为一种**程序性记忆（procedural memory）**，用轻量 spec 说明如何学会新能力。
- **过程层（process layer）**：记忆多久更新一次、什么触发更新、依据哪些来源决定改什么、学什么。

**Agent Memory API 的局限（促成 Dreaming）**
- 在多 agent 系统中发现：
  - 某些会话**错过了其他 agent/会话已经学到的经验**；
  - 同一环境中多个 agent 存在**共同错误和共享模式**；
  - 大规模记忆库的维护**不够高效、不够整体**，agent 被隔离在自己的具体任务里。
- 过去几个月试验了多种补充流程，最终选定一种：**Dreaming**，今日在 managed agents API 中 research preview 发布。

---

## 第四章（原文第五章）：Dreaming 介绍

**定义**
- Dreaming 是一个**批处理、异步**的流程，独立于具体会话/任务之外运行。它扫描近期 agent 会话及其 transcript，寻找**模式和错误**，自动产出**有条理、最新的记忆内容**。

**使用方式**
- 可通过 Console 或 API **周期性触发**（类似 cron），也可通过 API 接入现有流程。
- 例：有些客户在 agent 完成任务、准备下线时触发 Dreaming，把经验保存进记忆状态。

**工作流程**
- 全面扫描近期 transcript，找出常见错误（如大量 agent 都出现的失败工具调用）、有效策略，找到更新记忆状态的机会。
- 产出更新后的记忆状态，可**立即应用**到记忆库，也可经 API 做**人工审查/检查**后再应用。

**目标**
- 实现**持续自学习与自我改进**：第二天的 agent 自动基于前一天的经验变得更好。

**早期测试案例**
- **Harvey** 在一个法律基准（贴近真实法律场景）中部署 Dreaming，某个法律场景的**任务完成率提升 6 倍**。

---

## 第五章（原文第六章）：为什么 Dreaming 重要

**设计视角一：Out-of-band（带外）**
- 相比之前的记忆 API，Dreaming 发生在 agent 处理具体会话/任务的上下文**之外**。
- 好处：
  1. **非常适合多 agent 系统**：单个 agent 读写记忆时只有自身、自身上下文和任务的视角；Dreaming 能**站高一层、同时看多个 agent**，发现单个 agent 因视角受限而注意不到的共享模式和经验。
  2. **Harness 设计原则**：agent 开工时需要**清晰独立的目标**。Dreaming 把"记忆质量"这一新目标**分离出来**——未来记忆对 agent 产出会越来越关键、越来越承重（loadbearing），因此把记忆质量目标与任务完成目标解耦。
  3. 因为是后台带外流程，**不给现有任务的热路径（hot path）增加任何延迟**。

**设计视角二：大规模记忆系统与算力利用**
- 现状：多数记忆部署局限于特定用户、任务或小团队。但 agent 系统正快速走向企业级——Anthropic 及合作企业已有数百/数千并发 agent 共享状态。
- 这实际上让记忆库变成**大型知识库**，而非简单的任务工作上下文存储。
- 需要让 Claude 把记忆系统扩展到超大、同时保持**新鲜、最新、不过度消耗 token**。Dreaming 通过类似**扩展定律（scaling laws）** 的方式实现：用**额外算力和额外投入**维护记忆系统的组织性。
- 两个类比：
  1. **Test-time compute / 思考模型**：给模型更多 token 去探索尝试，最终任务结果更好；Dreaming 让 dreaming agent 花更多 token 把系统组织得井井有条。
  2. **搜索系统**：前期投入产出高质量、最新的索引，检索时高效获得最新结果。Dreaming 就是**预先建索引并持续策展**，让所有下游 agent 受益，把这份投入**摊薄（amortize）** 到所有读取该记忆库的 agent 上。

---

## 第六章（原文第七章）：Memory 与 Dreaming 的实践

**整体图景（前沿记忆系统）**
- **Memory（左侧）**：原语，让 agent 在任务中**实时读写、即时记忆**。
- **Dreaming（右侧）**：建立在其上的综合流程，**验证记忆状态、组织它、并用 agent 一天工作中产生的信息丰富和回填（backfill）它**。
- Dreaming 是**中间态记忆系统与大规模知识库之间的桥梁**。

**Demo 场景：SRE agent**
- 一个 SRE agent 监控告警并反应，按需拉起具体 agent 做分诊（triage），有时拉起 agent 提交 PR。
- 每个 agent 配有几个记忆库：
  - **组织级知识库**：**只读**，含 runbook、SLO 指南、指向需要联系的负责人；不常更新，不希望 agent 随意改动。
  - **SRE 记忆库**：**读写**，SRE agent 可随反应和环境学习不断修改。
  - 还有 **codebase 记忆库**。
- **演示流程**：
  1. dispatch 服务发来 P1 告警，拉起 SRE agent 调查：查 CPU 利用率、流量模式、近期部署的 PR。
  2. 它把发现**写入 SRE 记忆库**（新的 diff 更新）。
  3. 几分钟后同一告警再次触发，另一个 SRE agent 启动、访问同一记忆库，**首先看到上一条笔记**："我们已经做过这个调查，发现如下，你可以这样短路（short circuit）"。于是节省大量重复调查时间——**立竿见影的 token 效率提升和智能提升**。
- **企业可靠性**：点进记忆库可见**版本历史**（每次更新记录），可**回溯时间**看改了什么、**哪个 agent** 写的、**何时**写的，还有**前置条件哈希（precondition hash）**，即乐观并发的基础——"我做了这个改动，先验证内容确实是它再覆盖"。

**Dreaming Demo 流程**
- 转到 Claude Console（与 API 状态完全一致），进入 team SRE 记忆库的 **Dreaming 标签页**。
- 发起 dreaming job：指定要更新的记忆库、选择**过去 7 天**内接触过该库的会话。
- 运行中可见：输入会话列表、逐个查看 transcript 条目、**拉起多个子 agent** 分头阅读 transcript、识别经验、产出更新后的记忆状态。
- 完成后产出 **diff**（一组待应用的更新文件），包括：
  1. **更新 dispatch 延迟笔记**：发现大量 agent 都是在上游 CPU 尖峰后**恰好 60 秒**被触发，推断可能存在低效的 retry 逻辑导致分诊浪费时间——**单个 agent 各自都没注意到这个跨会话模式**，Dreaming 留下笔记让未来 agent 更高效。
  2. **去重与策展**：把此前 agent 写入的 **5 条重复条目合并为 1 条**。
  3. **删除过期条目**：transcript 中显示已不再有效的旧条目被移除。
  4. **添加验证笔记**：说明"基于我看过的 transcript，此时该记忆是准确的、已验证，明天可放心使用"。
- 即 **验证回填 + 组织** 步骤，正是 memory + dreaming 的价值所在。

---

## 第七章（原文第八章）：结语

- 演示展示了如何用 managed agents API 中的 **memory 和 dreaming API** 构建生产级 agent。
- 展望：未来几个月将出现**连续运行数天、数小时**的 agent，**记忆是让这一切成为可能的关键部分**。
- 鼓励大家立即上手 memory 和 dreaming。

---

## 关键术语速查

| 术语 | 含义 |
|---|---|
| Primitive（原语） | 提供给 agent 的基础能力层，如 MCP、Skills、Memory |
| CLAUDE.md | 早期受限记忆形式，agent/用户可留笔记 |
| Memory tool | SDK 中规格明确的记忆工具调用 |
| 文件系统式记忆 | 用 bash/grep 管理层级化记忆文件，Claude Opus 4.7 在此达 SOTA |
| Permission scopes | 对不同记忆库的只读/读写权限混搭 |
| Optimistic concurrency | 用内容哈希校验后再写入，防止并发覆盖 |
| Version history / attribution | 完整审计日志 + 谁/何时/哪个会话改了什么 |
| Standalone API | 可移植 API，支持 PII 扫描、外部清理、克隆等 |
| 三层架构 | 存储层 / 结构与内容层 / 过程层 |
| Dreaming | 带外、异步、批处理的记忆整合流程，扫描 transcript 找模式与错误，产出更新后的记忆 |
| Out-of-band | 独立于任务热路径之外运行，零延迟开销 |
| Amortize | 把建索引的算力投入摊薄到所有下游读取 agent |
| 验证回填 | Dreaming 验证记忆准确性并回填验证笔记 |