https://www.youtube.com/watch?v=9ta1cawyVsU

# Agentic Memory Part 1: What is Agentic Memory & Types

# 《Chapter 1: What is Agentic Memory & Why Agents Need It》完整知识点与细节提取

---

## 一、开篇：为什么需要 Agentic Memory

### 1.1 核心论点
- Agentic Memory（智能体记忆）对提升 AI Agent 的**性能、可靠性、可用性**至关重要。
- 没有记忆，AI 就只是内容生成器，无法成为编码伙伴、视频生成器，也无法融入人类生态系统和工作流。

### 1.2 ChatGPT 演示案例
- **短期记忆示例**：告诉 ChatGPT "我叫 Dish，我在学 agentic AI"，随后问"我叫什么、在学什么"，它能答出"你叫 Dish，在学 agentic AI"——这是短期记忆。
- **长期记忆示例**：在一个很长的对话中问"我的第一条消息是什么"，它能检索出更久远的信息——这是长期记忆。
- **结论**：记忆是对话流畅性的基础；没有记忆就没有对话的"流"。

---

## 二、基础 Agentic Loop（智能体循环）

### 2.1 标准工作流
- 用户 → AI Agent（LLM）→ 工具（如数据库检索）→ 上下文（context）→ 响应返回用户。
- 示例：HR 政策 Agent，用户问"假期政策是什么"，LLM 判断这是 HR 相关请求 → 调用工具 → 工具从数据库返回假期政策信息（即 context）→ AI 基于可信来源给出准确回答。

### 2.2 系统指令（System Instructions）
- 后台给 AI 的指令，如"你是 HR 政策助手，只用数据库回答问题，回答不超过 300 词"。
- 这些是 prompt engineering，让 AI 记住"自己是谁""如何行为"。

### 2.3 四种消息类型（关键基础）
| 消息类型 | 含义 |
|---|---|
| **User Message（用户消息）** | 用户给 AI Agent 的查询/提示（如给 Lovable 的建站 prompt） |
| **System Message（系统消息）** | 内部给出的指令，即 prompt engineering，规定 AI 行为方式 |
| **Tool Message（工具消息）** | 从外部工具/功能检索到的上下文信息（如数据库返回的假期政策） |
| **AI Message（AI 消息）** | 返回给用户的响应 |

### 2.4 Turn（轮次）的概念
- **一个 Turn = 一次完整循环中产生的所有四类消息**（user + system + tool + AI message）。
- 第一个问题（假期政策）= Turn 1；第二个问题（休假政策）= Turn 2，循环重新运行。
- **关键**：Agentic Memory 中 AI 记住的不是单条消息，而是**以 Turn 为单位**的记忆——既要记住用户说了什么，也要记住指令是什么、工具信息是什么。

### 2.5 记忆的存储形式
- AI Agent 的"大脑"旁有"记忆"，维护一个 **Turn 列表**（Turn 1, Turn 2, Turn 3...），这些 Turn 构成大脑的 context。

---

## 三、Stateful（有状态）与人类记忆类比

### 3.1 人类是 Stateful 的
- 导航类比：从 X 到 Y 的旅程有多个转弯，你能记住"该右转"是因为你记得从哪来、要到哪去。
- 人类被称为 **stateful（有状态的）**，研究范式努力让 AI Agent 也变成 stateful。

### 3.2 为什么 AI 必须 Stateful——编码助手案例
- GitHub Copilot、Claude Code、Google Antigravity、Codex 等编码助手，输入不只是文本/图片，而是一个**文件夹**（可能有 1000 个文件）。
- AI Agent 必须跨 1000 个文件维护记忆。
- 人类记不住"哪个文件哪一行写了什么"，所以维护 **README 文件**作为记忆索引——这就是人类发展出的记忆维护技术。

### 3.3 Context Engineering（上下文工程）的引出
- 维护记忆、保持记忆新鲜的技术叫 **context engineering**。
- **与 Prompt Engineering 的区别**：
  - Prompt Engineering：指示 AI Agent 应如何行为。
  - Context Engineering：管理 AI Agent 如何在单/多 Agent 间维护记忆。
- **为什么重要**：若记住 1000 个 Turn，token 成本会爆炸，且到第 1000 轮时早期 Turn 会被遗忘（信息太多，程序记不住）。Context engineering 就是高效管理这些信息、防止记忆爆炸的技术。

---

## 四、记忆类型的历史演进（30+ 种技术）

- 目前已有**基于图的记忆（graph-based memory）**等最先进方式，但必须先理解历史与基础，才能理解当前 SOTA 系统并创新。
- 现有 30+ 种记忆技术，需要全部了解并可组合成**混合（hybrid）方案**。

### 4.1 推荐研究论文
1. **《Memory in the Age of AI Agents》**（2026 年 1 月 13 日发表）：从零覆盖 LLM-based agent system、flat memory、hierarchical memory、基准测试等完整基础。
2. **《Magma: A Multi-Graph Based Agentic Memory Architecture for AI Agents》**（2026 年 4 月 16 日发表，很新）：涉及 agentic LLM retrieval、prompt update、动态演化记忆、intent-aware router、adaptive topological retrieval、semantic/entity、vector database 的角色等——不理解历史就看不懂这些。

---

## 五、无记忆（No Memory）的问题——Demo 演示

### 5.1 机制
- 早期 AI Agent 只有"大脑"和"工具"，没有记忆概念。
- 每条消息直接给大脑，响应直接生成；**追问（follow-up）无法回答**。
- 每次新查询都是孤立的：只有一条 system message + 一条 user message，新消息与旧消息完全隔离。

### 5.2 Demo 表现（Agent 名 Nova，用户 Maya）
- 说"Hi, I am Maya" → 回复"Hi Maya, lovely to meet you"。
- 问"What is agentic AI" → 正常回答。
- 问"What's my name?" → "We haven't had a complete chance to introduce ourselves properly"——**无法回忆**。

### 5.3 指标观察
- 3 次 API 请求（LLM 被调用 3 次）。
- 243 tokens 输入、108 tokens 输出，显示成本（Demo 用免费 Groq API，成本低；不同模型成本不同）。
- **最坏之处**：消息一发出、响应一给出，立刻遗忘。
- **最好之处**：免费、即时，无需存储/管理/支付记忆成本。
- **业务后果**：编码 Agent 无法"撤销之前的修改"——它不记得做错了什么，就无法纠正，只能当"编码顾问"而非"编码 Agent"。

---

## 六、七种基础记忆类型（逐一详解）

### 6.1 Conversational Buffer Memory（对话缓冲区记忆）
- **原理**：一句话——把所有 Turn 一条条堆积保存在列表（buffer = 列表）中，完整保留历史。
- **Demo 表现**：能记住名字 Maya、猫名 Whiskers 等所有信息，完美回忆（perfect recall）。
- **问题**：Turn 不断增加 → **成本指数级上升**（无逻辑地倾倒历史）；100 Turn 后响应变慢、可能混乱/幻觉；付费 API（OpenAI/Claude）成本"next level"。
- **内部存储**：system → user → AI → user → AI……每条 user/AI 消息每次都传递。
- **优点**：永不遗忘、完美回忆。
- **缺点**：越用越慢、越来越贵。

### 6.2 Sliding Window Memory（滑动窗口记忆）
- **原理**：仍保存对话，但设**阈值/窗口大小**（如 5 条消息），超出后最旧消息被**evict（逐出）**。
- **Evict vs Delete 的区别**：evict 是逐出游戏（如 Big Boss 淘汰），不删除——数据仍存数据库（用于 UI 展示），只是不再进入上下文。
- **Demo（窗口=2）**：
  - "Hi, my name is Dish, salary 30,000" → 记住。
  - 问 salary → 记得 30,000。
  - 说"I save 500 every month" → 第 3 条消息进入，第 1 条被逐出；仍记得 salary 和 saving。
  - 问"What is my name?" → "I don't think we have discussed your name"——**名字已丢失**。
  - 问"What is the first thing I asked?" → 只记得 salary 相关（仍在窗口内）。
- **优点**：便宜、快速，成本不随对话长度增长。
- **缺点**：窗口外的信息**完全丢失**，即使很重要（如生成投资计划时 salary 信息已不在窗口）。
- **适用**：需要严格控制成本的场景。

### 6.3 Summary Memory（摘要记忆）
- **原理**：不保留原始对话，而是维护一份**持续更新的摘要（running recap）**。每条新消息产生后，将"当前摘要 + 新对话"再摘要成新摘要。
- **Demo 表现**：能记住名字 Maya、宠物 Whiskers、爱好足球等要点。
- **内部机制**：每轮只有"新用户消息 + 之前摘要"；摘要由 AI Agent 生成，因此**每轮需 2 次 API 调用**（一次回答、一次生成摘要）。
- **优点**：用几句话容纳超长对话的要点（如千页书浓缩成一页）；控制 token。
- **缺点 1——信息丢失**：压缩信息时，**摘要权在 AI 手中**，AI 认为不重要的细节会被丢弃。
- **缺点 2——Context Echo（上下文回声）**：若用户 100 句中有 70 句提到 football，摘要中 40-50% 词汇都是 football，导致重要细节被淹没。

### 6.4 Summary Buffer Memory（摘要缓冲区记忆，混合方案）
- **原理**：Summary Memory + Conversational Buffer Memory 的**混合**。保留最近几条消息的原始记录（buffer），较老的消息做摘要；当 buffer 满时，将整段对话摘要并与旧摘要合并。
- **Demo 表现**：最近 3 个 Turn 保留原文（user/Nova 交替），更早的 Turn 被摘要（如"两点对话合并成一句 8 tokens"）；既能记住近期细节（名字、猫名），也能保留长期要点。
- **优点**：短期细节（buffer）+ 长期要点（summary）；对预算有控制；比单一技术更难预测和调优（一种权衡）。
- **缺点**：若摘要变得很长（2000、10000 词），成本上升、预算控制失效、可能出现幻觉。

### 6.5 Token Buffer Memory（Token 缓冲区记忆）
- **原理**：与 Sliding Window 相同，但**以 token（词数）而非 Turn 数**为限制单位。超过 N 个 token 就逐出最旧内容。
- **Demo（窗口=50 tokens）**："Hi my name is Maya" 占 34 tokens（含 system prompt）；继续对话填满后，问名字 → "Unfortunately, I don't have that information"。
- **设计动机**：滑动窗口按 Turn 计数，小消息和大消息都算一个 Turn，token 利用不高效；按 token 计数可精细控制——小消息省 token，大消息多占 token；还可通过系统指令（如"回答不超过 200 词"）把回答控制在 token 窗口内。
- **优点**：相对滑动窗口更高效的省钱方式。
- **缺点**：丢失重要近期上下文；完全没有长期记忆。

### 6.6 Vector Store Memory（向量存储记忆）
- **原理**：消息（用户输入与响应）直接存入**向量数据库**；新查询到来时，按**相似度**检索最相关的历史记忆（类似 RAG 用于记忆）。
- **动机**：滑动窗口 evict 的消息仍存在数据库里（为 UI 展示），既然是"浪费"，不如利用起来。
- **向量化示例**："I am a cat" → 向量 [0.8, 0.9, 0.7]；问"Who is Dish"时检索最相似句子；问 cat 相关时 cat 排第一。
- **Demo 表现**：问"first programming language" → Python 相关记忆排前二；问"cheetah" → 速度相关记忆排前；展示"raw memory context"（仅输入）与"relevant memories"（检索结果）。
- **优点**：**记忆游戏中最便宜的方案**——无需维护摘要或 buffer，向量数据库成本友好；是近期所有 memory store 的常见组件。
- **缺点**：仅靠相似度检索，缺乏结构化；通常需与 buffer 等结合成 hybrid。

### 6.7 第三种混合方案（Vector + Summary + Buffer）
- 新查询到来 → 在向量数据库搜索相似查询 → 检索到的信息**先摘要** → 再连同摘要上下文交给 AI Agent → 生成响应。
- 要点：所谓"创新"往往只是**把不同技术组合起来**，哪个有效就用哪个。

### 6.8 Entity Memory（实体记忆）
- **原理**：源自古老 NLP 概念 **NER（Named Entity Recognition，命名实体识别）**。从对话中抽取实体并建立**实体映射表**。
- **示例映射**：name → Dish；gender → male；work → mentor；salary → 30,000。用户消息到来时，AI 查询这个实体记忆表作答。
- **Demo 表现**：说"my name is Maya" → 问名字能答"Your name is Maya, I am Nova"。
- **成本**：每轮 **8 次 API 调用**（不止 1 次），是所有技术中成本最高的（两条消息就 467-8 tokens 量级），因为每次都要做实体映射。
- **优点**：信息准确；保存整洁的 profile 事实，**无论聊多久都不会膨胀**。
- **缺点**：只记得"事实形状"的信息（姓名等）；**不擅长自由流动的故事（free-flowing stories）**；可以匹配实体、记住上下文信息，但记不住叙事性内容。

---

## 七、七种记忆类型对比总表

| 记忆类型 | 核心机制 | 优点 | 缺点 |
|---|---|---|---|
| Conversational Buffer | 全量保存所有 Turn 到列表 | 完美回忆、永不遗忘 | 成本指数爆炸、变慢、可能幻觉 |
| Sliding Window | 保留最近 N 条消息，超出 evict | 便宜快速、成本恒定 | 窗口外信息完全丢失 |
| Summary | 持续滚动摘要，AI 生成 recap | 长对话浓缩为几句、省 token | 细节丢失（AI 决定重要性）、Context Echo |
| Summary Buffer | 近期原文 buffer + 远期摘要混合 | 短期细节 + 长期要点、预算可控 | 摘要过长时成本升、幻觉 |
| Token Buffer | 按 token 数而非 Turn 数限制窗口 | 比滑动窗口更精细省钱 | 丢近期重要上下文、无长期记忆 |
| Vector Store | 存入向量库，按相似度检索 | 最便宜、可作为所有 memory store 组件 | 仅相似度、缺结构，常需 hybrid |
| Entity | NER 抽取实体建映射表 | 准确、profile 事实永不膨胀 | 成本最高（8 次 API/轮）、不擅叙事 |

---

## 八、关键概念与术语清单

- **Agentic Memory**：AI Agent 的记忆机制
- **Agentic Loop**：用户→LLM→工具→上下文→响应的循环
- **Turn（轮次）**：一次循环中 user + system + tool + AI 四类消息的集合
- **Stateful（有状态）**：能记住自身状态与历史（人类天然如此，AI 需被设计成如此）
- **Prompt Engineering**：指示 AI 如何行为
- **Context Engineering**：管理 AI 如何维护记忆（单/多 Agent），防止记忆爆炸与 token 成本失控
- **Buffer**：列表（存储消息列表）
- **Evict vs Delete**：逐出（移出上下文，仍存数据库）vs 删除
- **Context Echo（上下文回声）**：摘要中高频词被过度放大，淹没重要细节
- **NER（Named Entity Recognition）**：命名实体识别
- **RAG 式记忆检索**：用向量相似度检索历史记忆
- **Hybrid Memory**：组合多种记忆技术
- **Graph-based Memory**：当前最先进的记忆方式（本章仅提及，未展开）
- **Token**：词数计量单位，成本与窗口控制的核心指标

---

## 九、Demo 环境与指标细节

- AI Agent 名 **Nova**（温暖开朗的 AI 伙伴），用户为"你"/Maya/Dish。
- 使用 **Groq 免费 API**（成本显示很低）；可切换不同模型观察成本差异。
- 可观测指标：**API 请求次数、输入/输出 tokens、累计成本**。
- 完整对比功能：运行 **24 条查询**后生成各记忆类型的对比结果。
- 演示平台是可交互的 hands-on playground。

---

## 十、结论与 Part 2 预告

- 本章（Part 1）覆盖：为何需要 agentic memory、四种消息、Turn 概念、stateful、context engineering 引入、七种基础记忆及其混合。
- 这些基础技术**至今仍可用于简单原型和小规模用例**。
- **Part 2 预告**：高级模式与 SOTA 模型使用的记忆形式——**Episodic Memory（情景记忆）、Semantic Memory（语义记忆）、Procedural Memory（程序性记忆）**等。