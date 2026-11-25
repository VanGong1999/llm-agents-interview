https://www.youtube.com/watch?v=IGo225tfF2I

# 详细知识点总结：Agent Memory 与 Dreaming

以下按演讲结构逐章提炼知识点与关键细节。

---

## 第一章：Agent Memory 简介

- 演讲者 Ravi，Anthropic 平台 API Knowledge 团队负责人，去年加入 Anthropic，专注为 agent 构建与多种知识形态交互的 building blocks：context window、skills、files、web 内容等。
- 近期发布两个重磅功能：**Memory** 和 **Dreaming**，目标是让 agent 能跨任务学习、持续改进。
- 演讲结构：为什么 memory 重要 → 如何设计 → 收尾介绍 dreaming（新的前沿 memory 功能）。

---

## 第二章：Agent 原语的演进时间线

关键里程碑：

| 时间 | 发布 | 意义 |
|---|---|---|
| 2024 | MCP（Model Context Protocol） | 让模型以有原则的方式访问外部工具和数据 |
| 2025 | Claude Code + Agent SDK | 降低使用和构建 agent 的门槛 |
| 2025 下半年 | Skills | 通用抽象，可"螺栓式"附加新能力完成特定任务 |
| 上个月 | Cloud Managed Agents | 可靠运行 agent 的平台，处理困难部分 |

核心主线：**agent 能做的事越来越多，可运行的时间跨度越来越长**。2025 年 METR 研究指出：agent 能完成的任务时长**每 7 个月翻一番**。但长周期任务中的 context 管理仍是未解难题——这正是 memory 的用武之地。

---

## 第三章：理解 Memory 系统

**Memory 让 agent 学习**：把上一个任务的经验带到下一个任务。

- 无 memory 的基线情况：每个任务都从同一张白纸开始，性能持平。
- 理想情况：task1 → task2 → task3 性能逐级提升。
- 学习维度：任务与任务之间、环境与环境之间、agent 与 agent 之间。
- 可学习内容：通用策略、过去的错误、可用工具、代码库和文件。
- 可迁移性：学习成果可在 agent 之间转移——**"agent 蜂群共享并维护对组织的共同理解"**，这是愿景。

**Cloud Managed Agents 的 Memory 已发布**：
- 开箱即用地最大化智能的前沿 memory 系统。
- 支持多 agent 系统，具备企业级控制与可观测性。
- 与多个使用 managed agents 的团队合作构建，效果数据：
  - **Rakuten：生产环境 agent 首次通过错误率下降 97%**
  - **Wise Docs：在文档验证流水线中用跨会话 memory 减少了常见问题**
- 共同反馈：memory 原语让团队**专注做产品而非做基础设施**，同时收获更强智能。

---

## 第四章：Memory 架构设计

**Memory 并不全新，但对 agent 的做法已大幅进化。**

- 过去的做法：在 harness 层构建 memory 能力，如 Claude Code 的 `CLAUDE.md`、SDK 中的专用 memory 工具。
- 观察到的模式：**模型变强后，应该"给 Claude 让路"（get out of Claude's way）**——与 skills 的思路一致：skills 是极简格式、高度灵活，模型自己懂得如何操作。
- Memory 同样押注**文件（files）**方向。

设计依据的模型能力事实：
- Claude 擅长导航虚拟环境和文件系统。
- Claude 擅长使用 bash、grep 等熟悉工具读写、组织文件。
- **Opus 4.7**（上月发布）是文件系统型 memory 的 SOTA 模型，越来越能判断**哪些 context 对未来自己最重要**、该如何组织和表示。

因此 **memory 被建模为文件系统**。核心原则：给 Claude 让路，让它用自己已经很强的能力——"let it cook"。

---

## 第五章：多 Agent 的 Memory 管理

需求：多个 agent 同时在同一环境（或跨环境）运行，共享 memory。

新要求与设计：

1. **多会话共享同一 memory store**，且支持不同 scope：
   - **只读 scope**：如组织级 memory，更新不频繁，所有 agent 可访问。
   - **读写 scope**：更细粒度的 memory store，agent 可自由读写。
   - 由此形成**层级结构（hierarchy）**，使 memory 系统可扩展。
2. **冲突控制**：采用**乐观并发控制（optimistic concurrency control）**，避免一个 agent 覆盖另一个 agent 的写入。
3. **企业级控制**：
   - **版本控制**：创建审计轨迹，开发者可查看 memory 随时间如何演化、可做版本间 **diff**。
   - **归属（attribution）**：可看出哪个 agent 写了 memory 的哪一部分。
4. **独立 API**：memory 有 standalone API，开发者可在任何环境管理 memory；提供标准 CRUD 操作，以及企业级操作如**导出（export）和删除/脱敏（redaction）**。

---

## 第六章：Memory 处理层的精炼

Memory 架构三大组件：

1. **存储层**：数据如何管理、变更如何追踪。
2. **Memory 结构**：优化格式，让 Claude 最大化利用。
3. **Claude 驱动的处理**：如何更新 memory。

处理层细节：

- **Agent 边工作边写 memory** 是关键——类比"做事时记笔记"。
- 但扩展到复杂多 agent 工作流后，跨会话出现共性问题：
  - agent 倾向于**重复犯同样的错误**，且各自独立地从错误中学习；
  - 出现相同的低效模式；
  - 根本主题：**memory 以局部最优方式更新，而非全局最优**；
  - 部分场景出现**重复（duplication）和碎片化（fragmentation）**。
- 对策：过去几个月在处理层构建了**反馈回路（feedback loop）**，解决上述问题。

---

## 第七章：Dreaming 介绍

- **状态：research preview，可用于 managed agents。**
- 定义：一个**跨 agent、跨会话寻找模式和错误**、并**自动策展（curate）memory** 的过程。
- 效果数据：**Harvey 在法律 benchmark 上完成率提升 6 倍**。
- 流程：与 agent 完全**解耦**的反馈回路——agent 写 memory → dreaming 精炼 → 循环往复。
- **触发方式灵活**：临时手动、每晚、每小时，或由事件触发（如会话结束），全部通过 API 控制。
- 每次 dreaming run 的工作：
  1. 分析 session transcripts；
  2. 检查 memory 现有状态；
  3. 针对低效、犯错或需要改进指引的会话，提出 memory 优化方案；
  4. 输出一份**经验证、组织更好的 memory 快照**，agent 可选择采用。
- Dreaming 实现**持续自我学习**，为 memory 闭环。

**out-of-band（带外）设计的三大优势**：
1. **架构上适合多 agent 系统**：可跨会话、跨 agent 审视 transcript，识别单个 agent 孤立时难以发现的模式。
2. **专用 dreaming harness 带来更清晰的目标**：独立进程不存在"提升 memory 质量 vs 完成当前任务"的权衡，职责干净分离。
3. **零延迟**：完全不在 agent 的热路径（hot path）上。

---

## 第八章：组织级规模与知识

- 现状：有了可跨 agent、跨环境共享的健壮 memory 层（不再局限于特定任务），加上 dreaming 对 memory 做全局优化与调和。
- 结果：**面向组织记忆的、可扩展的 memory 系统**——规模和质量都能扩展。
- 核心心智模型：**共享且持续改进的 memory 提升每个 agent 的下限（raises the floor），dreaming 进一步抬高它。**
- 类比 **test-time compute**：让模型花 token 探索问题平均带来更好结果；dreaming 让 agent 前期花功夫策展出更高质量的 memory，为所有下游 agent 性能带来红利。
- **前沿 memory 系统的双支柱**：
  - 左：**Memory** —— 帮 agent 跨任务学习和记忆；
  - 右：**Dreaming** —— 验证、组织、丰富 memory。
  - Dreaming 是"今天的 memory"与"组织级 memory 与知识"之间的桥梁。

---

## 第九章：Memory + Dreaming 现场 Demo

场景：**SRE（站点可靠性工程）agent 平台**——处理告警和 page，为部分告警启动 agent 决定如何分诊和修复。

**Memory store 设计**：
- 一个**只读的组织级知识 store**：SLO 策略、runbook、on-call 映射等不常变但每个 agent 都需要的信息。
- 若干**任务专属的读写 store**。

**跨会话 memory 实例**：
- 某 agent 调查并定位了告警根因，提交修复，并在 memory 中记录"修复已在途（fix in flight）"。
- 后续会话读取共享 memory store，遇到类似问题时**已知修复在途**，可据此行动。
- 演讲者点评：这正是跨会话 memory 协调多 agent 的价值（他本人做过 SRE）。

**审计与历史**：可查看完整版本历史、切换版本、将写入归属到具体 session；配合乐观并发模型防止互相覆盖。

**Cloud Console 操作**：
- 查看底层 memory stores 列表及其中填充的文件。
- 进入 **Dreams 标签页**发起 dream：选择 team SRE memory store + 最近 7 天约 5 个 session，启动 dreaming。
- 可观察进度、5 个输入 session、正在编译的输出 memory store。
- **Dreaming 本身构建在 Cloud Managed Agents 之上**（"managed agents 的功能，建在 managed agents 之上"）：会并行启动一系列 sub-agent 分析 transcript，UX 与其他 managed agents 一致。
- 完成的 dream session 可查看 memory store 更新的 **diff**。

**Demo 中发现的具体模式**：跨会话跨 agent 反复出现"**CPU 飙升后 60 秒触发告警**"的模式 → dreaming 推断可能与 retry 行为有关 → 写入 memory，使下一个遇到该模式的 agent 能以更整体的方式更新分诊日志，而不是简单记录所有事件的流水账。

---

## 第十章：结论与行动号召

- Demo 展示了如何构建一个用 memory + dreaming **自我改进**的生产级 agent。
- 今年将是重要一年：agent 将运行**数天级**的超长时间跨度；持续构建并改进对周围世界的理解，是解锁该能力的关键，memory 系统是其中的重要部分。
- 行动号召：去试用，期待看到大家的构建；会后可在场外继续提问。

---

## 核心要点速记

1. **Memory = 文件系统**：给模型让路，用其已有的文件系统与 bash/grep 能力（Opus 4.7 是文件系统 memory 的 SOTA）。
2. **层级化 scope**：组织级只读 + 任务级读写；乐观并发控制防冲突；版本控制 + 归属 + 独立 API（含 export/redaction）。
3. **处理层的痛点**：局部最优导致重复、碎片化、重复犯错 → 用反馈回路解决。
4. **Dreaming = 带外的全局 memory 优化器**：跨会话找模式、自动策展、输出可采纳的快照；解耦带来多 agent 视野、目标纯粹、零热路径延迟。
5. **效果数据**：Rakuten 首过错误率 -97%；Wise Docs 减少常见问题；Harvey 法律 benchmark 完成率 6×。
6. **愿景**：共享且持续改进的组织级 memory 抬高所有 agent 的下限，dreaming 是通向组织级知识记忆的桥梁。