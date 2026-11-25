# Agentic Memory Part 2: Long Term Memory & Frameworks


https://www.youtube.com/watch?v=x0zifxrq9Is


## 一、课程回顾与基础概念（Chapter 1）

### 1.1 为什么需要 Agentic Memory
- 核心答案只有一个词：**用户体验（User Experience）**
- 目标：让用户感觉在与真实实体对话，而非机器
- 人类类比：和朋友在 WhatsApp 聊天会保留聊天记录，第二天见面能回忆"昨晚聊了什么"；AI Agent 也应如此
- ChatGPT 示例：基于历史聊天记录，AI 能推断"你是什么样的人"，形成对用户的人格画像——这与人类交朋友时逐日积累对对方性格的理解完全一致

### 1.2 Agentic Memory 的两大分类
记忆存储分为两种方式：
1. **短期记忆（Short-term Memory）**
2. **长期记忆（Long-term Memory）**

人类同样如此：童年去山间度假的记忆是长期记忆；与老板开会、与某人争吵是短期记忆。人会记住短期和长期的事，也会遗忘短期和长期的事。核心问题是：**什么该记、什么不该记**。

### 1.3 短期记忆的五种类型（Part 1 回顾）

| 类型 | 机制 | 缺点/说明 |
|------|------|-----------|
| **Buffer Memory（缓冲记忆）** | 完整存储你与对方的所有对话 | 对话堆积成"垃圾场"，且成本高昂 |
| **Sliding Window Memory（滑动窗口记忆）** | 只保留最近 N 条消息（如 3 条） | 丢失信息。例：第1条说"月薪1万"，第2条说"每月存3千"，第4条问"投资计划"时第1条已被挤出窗口，Agent 会反问你的薪水 |
| **Summary Memory（摘要记忆）** | 每轮（user+AI 消息）压缩成一句话摘要 | 摘随时间越来越大，仍是"倾倒"，不是最优 |
| **Summary Buffer Memory（摘要缓冲）** | 每 10 条/20 条消息做一次摘要，buffer 即消息列表 | 对 Summary Memory 的改进 |
| **Token Buffer Memory（Token 缓冲）** | 按词（token）计数而非按消息计数，如每 1000 词触发驱逐/摘要 | 从"数句子/消息"变为"数词" |
| **Vector Store Memory（向量存储记忆）** | 记忆直接存入向量数据库，新查询时检索相关信息 | — |
| **Entity Memory（实体记忆）** | 映射实体，如 salary=1,30,000、gender=male | 定义实体以便记住关于用户的信息 |

（注：原文列举为 buffer、sliding window、summary、summary buffer、token buffer、vector store、entity 共七项，讲师口述"五种"但实际展开七种）

### 1.4 Session（会话）概念
- 每次与 GPT 开始聊天即创建一个 session；不同 session 对应不同对话
- 正是基于多个 session，GPT 才能推断用户人格
- 短期记忆用于单个 session/较短时间内的对话维持；长期记忆才是本部分核心，可跨 session 使用

---

## 二、长期记忆的五种类型（Chapter 2）

**总纲**：长期记忆类型包括 Episodic（情景）、Semantic（语义）、Procedural（程序）、Self-reflection（自我反思）、Memory Routing（记忆路由）。全部**源自人类行为/人类科学**——人们先理解自己如何记忆，再据此开发软件，即"Human Inspired"。

### 2.1 Episodic Memory（情景记忆）

**人类类比**：你不把人生记成随机事实的平铺列表，而是记成一个个" episode（情景）"。例：你和朋友在机场聊天太投入错过航班——你可能不记得聊天的每个细节，但清楚记得这件事本身。**一个有开头、中间、结尾的记忆，而不是 50 条孤立事实。**

**技术机制**：
- 不与每条 chat 绑定、不记精确细节，而是以"情景"为单位记忆
- 会话结束时（"close session one and extract memories"）提取记忆
- 内部存储的不是原始文本，而是：**topics（话题）**（如 compound interest、exam stress、study strategies）+ **session ID** + **timestamp** + **summary（整个会话的摘要）**
- 区别于短期记忆的"事实列表"式存储（如 buffer memory 中"我叫 Maya"→"你好 Maya"→"我叫什么"）

**演示流程**：
1. Session 1：用户 Maya 与 Agent Nova 聊天（猫叫 Whiskers、复利、考试压力、决定每晚学2小时、要求回答简短、学习专注方法），最后"thanks Nova, that is it for today"结束会话
2. 关闭 session 并提取记忆 → 生成话题、时间戳、会话摘要
3. Session 2（全新对话）："Hey Nova, it's me again. What's been stressing me out lately?" → Nova 回答"我记得你之前为工作项目/截止日期感到压力"——**跨会话记忆生效**

**目的**：让 Agent 围绕用户建立人格（build a personality）。

### 2.2 Semantic Memory（语义记忆）

**词义**："Semantic"意为"有意义的"。例："What is AI?"与"Explain me AI"语义相似（semantically similar），即两者含义相同。语义 = 理解事实背后的意义。

**人类类比**：你每天和朋友喝咖啡，朋友不加糖。第一天你递糖、第二天递糖、第三天递糖，第四天你**不再问、直接给不加糖的咖啡**——你在心中建立了对这个人的理解并更新记忆，此后不再询问。这就是"理解这个人"。

**技术机制**：
- 跨会话蒸馏出关于用户的**语义事实（distilled semantic facts）**，而非记录某次会话发生了什么
- 类比：**Episodic memory 是日记（diary），Semantic memory 是百科全书条目（encyclopedia entry）**
- 人类类比：足够多的相处后，你"就是知道"她总是第一个离开派对、他玩桌游出奇地好胜，但说不出具体是哪个夜晚教会你的——**个别情景模糊了，总体模式留存下来**

**演示流程（ChatGPT 示例）**：
- 用户说"我是个很有趣的人，喜欢讲笑话，希望你也能跟我讲笑话"→ 出现 **"Memory updated"**
- 让 AI 讲 crazy jokes → 得到程序员梗（"我问暗恋对象爱不爱我，她说404，我说not found，她说no，your chances"）——因为 AI 知道我是程序员
- 新开 chat 问"我是什么样的人"→ AI 回答"你是 builder、喜欢教学、有野心、不完成项目不罢休、偏好结构化"——**跨会话生效**
- 指示"从记忆中删除我是有趣的人，我是严肃严格的人"→ Memory updated，后续回复风格随之改变

**演示流程（自建应用，Maya 案例）**：
关闭 session 后提取出的语义事实示例：
- Maya is a perfectionist — category: preference, **confidence 0.8（80%置信度）**，并保留支撑该判断的 facts/reasons
- Maya feels overwhelmed with long explanations when stressed
- Studying and stress management are important to Maya（60% confidence）
- Maya values efficiency and time management（50% confidence）
- Maya is preparing for exams

即：不仅存事实，还存**类别、置信度、判断依据**。

### 2.3 Procedural Memory（程序记忆）

**定义**：AI Agent 根据对话**持续更新自己的 system instructions（系统指令）**。

**人类类比**：
- 知道朋友喝茶不加糖后，你不再递糖——把"记住的事实"变成"固定的习惯"
- 你骑车喜欢快，但后座的朋友不喜欢快，朋友说"慢点慢点"→ 你的"系统指令"被更新：这个人坐车时不骑快

**核心金句**：
> Procedural memory 不是"I know a fact about you"，而是"**I act differently because I know something about you**"。
> 它塑造的是 Agent 的**行为方式（how it behaves）**，而不是它知道什么（what it knows）；个性化的是**风格（style）**，不是事实（facts）。

**技术场景——Coding Agent 示例**：
- 场景：VS Code 左侧文件、右侧 coding agent；新 session 初始化时 Agent 对你一无所知，system instructions 为零
- 用户提示："read my files, understand my code writing patterns and project, tell me once done"
- Agent 逐个读文件后自行归纳并写入给自己的指令：
  - 用户严格遵循 **camelCase** 文件命名约定 → 我必须始终用 camelCase
  - 项目是 RAG 项目，名为 **HR policy agent** → 按此方向编程
  - 存在 `prompt.py` 文件，内含 Agent 行为指令 → 需要时读取该文件
  - 用户喜欢写安全代码 → 始终添加 validators
- 即：Agent 获取用户信息后**更新自身指令**，随着对话与迭代不断增加而持续更新

**HR Policy Assistant 示例**：初始系统指令为"你是HR政策助手，只回答HR政策相关问题，回答保持一行，始终礼貌"；对话中用户说"从现在起保持回答简短"，该约束被吸收进程序记忆。

**优点**：自我更新、行为个性化
**缺点（重要）**：**谁来负责更新？是 AI Agent 自己。** 如果 Agent 对你做出错误假设，它会把错误规则写进自己——这在人类身上叫**误解（misunderstanding）**。例：你只是因为那天生病才要求开慢点，不代表你永远喜欢慢速——但 Agent 可能永久更新指令。坏规则被错误强化后，会导致**每次都重复同样的错误行为**。

### 2.4 Self-Reflection Memory（自我反思记忆）

**定位**：**Procedural memory 的延伸（extension）**。

**人类类比**：
- 尴尬对话后走回家的路上，脑海里的声音："我刚才是不是说错话了？""那个 PPT 我本可以讲得更好"——你不只是回忆发生了什么，而是在**用本意表现的标准评判自己的表现**，并给下次留一张便签
- 知道朋友对某个话题会发火 → 下次开口前先避开该话题（**行动前先自检**）
- 老师示例：给非技术听众讲 AI 却全程用技术讲法，听众没听懂 → 学到"面对非技术学生要换例子"→ 下次课前先判断听众类型，再决定用词和例子
- 足球示例：对手抓住你的弱点抢断 → 你意识到弱点被看穿，针对性训练，下次比赛前提醒自己弱点在哪，练成后对手再也抢不断——对手则要开始自我反思
- 本质：**think before you do（行动前思考）**；指令更新后，确保自己遵守这些指令

**技术机制**：每次任务/行动前检查自身思考"我这样做对吗"；会话关闭提取时输出类似 violation/evidence/court/lesson learned 的结构化反思（讲师演示中该部分展示效果一般，但概念是自我评判并沉淀经验）

### 2.5 Memory Routing（记忆路由）

**定义**：根据情境/对话内容，把记忆**路由到不同的记忆存储**。五种 memory stores 内置于系统：**entity、vector、episodic、semantic、procedural**。

**人类类比**：朋友问"你电话号码多少"，你不会回想一生故事，而是直接调取电话号码这个事实；朋友问"上次我们聊了什么"，你切换到完全不同的记忆搜索——不是搜事实，而是搜某个特定时刻。你**从不有意识地想"我该查大脑哪个区域"**，而是瞬间、无意识地完成路由。即：存储与检索都有路由。

**技术机制**：
- 检测消息的 **intention（意图）**，按意图分类后存入/检索对应存储
- 演示的路由结果：

| 输入消息 | 检测意图 | 路由到的存储 |
|----------|----------|--------------|
| "My salary is 1,30,000" | fact（事实） | Entity memory + Procedural memory（salary=1,30,000，行为据此调整） |
| "I just adopted a new puppy" | fact update | Entity + Procedural |
| "What is my current salary" | fact query | （查询类） |
| "How does compound interest work" | knowledge（知识） | Procedural + Vector store |
| "Please always keep your answer short from now on" | constraint（约束/规则更新） | Procedural memory |
| "I'm really anxious about my exam results" | emotional（情绪信号） | Procedural + Semantic（理解用户面对考试会情绪化） |

- 并非所有记忆都永远全量写入：语义理解与自我反思"总是"发生，但"是否做成 episode""是否更新 procedure"取决于场景——这正是路由的意义

**优点**：**大规模 token 节省**——只为当下真正相关的存储付费
**缺点**：**误分类的消息会静默查询错误的存储**（本该记住的却忘了）

### 2.6 长期记忆总结
- **短期**：buffer、sliding window、summary、token buffer、vector store、entity
- **长期**：episodic、semantic、procedural、self-reflection、memory routing
- 最大魅力：每个概念都能对应到生物学意义上的人类

---

## 三、Agentic Memory 框架（Chapter 3）

### 3.1 三大框架
1. **LangMem**（LangChain 出品）
2. **Mem0**
3. **Neo4j**

### 3.2 最重要的原则：永远用混合（Hybrid）
> **集成 Agentic memory 时永远不要只用单一记忆。One memory is a wrong thing——记住这一点。**
- 必须用 hybrids，因为要应对不同场景，你无法预知何时会发生什么
- 当前主流组合：**Vector DB + Graph DB**
- Neo4j 是图数据库，用于存储图结构实体；LangMem 和 Mem0 都支持向量库与图库，也支持 episodic/semantic 等记忆类型

### 3.3 LangMem
- 定位：**Agentic memory 框架**，LangChain 团队出品的 **Agent 长期记忆 SDK**
- 可在 LangChain 生态内直接使用
- 文档 Concepts 涵盖：background memory processing（后台记忆处理）、manage semantic memory、optimize single/multiple prompts、summarize message history、extractive memory、prompt optimization、short-term memory、summarization results 等
- 提到 **hot path（热路径）与 background（后台）** 两种更新用户记忆的时机（讲师表示另讲）

### 3.4 Mem0
- 定位：**Universal memory layer for AI agents（AI Agent 的通用记忆层）**，GitHub 约 60.6k stars、7k forks，开发活跃（18小时前有更新）
- 有基准测试（benchmarks）与研究论文可读
- 集成伙伴：**AutoGen、CrewAI、LlamaIndex、LangChain、AgentOps、Scaml AI、ElevenLabs、Pipecat** 等主流 Agent 框架
- 文档涵盖：get started、Mem0 platform、add/update/delete/wipe memory、memory types
- **记忆类型**：conversational、session、user、organizational；概念体系一致（factual、episodic、semantic）——掌握基础后可直接读懂

### 3.5 Neo4j
- **Neo4j Labs Agent Memory**：约 359 stars，3天前仍在开发
- 以**图（graph）概念**存储记忆：long-term memory、conversation、first message、message、reasoning trace、reasoning step、tool call、retrieved 等节点关系
- 文档/教程涵盖：context graph、entity extraction、preference learning、semantic search、agent integration
- 提供 **Neo4j AI 助手（Neomi）**：可检索整个文档回答问题（演示问题："如何在 RAG 中集成 Neo4j"→ 推荐查阅文档中的 **RAG demo**）
- 想学 Graph RAG / graph memory 集成可从此处入手

### 3.6 结语建议
讲师建议学员亲自打开并探索上述所有页面（LangMem、Mem0、Neo4j 文档），把本课概念与框架文档对照学习。

---

## 四、全课核心要点浓缩

1. Agentic memory 的唯一目的是**提升用户体验**，让 AI 像真人一样"记得"。
2. 记忆分**短期**（session 内）与**长期**（跨 session，核心目标）。
3. 短期记忆七种技术各有取舍，共同缺陷是信息丢失或成本/规模问题。
4. 长期记忆五类型全部**人类类比驱动**：
   - Episodic = 日记（按情景记，含话题/时间戳/摘要）
   - Semantic = 百科全书（蒸馏出带置信度和依据的用户事实）
   - Procedural = 改行为不改知识（自我更新 system instructions，风险是自我误解）
   - Self-reflection = 行动前自检（procedural 的延伸）
   - Memory Routing = 按意图把消息路由到正确存储（省 token，怕误分类）
5. 工程落地**必须混合多种记忆/存储**（Vector + Graph），可选框架：**LangMem、Mem0、Neo4j**。