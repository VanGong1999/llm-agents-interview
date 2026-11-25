https://www.youtube.com/watch?v=geUv4CjPpxI

# Chapter 1: Introduction to Agent Memory — 详细知识点总结

## 一、课程概述与核心问题

**讲师**：Kevin（Anthropic 工程师）

**核心问题**：当前 Claude Managed Agents 平台上的 agents 是**孤立的（isolated）**——agent 不记得过去的信息，也不向未来会话传递信息，这严重限制了它们在真实工作流中的实用性。

**解决方案**：引入两个新概念——**Memory Store（记忆存储）** 和 **Dreaming（ dreaming 异步整理）**。

---

## 二、基础概念：Agent Environment、Session、Memory Store、Dream

### 1. Agent Environment（代理环境）
之前工作坊已介绍的概念，agent 运行的环境。

### 2. Session（会话）
- 通常是一次对话线程，**通常是短暂的（ephemeral）**
- 是 agent 运行的隔离实例
- 大多数情况下一次只创建一个 session，彼此隔离

### 3. Memory Store（记忆存储）
- **持久化的、类似文件系统的存储**（persistent file-system-like store）
- 作为资源附加到 session 上
- 让 agent 能够**跨会话读写信息**
- 底层以**文件系统**形式挂载到 session 容器中，模型有读写工具
- 为什么用文件系统接口：因为对模型来说这是非常强大的接口——可以用 **bash** 探索文件系统、用 **grep** 搜索关键词、读文件等

### 4. Dream（做梦/异步整理任务）
- **异步后台任务**（asynchronous job running in the background）
- 输入：一个 input memory store + 一组之前的 session（以 transcript 形式表示）
- 运行一个 **harness**（多 agent 编排框架）来提炼原始 agent 可能遗漏的新信息
- 功能包括：
  - **事实核查（fact-checking）**
  - **丰富细节**（日期、特定标识符等）
  - **组织和整合信息**
  - **去重**
  - 防止 memory store 无限增长

---

## 三、问题演示：Session 孤岛（Session Silos）

### 实验步骤（Base Case）
1. 运行 bootstrap 脚本，创建 seed 信息：一个 agent、一个 environment、几个之前的 session（关于 day one keynote 和之前工作坊）
2. **创建 Session A**（标题 "write test with no memory"），发送一条用户消息，告知 CMA talk 的信息（关键词：multi-agent orchestration、outcomes in memory，以及一个笔记 URL）
3. Agent 回复："好的，谢谢告诉我这些信息"——**没有做任何持久化**
4. **创建 Session B**（recall test），询问刚才告知的信息
5. Agent 回复："我没有访问这些信息"——**信息没有跨会话传递**

**结论**：在基础情况下，session 之间完全不传递信息。

---

## 四、Memory Store 的创建与使用

### 1. 创建 Memory Store
- 主要参数：**name**（如 "CWC memory"）、**description**
- 在 Console 中可在 **Manage Agents → Memory Stores** 下查看
- 状态显示为 **active**
- 可点击进入，查看文件系统视图
- 支持**手动添加记忆**（在特定路径下创建文件、添加内容）

### 2. 两个额外参数（挂载到 session 时）
- **prompt 参数**：引导 agent 读写特定信息（例如投资 agent 可指定关注特定领域）
- **access 字段**：默认为 **read-write**，可改为 **read-only**（session/agent 只能读，不能更新）

### 3. 在 Session 中使用 Memory Store
- 在 sessions API 请求中传入 **memory store ID**
- 演示：创建带 memory store 的 session，发送相同信息
- 观察到的行为变化：
  - 模型首先查看 memory，检查是否有需要记住的内容
  - 由于 memory 为空，模型**将内容保存到 memory store**
  - 保存在 `sessions.mmd` 文件中
  - 模型会告知用户它做了什么

### 4. 回忆测试（Recall Test）
- 创建新 session，使用**同一个 memory store**
- 询问"从 CMA talk 中学到了什么"
- 模型首先查看 memory store
- 使用 **grep** 搜索关键词 "CMA"
- 找到之前 session 写入的信息，成功回答问题

### 5. 其他 Memory Store 功能
- **列出所有 memory 文件**（CLI/API）
- **版本控制**：每次修改文件都会创建新版本，提供相应 endpoints
- **Console UI 文件系统查看器**：可看到 Claude 创建的子目录结构
- **直接编辑 memory 文件**：可修正错误或添加信息
- **手动添加记忆**

---

## 五、Dreaming（异步整理）

### 1. 为什么需要 Dreaming
- Agent 长期读写 memory store 后，会**不断倾倒信息**（每次任务都记录）
- Memory store 会**无限增长**
- 之前没有流程来：组织记忆、检查过时信息、整合重复内容

### 2. Dreaming 是什么
- **批处理异步任务**（batch process, asynchronous）
- 通过 API 或 Console 启动
- 运行一个**多 agent 编排的 dreaming harness**
- 输入：
  - **input memory store**（要整理的记忆存储）
  - **一组 session IDs**（transcript，可能丰富记忆存储）
- 功能：
  - 遍历每个 session
  - 事实核查
  - 丰富细节（日期、特定标识符）
  - 组织 memory 文件
  - 去重
  - 修复问题
- 输出：**output memory store**（未来附加到新 session 可提高检索效率和 agent 智能）

### 3. 创建 Dream Job
- **模型选择**：Claude Opus 4.7 或 Sonnet 4.6（根据质量需求和 token 成本选择）
- **两个输入**：memory store + session IDs 列表
- 可一次 dream 10、20 个 session，最多到 100 个（计划进一步扩展）
- **可选额外指令**：自定义 prompt，例如要求重点回填特定细节、指定文件组织结构

### 4. Dream Job 运行与监控
- 在 Console 的 **Manage Agents → Dreams** 下查看
- 状态：pending → running
- 显示 input memory store 和 **token 计数**（实时更新，可跟踪进度）
- 运行时间：几分钟到几小时（取决于 transcript 大小/数量）——这正是异步的好处，不应在 agent 工作时实时运行
- **可观测性**：dreaming 直接构建在 Claude Managed Agents 原语之上，会为 dream job 创建 session，可点击查看 dream 在做什么、查看 prompt
- **架构**：orchestrator 负责启动 sub-agents，**每个输入 session 对应一个 sub-agent**，每个 sub-agent 有系统 prompt 告诉它做什么；orchestrator 确保所有 agent 运行并调度

### 5. 非破坏性（Non-destructive）
- **不触碰 input memory store**
- 将 input memory store **克隆**为 **output memory store**
- Dream job 写入新的 memory store，所有编辑都是非破坏性的
- 未来可将 output memory store 用于新 session

### 6. Dream 完成后的输出
- Console 显示 **diff**（做了什么改动）
- 创建了 **index 文件**：包含 slug，引用未来 agent 可能需要的各种 memory 文件——未来 agent 看 index 文件比做广泛 grep 更高效
- 添加了原始 session 中不存在的信息：例如 **event logistics 文件**（Code with Claude 完整日程、人名、day two 日程）
- 重新格式化了之前 session 创建的 memory 文件：添加 slug、事件描述、元数据、更多细节
- **设计理念**：agent 工作时很难预测未来需要什么（预测问题很难），所以多写细节对未来 agent 有好处；Dreaming 可以随时删除不再需要的内容

### 7. Human-in-the-loop
- 可在 output memory store 中人工审查 dreaming harness 是否犯错

### 8. 使用 Dream 输出进行未来 Session
- 通过 dream ID 获取 dream 资源，查询 JSON 得到 **output memory store ID**
- 创建新 session 时使用 output memory store
- 询问："我参加了哪些 session、有哪些资源链接、标记了哪些 follow-up"
- 观察到：模型先读 **index**，然后直接去 **sessions 文件**，也检查 event logistics
- 结果：信息丰富得多——所有参加过的 session 的回顾、day two 计划 session 的时间戳、资源链接

### 9. 退役旧 Memory Store（可选）
- 如果对 output memory store 满意，可**retire 旧 memory store**
- 不影响之前的 session
- 目的：将组织中的 memory store 数量保持在合理水平

---

## 六、三层可组合架构（Three Composable Layers）

| 层级 | 说明 |
|------|------|
| **Session** | agent 运行的隔离实例，通常一个对话线程，通常是短暂的 |
| **Memory Store** | 增强 session，跨多个 session 连接信息 |
| **Dreaming** | 随时间组织、丰富、改进 memory store，使规模化时记忆保持在合理、可管理的水平，检查过时信息确保最新 |

---

## 七、Token 使用与成本（Q&A 要点）

- 设计上 dreaming **刻意追求详尽（exhaustive）**，所以预期会使用大量 token
- 好消息：大部分处理是 agentic 的，**大部分 token 被缓存**，预期约 **95% 缓存命中率**
- 正在探索降低成本的方式：
  - 类似 **Batch API**，通过在不同时间调度提供 **50% 折扣**
  - 切换模型
  - 更多 steering prompt
  - 提供 token 预算控制

---

## 八、总结（Recap）

1. **问题**：大多数 agent 面临的核心问题——如何跨 session 记住信息
2. **Memory 是第一步**：给 agent 一个可以倾倒和读取信息的地方
3. **新问题**：memory store 会无限增长、变得杂乱、信息过时
4. **Dreaming 缓解此问题**：用另一组 agent，其全部工作就是为未来使用改进 memory store

**目标**：学员能将 memory 集成到自己的用例中。

---

## 九、关键细节速查

- **Memory Store 本质**：文件系统挂载 + bash/grep/读文件工具
- **Access 控制**：read-write（默认）/ read-only
- **版本控制**：每次修改生成新版本
- **Dream 模型**：Opus 4.7 / Sonnet 4.6
- **Dream 输入**：memory store + session IDs（最多约 100 个）
- **Dream 输出**：克隆的 output memory store（非破坏性）
- **Dream 架构**：orchestrator + 每 session 一个 sub-agent
- **Dream 产出**：index 文件 + 丰富后的 memory 文件（slug、描述、元数据、额外细节）
- **缓存命中率**：约 95%
- **成本优化**：Batch API 式 50% 折扣（探索中）
- **三层架构**：Session（短暂）→ Memory Store（跨会话）→ Dreaming（随时间优化）