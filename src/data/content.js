export const topics = [
  ['agent','Agent 架构','◎','执行循环,任务分解,规划,路由,状态机,Human-in-the-loop'],
  ['tools','Tools & Skills','⌘','Tool Calling,Schema,MCP,CLI,Skills,幂等性,错误反馈'],
  ['memory','Memory','◫','工作记忆,长期记忆,会话记忆,记忆写入,遗忘,用户偏好'],
  ['multi-agent','多智能体编排','⤨','Supervisor,Handoff,并行协作,共享状态,结果聚合'],
  ['context','上下文工程','▤','Prompt,上下文预算,压缩,缓存,长上下文'],
  ['retrieval','检索与 RAG','⌕','RAG,grep,ripgrep,BM25,向量检索,混合检索,Reranking,Chunking'],
  ['knowledge','知识工程','▧','知识库,LLM Wiki,知识图谱,OCR,来源溯源,知识更新'],
  ['infra','AI Infra','▥','推理服务,GPU,KV Cache,量化,模型路由,网关'],
  ['harness','Runtime & Harness','⌑','Agent Runtime,沙箱,Checkpoint,回放,Hooks,任务队列'],
  ['evals','Evals & 质量','◈','Harness Evals,回归测试,LLM-as-Judge,检索评估,轨迹评估'],
  ['safety','Safety & 安全','◇','Prompt Injection,最小权限,PII,信任边界,审计'],
  ['reliability','可靠性与观测','↗','Tracing,Logs,超时,重试,熔断,SLO'],
  ['performance','性能与成本','◴','Token 成本,TTFT,吞吐,缓存,预算控制'],
  ['models','模型基础','△','Transformer,Embeddings,Tokenization,多模态,结构化输出'],
  ['training','数据与模型适配','⧉','SFT,LoRA,蒸馏,合成数据,偏好优化,数据质量'],
  ['applications','应用开发','⌂','Coding Agent,研究助手,文档处理,语音应用'],
  ['ux','交互与产品','◐','流式交互,人工接管,进度反馈,可访问性'],
  ['engineering','软件工程','⊞','API 设计,类型系统,CI/CD,版本兼容,技术债'],
  ['vibe-coding','Vibe Coding / 氛围编程','✦','AI 辅助编程,自然语言开发,快速原型,代码生成,验证,代码审查']
].map(([id,name,icon,children])=>({id,name,icon,children:children.split(',')}));

const records = [
  ['agent-loop','Agent 的可靠性，藏在执行循环里','把「思考—调用—观察」拆成可检查的状态，让复杂任务拥有明确的终止、恢复与交接路径。','agent',['Agent Loop','状态机','停止条件'],'架构笔记','进阶','12','loop',
    ['从一句请求到一个可恢复的任务','为循环建立显式状态','让失败成为可处理的结果'],
    ['一个任务可能包含多次模型调用和工具执行。把任务状态、工具结果与下一步决策分开保存，才能知道任务停在了哪里。这里用一个本地文件整理任务作为示意，不代表任何课程的原始结论。','将任务表示为 queued、running、waiting、completed、failed 等状态。每次转换记录触发原因和关联的工具调用 ID。并非所有系统都需要复杂状态机，短任务可以从最小状态集合开始。','工具超时后不应无条件重放有副作用的操作。先判断操作是否幂等、是否已生效，再决定重试、查询状态或交给人工。设置步数、时间与成本上限，避免执行循环无限持续。'],
    '给 Agent 增加明确的停止预算','长任务或需要多次工具调用的 Agent','同时设置最大步骤、总耗时和费用预算；达到阈值后保存进度并返回可解释的停止原因。','预算过低会截断有效任务；应按任务类别调整。','构造无法完成的任务，确认系统会停止且保留可恢复状态。'],
  ['tool-contracts','一个好工具，需要一份清晰的契约','从参数 Schema 到结构化错误：让模型理解工具的能力边界，也让开发者更容易定位失败。','tools',['Tool Calling','Schema','错误反馈'],'实践指南','入门','8','tools',
    ['先定义边界，再写工具','给错误一个稳定的结构','对副作用建立保护'],
    ['工具描述应说明做什么、不做什么以及输入要求。参数命名保持具体，避免把所有能力塞进一个自由文本字段。服务端必须再次校验参数，模型生成的输入并不天然可信。','可以返回 code、message、retryable 等字段。模型用可读信息决定下一步，程序用稳定错误码实施策略。是否允许重试还要结合操作性质，不能只相信错误文本。','文件写入、邮件发送和支付等操作具有不同风险。对不可逆操作加入范围校验、幂等键或人工确认。读操作和写操作分离也有助于权限管理。'],
    '让工具错误可分类、可恢复','需要自动处理工具失败的工作流','定义稳定错误码、可读解释与建议下一步，区分参数错误、权限错误和临时服务错误。','过于宽泛的 retryable 标志可能诱发重复副作用。','注入无效参数、拒绝访问与超时，观察不同错误是否进入正确分支。'],
  ['retrieval-design','先理解问题，再选择检索方式','grep、全文检索与向量检索各有适用条件。用一个小型检索评估集，替代凭感觉选择架构。','retrieval',['RAG','grep','混合检索'],'对比研究','进阶','10','rag',
    ['精确匹配与语义匹配','把检索拆成可观察的阶段','从真实问题建立评估集'],
    ['定位函数名、错误码或配置项时，精确文本匹配往往是合理起点。自然语言表达与资料措辞差别较大时，可以试验语义检索。这个选择取决于语料和查询分布，而不是某种方法普遍更好。','记录查询、候选片段、过滤条件和最终上下文。混合检索增加了调参和运维复杂度，只有在评估发现收益时才值得采用。图中的候选数量是交互示意，不是性能基准。','收集真实用户问题，为每个问题标注相关文档或片段。分别看召回、排序和最终回答是否忠实于证据，避免用最终答案掩盖检索阶段的问题。'],
    '把检索质量与回答质量分别评估','包含检索和生成两个阶段的知识问答系统','保留检索候选和最终引用，分别建立检索命中与回答忠实度检查。','需要维护评估样本及相关性标注，增加内容维护成本。','固定生成环节比较检索方案，再固定检索结果评估回答。'],
  ['memory-lifecycle','长期记忆，也需要过期时间','记住更多并不总是更好。为记忆增加来源、作用域与失效机制，减少陈旧信息干扰。','memory',['长期记忆','遗忘','用户偏好'],'架构笔记','进阶','9','memory',
    ['区分事实、偏好和临时状态','写入前判断价值','读取时检查有效性'],
    ['用户明确表达的长期偏好与一次任务的临时要求应分开存放。为每条记忆记录所属用户、来源和创建时间，防止跨用户或跨项目误用。','记忆写入需要判断信息是否值得长期保存，以及是否包含敏感内容。重复信息可以合并，但冲突信息应保留可检查的处理记录。','读取时按作用域和有效期过滤，再检查新信息是否覆盖旧事实。过期时间不是唯一方法，也可以使用显式撤销、版本或事件触发失效。'],
    '让记忆携带来源与有效性条件','保存跨会话偏好或项目事实的系统','记录来源、用户和项目范围；提供更新、撤销与删除入口。','过于激进的过期策略会丢失仍有用的信息。','模拟用户更改偏好，确认旧记忆不会继续覆盖新指令。'],
  ['harness-checkpoints','长任务中断后，从哪里继续？','用检查点与执行日志，建立可解释的任务恢复机制，同时避免重复执行有副作用的动作。','harness',['Checkpoint','回放','Agent Runtime'],'工程案例','深入','11','loop',
    ['保存什么才足够恢复','区分回放与重新执行','对恢复流程做故障演练'],
    ['检查点应包含任务状态、已确认结果和下一步所需上下文。不要直接保存不必要的凭据或敏感信息。检查点格式还需要考虑程序升级后的兼容性。','回放执行日志用于检查历史；重新执行会再次调用工具。两者不是同一个操作，界面和代码应清楚区分。恢复时先确认上一次操作的实际结果。','在工具调用前后和状态保存前后分别模拟崩溃。检查恢复是否丢失进度、重复副作用或跳过必要步骤。'],
    '在副作用边界验证任务恢复','运行时间长且涉及写操作的自动化任务','记录操作 ID 与确认结果，恢复前查询实际状态，再决定继续或补偿。','跨系统事务仍可能存在不确定窗口，需要人工处理路径。','在状态保存边界注入中断，检查重复操作和遗漏操作。'],
  ['evaluation-workflow','把 Evals 放进每一次改动里','从小而稳定的回归样本开始，让提示词、模型和工具变更都有可比较的结果。','evals',['回归测试','Harness Evals','轨迹评估'],'实践指南','入门','7','eval',
    ['从失败案例开始','分别检查结果与过程','让评估参与发布决策'],
    ['将真实失败案例整理成可重复执行的样本，保留输入、期望约束和失败原因。避免只挑容易通过的任务，也不要把敏感生产数据未经处理加入公开测试集。','最终答案正确不代表工具行为安全。检查任务成功、工具参数、权限边界以及成本等维度。模型裁判适合辅助，但重要判断需要人工抽查。','保留版本和测试条件，让每次改动能与基线比较。指标改善也可能来自样本偏差，定期更新覆盖范围并保留历史可比子集。'],
    '用真实失败案例建立回归集','持续修改提示词、模型或工具的项目','每次排查线上问题后，将脱敏的最小复现加入回归集。','测试集可能逐渐过拟合，需要新样本和人工抽查。','更改关键提示词后比较成功率、错误类别和成本分布。'],
  ['knowledge-provenance','知识库最重要的链接：回到依据','把摘要、工程结论和原始材料连接起来。即使内容不断更新，也能检查一个判断的来历。','knowledge',['LLM Wiki','来源溯源','知识更新'],'设计笔记','入门','6','memory',
    ['把资料与结论分开存储','为段落提供稳定地址','保留修订与分歧'],
    ['一份资料可以支持多个结论，一个结论也可能有多个来源。将来源元数据与精华条目分开建模，避免改动一次来源就需要复制修改许多页面。','标题会变化，因此章节地址不应完全依赖显示标题。采用稳定 section ID，并在构建时验证引用存在。没有时间戳时保留段落定位。','不同资料可能给出相反建议。记录适用条件与分歧，比直接生成一个折中结论更有帮助。内容更新时保留修订说明。'],
    '让每条工程结论拥有稳定证据链接','长期维护的技术知识库','为来源、章节和精华分别分配 ID，构建时检查引用关系。','需要额外的内容校验与维护流程。','修改章节标题后确认旧精华链接仍能定位正确段落。'],
  ['agent-safety','把权限边界放在工具执行之前','外部网页、文档和工具返回值都可能包含指令。用明确的信任边界约束实际操作。','safety',['Prompt Injection','最小权限','信任边界'],'实践指南','进阶','8','tools',
    ['先识别不可信输入','让程序执行权限策略','为高风险操作保留检查点'],
    ['网页和文档属于待处理的数据，其中出现的命令不自动具有用户授权。仅靠提醒模型忽略恶意文本不足以构成可靠的权限控制。','将文件路径范围、允许的目标域名和操作类型放在程序层检查。按任务提供最小权限，避免把无关资源一并暴露给执行环境。','对高风险操作展示准确目标与预期影响，再进行必要审批。保留审计记录以便检查操作的授权来源。具体策略需要结合真实系统威胁模型。'],
    '把工具权限校验放在程序层','读取外部材料且能执行写操作的 Agent','独立校验目标、操作和授权范围，不让工具返回文本直接扩大权限。','策略过严会阻碍正常工作，需要明确的拒绝原因与升级路径。','在测试材料中加入诱导越权文本，确认实际工具调用被策略阻止。']
];

const seedArticles = records.map((r,i)=>({
  id:r[0], title:r[1], summary:r[2], topic:r[3], tags:r[4], type:r[5], level:r[6], minutes:Number(r[7]), diagram:r[8],
  date:'2026-11-25', author:'工程切片编辑部', sourceType:'原创示例', demo:true,
  sections:r[9].map((title,j)=>({id:`section-${j+1}`,title,text:r[10][j]})),
  insight:{id:`insight-${r[0]}`,title:r[11],problem:r[12],actions:r[13],tradeoff:r[14],validation:r[15],sectionId:({'tool-contracts':'section-2','knowledge-provenance':'section-2','agent-safety':'section-2','evaluation-workflow':'section-1'})[r[0]]||'section-3',claimType:'编辑示例 · 未实测'},
  number:String(i+1).padStart(2,'0')
}));
const collection = ({id,title,summary,topic,topicIds,tags,type,level,sourceCount,sourcePath,sourceFiles,diagram,sourcePeriod,sourcePeople,references}) => ({
  id,title,summary,topic,topicIds,tags,type,level,minutes: sourceCount > 30 ? 30 : 14,diagram,
  date:'2026-11-25',updatedAt:'2026-11-25',author:'本地资料库',sourceType:type,demo:false,isCollection:true,sourceCount,sourcePath,sourceFiles,sourcePeriod,sourcePeople,references,
  sections:[
    {id:'catalog',title:'资料目录',text:`此资料集包含 ${sourceCount} 份已放入 docs 的 Markdown 文档。当前先登记来源、目录和标签，尚未提取摘要或工程精华。`},
    {id:'scope',title:'覆盖范围',text:summary},
    {id:'next',title:'整理状态',text:'精华暂未提取。后续可按课程、讲次或论文卡片逐篇生成详细总结，并为每条结论补充原文定位。'}
  ],insight:null,number:'S'+sourceCount
});
export const collections = [
  collection({id:'cs329a-self-improving-agents',title:'CS329A 自我改进智能体',summary:'Stanford CS329A 课程知识库，围绕 self-improving agent loop，覆盖 test-time compute、验证器、反馈工具、多步规划、训练时 RL、开放式进化、软件工程任务、记忆与长程评测。',topic:'agent',topicIds:['agent','multi-agent','context','retrieval','memory','evals','training','models','applications','performance'],tags:['Agent Loop','规划','验证器','Test-Time Compute','多智能体','RAG','记忆','Evals','GRPO','RL','自我改进'],type:'课程资料集',level:'进阶',sourceCount:57,sourcePath:'docs/01-course-packs/CS329A自我改进智能体',sourceFiles:['notes/（14 份课程笔记）','papers/（42 份 Markdown，含索引）','README.md（总索引）'],sourcePeriod:'Autumn 2025 · 2025-09-22—2025-12-12',sourcePeople:'Aakanksha Chowdhery、Azalia Mirhoseini（Stanford）',references:[['课程官网','https://cs329a.stanford.edu/']],diagram:'loop'}),
  collection({id:'hardcore-agentic-engineering',title:'硬核智能体工程',summary:'面向交付的 Agentic Engineering 课程资料，集中讨论 done contract、gate、harness、沙箱、durability、控制平面、幂等、校验、交接和 Agent 集群编排。',topic:'harness',topicIds:['harness','tools','safety','reliability','multi-agent','context','evals','engineering'],tags:['Harness','Agent Runtime','沙箱','控制平面','Durability','Gate','校验','Handoff','幂等性','安全','可观测性'],type:'课程资料集',level:'进阶',sourceCount:9,sourcePath:'docs/01-course-packs/硬核智能体工程',sourceFiles:['第 01–06 课（6 份）','第 01–03 周答疑（3 份）'],sourcePeriod:'2026-08-03—2026-08-21 · 三周课程',sourcePeople:'Greg Ceccarelli、Sean Johnson、Jake Levirne（SpecStory）',references:[['课程资料仓库','https://github.com/specstoryai/hardcore-agentic-engineering'],['Maven 课程页','https://maven.com/specstory/hardcore-agentic-engineering-for-builders-who-ship']],diagram:'tools'}),
  collection({id:'huggingface-post-training-agents',title:'Hugging Face 后训练 Agent',summary:'Training Agents 系列资料，覆盖 agent 评估、轨迹 SFT、在线蒸馏、GRPO、强化学习环境、持续学习和开源智能体训练。',topic:'training',topicIds:['training','agent','evals','models','infra','applications'],tags:['SFT','蒸馏','GRPO','RL','RL 环境','轨迹','后训练','Agent Evals','持续学习'],type:'课程资料集',level:'进阶',sourceCount:7,sourcePath:'docs/01-course-packs/huggingface后训练agent',sourceFiles:['第 1–7 讲（7 份）'],sourcePeriod:'2026 · Training Agents 直播系列（4 场课程 + 2 个相关 workshop）',sourcePeople:'Hugging Face Training Agents 团队；资料中出现 Ben、Sergio Panego 等讲者',references:[['官方课程整理','https://huggingface.co/blog/huggingface/train-agents'],['Hugging Face Learn','https://huggingface.co/learn']],diagram:'eval'}),
  collection({id:'vizuara-harness-workshop',title:'Vizuara Harness 工程工作坊',summary:'五天 Harness 工程工作坊笔记，从 loop、tools、security、context、skills、memory、subagents、durability 到组装和循环图形工程。',topic:'harness',topicIds:['harness','tools','context','memory','multi-agent','safety','reliability','evals','engineering'],tags:['Harness','Loop','Tools','Security','Context Management','Skills','Memory','Subagents','Durability','Fleet','CLI'],type:'工作坊资料集',level:'入门',sourceCount:6,sourcePath:'docs/01-course-packs/Vizuara-harness',sourceFiles:['第 01–05 天（5 份）','note.md（1 份）'],sourcePeriod:'2026-08-03—2026-08-07 · 每天 7:00–9:00 IST',sourcePeople:'Raj Dandekar（MIT PhD，Vizuara 联合创始人）',references:[['官方工作坊页面','https://harnessengineering.vizuara.ai/'],['Vizuara AI Labs','https://vizuara.ai/']],diagram:'memory'})
  ,collection({id:'agent-memory-video-notes',title:'Agent Memory 视频笔记',summary:'5 份 YouTube 视频笔记：从 Agentic Memory 的基础类型、长期记忆与框架，到 Anthropic 的 Managed Agents、文件系统式记忆、Memory Store 和 Dreaming 自学习闭环。',topic:'memory',topicIds:['memory','agent','context','retrieval','knowledge','tools','multi-agent','harness','evals','safety'],tags:['Agent Memory','短期记忆','长期记忆','Episodic Memory','Semantic Memory','Procedural Memory','Self-Reflection','Memory Routing','Vector Store','Entity Memory','LangMem','Mem0','Neo4j','Dreaming','Anthropic','Claude','Managed Agents','Memory Store','MCP','Skills','文件系统式记忆','多智能体','RAG','上下文工程'],type:'YouTube 视频笔记',level:'进阶',sourceCount:5,sourcePath:'docs/02-themes/03-memory/videos',sourceFiles:['agent-memory-part-1-what-is-agentic-memory-and-types.md','agent-memory-part-2-long-term-memory-and-frameworks.md','anthropic-memory-and-dreaming-for-self-learning-agents.md','anthropic-memory-part-1-and-dreaming.md','anthropic-memory-part-3-memory-store-and-dreaming.md'],sourcePeriod:'2026-05-06（Anthropic 活动）；2026-05-08（Anthropic YouTube）；2026-05-21/22（Anthropic API Knowledge 视频资料）；2026-05-25（Memory Store 视频资料）；2026-07-05（Part 1）；2026-07-11（Part 2）',sourcePeople:'Divesh Jadhwani（Agentic Memory 系列）；Ravi Trivedi、Kevin Chen、Mahesh Murag（Anthropic）',references:[['Agentic Memory Part 1 · YouTube','https://www.youtube.com/watch?v=9ta1cawyVsU'],['Agentic Memory Part 2 · YouTube','https://www.youtube.com/watch?v=x0zifxrq9Is'],['Anthropic Memory and Dreaming · YouTube','https://www.youtube.com/watch?v=IGo225tfF2I'],['Anthropic Agents that remember · YouTube','https://www.youtube.com/watch?v=geUv4CjPpxI'],['Memory and dreaming · Anthropic Code w/ Claude 2026','https://claude.com/code-with-claude/session/sf-memory-and-dreaming-for-self-learning-agents?21f59b6b_page=1'],['The components of agent memory · Anthropic','https://www.anthropic.com/research/components-of-agent-memory']],diagram:'memory'})
  ,collection({id:'hermes-agentic-rl-notes',title:'Hermes Agentic RL 工程笔记',summary:'围绕 Hermes Agent 与 Nous Research 训练基础设施的工程拆解：从 Agent 交互采集轨迹、压缩与格式化，到程序化奖励、GRPO、LoRA、评估和数据飞轮闭环。',topic:'training',topicIds:['training','agent','evals','harness','tools','engineering','performance','models'],tags:['Hermes Agent','Agentic RL','轨迹','Trajectory','GRPO','LoRA','Atropos','Tinker','W&B','Reward Model','Replay Buffer','Tool Calling','多轮恢复','Held-out Eval','数据飞轮'],type:'工程资料笔记',level:'进阶',sourceCount:1,sourcePath:'docs/02-themes/15-training-and-adaptation/agentic-rl',sourceFiles:['hermes-agent-agentic-rl.md'],sourcePeriod:'项目持续更新；官方仓库最近更新至 2026-11-24（检索日期 2026-11-25）',sourcePeople:'Nous Research / Hermes Agent 社区',references:[['NousResearch Hermes Agent · GitHub','https://github.com/NousResearch/hermes-agent'],['Hermes Agent 官方文档','https://hermes-agent.nousresearch.com/docs/'],['Hermes Agent Releases','https://github.com/NousResearch/hermes-agent/releases'],['Hermes Agentic RL 参考实现','https://github.com/isLinXu/hermes-agentic-rl']],diagram:'eval'})
  ,collection({id:'little-book-agent-engineering',title:'智能体工程小书（中文译本）',summary:'Gappy + Agents《The Little Book of Agent Engineering》的中文 Markdown 译本，完整收录前言、11 章正文、术语表、习题答案、参考文献和章节插图。围绕模型、循环、工具、上下文、检索记忆、控制、多智能体、安全、评估与可观测性建立一张 Agent 工程地图。',topic:'engineering',topicIds:['engineering','agent','tools','context','retrieval','memory','multi-agent','safety','evals','harness','reliability','knowledge'],tags:['Agent Engineering','Harness','Agent Loop','Policy','Tools','Action Space','Context Engineering','Retrieval','Memory','Planning','Long-Horizon','Multi-Agent','Safety','Prompt Injection','Evals','Observability','MCP','Skills','RAG','可靠性'],type:'课程资料集',level:'进阶',sourceCount:16,sourcePath:'docs/01-course-packs/智能体工程小书',sourceFiles:['00–11 章（12 份）','README.md（资料说明）','附录-术语表.md','附录-习题答案.md','附录-参考文献.md'],sourcePeriod:'原书版本：2026-11-23；站内资料核对：2026-11-24；本站接入：2026-11-25',sourcePeople:'Giuseppe Paleologo（Gappy）；封面署名 Gappy + Agents',references:[['原作者 X 帖子','https://x.com/__paleologo/status/2125050338960986532'],['中文课程整理页','https://learn.traeai.com/learn/agent-engineering-book/'],['Gappy / Giuseppe Paleologo · X','https://x.com/__paleologo']],diagram:'loop'})
];
// 只保留用户提供的四个资料集；原先用于展示界面的示例文章与精华不再进入网站。
export const articles = collections;
export const paths = [
  
];
