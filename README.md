# 工程切片 · Engineering Notes

一个可部署到 GitHub Pages 的静态 AI 工程知识库。包含首页、资料库、全文搜索、工程精华、主题索引、详情阅读和交互流程图。

## 本地运行

需要 Node.js 22.23.4 或更高版本。

```sh
npm ci
npm run dev
```

生产预览（含 Pagefind 搜索）：

```sh
npm run build
npm run preview
```

## 部署 GitHub Pages

1. 将本目录内容提交到你的 GitHub 仓库 main 分支，确保包含 package-lock.json 和 .github/workflows/deploy.yml。
2. 仓库 Settings → Pages → Source 选择 GitHub Actions。
3. 推送后等待 Deploy knowledge base 工作流完成。
4. 工作流自动区分 username.github.io 根站点与普通项目子路径。

尚未创建或推送任何远程仓库。使用自定义域名时，需要调整工作流中的 SITE_URL 和 BASE_PATH，并配置 Pages 域名。

手动验证子路径：

```sh
BASE_PATH=/engineering-notes SITE_URL=https://yourname.github.io npm run build
```

## 内容与目录

- `src/data/content.js`：主题词表、7 个资料集、工程精华与来源信息。
- `src/pages/`：静态页面；`articles/[id].astro` 生成文章详情。
- `src/components/`：内容卡片与流程图。
- `src/styles/global.css`：设计系统、响应式布局、暗色与减少动画支持。
- `src/scripts/site.js`：筛选、收藏、已读、导入导出、搜索与图解播放。
- `scripts/validate.mjs`：构建前检查 ID、主题及证据关系。
- `docs/content-template.md`：未来真实内容的数据模板与提炼提示词。
- `docs/01-course-packs/`：完整课程包；每个课程保持独立目录。
- `docs/02-themes/`：预建的 19 个 AI 工程主题目录，适合放课程外的零散资料；记忆主题下的 `videos/` 收纳 YouTube 视频笔记。
- `docs/00-inbox/`：暂时无法归类的新资料。

课程资料集使用稳定 ID 和章节锚点连接；每篇原始 Markdown 都会生成独立详情页。新增课程包放入 `docs/01-course-packs/` 并在 `src/data/content.js` 登记，新增零散资料先放入对应的 `docs/02-themes/` 主题目录。

## 已实现的能力

- 中英混合内容的静态全文搜索；开发模式没有 Pagefind 索引时使用本地内容搜索。
- 主题、关键词、难度筛选，筛选 URL 可分享。
- 本机收藏、已读记录，JSON 导入导出。
- 工程精华到详情锚点跳转和返回，目标高亮。
- 图解单步、播放、暂停和重置。
- 移动导航、深色模式、键盘搜索、无结果页面、404。

## 当前边界

当前网站接入 4 个课程/工作坊资料包、1 个 Agent Memory 视频笔记集、1 个 Hermes Agentic RL 工程笔记集与 1 个 Agent 工程小书资料集，共 101 篇原始 Markdown；工程精华仍需后续提取。没有账户登录、跨设备同步、在线采集、自动转录或模型调用。大体积音视频、私有原稿与 API 密钥不应提交到公开仓库。部署上线需要你自己的 GitHub 仓库。
