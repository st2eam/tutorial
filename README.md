# 拾艺

一个给自己用的技能教程合集 PWA。当前包含音乐分类下的尤克里里课程，以及半音阶口琴《天空之城》开头乐句入门，学习进度保存在当前浏览器，无账号或后端。其他技能可以通过课程数据文件加入，不需要为步骤型课程另写页面。

## 本地运行

```bash
npm install
npm run dev
```

验证规则与生产构建：

```bash
npm test
npm run build
npm run preview
```

## GitHub Pages 部署

将项目推送到 GitHub 仓库的 `main` 分支，在仓库 Settings → Pages 中把 Build and deployment 的 Source 设为 **GitHub Actions**。`.github/workflows/deploy.yml` 会自动构建并发布 `dist`。

网站为 PWA，课程和练习功能可离线使用。进度只保存在当前浏览器，可在设置页导出或导入“拾艺” JSON 备份。

## 添加课程

每个通用步骤课程是 `src/data/guided-courses/` 下的一个 TypeScript 文件；目录会自动发现课程。该文件导出课程分类、技能、标题、简介和步骤，字段与示例结构见[课程编写规范](docs/course-authoring.md)。

半音阶口琴课程入口为「技能 → 音乐 → 半音阶口琴 → 天空之城：开头乐句入门」。适用 C 调 12 孔标准独奏式排列，包含孔位对照、吹吸与推键、弱起、短句连接和录音自查八个步骤；每步提供简化练习与节拍器，进度与尤克里里课程独立保存。练习范围为开头三个教学小节，选音来自站内已有谱面，节奏仍待校对，不代表完整原曲教学。

尤克里里现在有两段原创互动练习：`#/workshop/original-fingerstyle-practice` 和 `#/workshop/original-singalong-practice`。点谱可查看动作并试听，练习可选择听示范、跟着练、自弹、慢速和循环。两份 MusicXML 由 `scripts/build-practice-scores.mjs` 生成，谱面和声音共用同一文件；乐句与教学提示位于 `src/data/interactive-course.ts`，进度独立保存并随第 3 版备份导出。旧版备份仍可导入。

原有七首尤克里里歌曲保留为旧版课程，继续使用 `src/data/course.ts`、`src/data/score-manifest.ts` 与 `public/scores/<song-id>.musicxml`。旧进度保留，不计入新版互动练习的掌握状态。新版《天空之城》完整独奏仍未启用：旧版 45 小节转录的音符和时值尚无可完整核对的旋律参考。新增或修改歌曲课程前，请先阅读[课程编写规范](docs/course-authoring.md)，并查看[歌曲来源核对记录](docs/song-source-audit.md)。

歌曲练习页可查看当前任务谱段或切换到完整课程曲谱，并使用试听、变速、循环小节和自动跟谱。《天空之城》有独立的 45 小节连续滚动曲谱页；详情页与练习页都提供入口。

开发或排查乐谱播放器时，可从 [alphaTab LLM Wiki](docs/alphatab-llm-wiki/README.md) 查阅上游文档索引、MusicXML / TAB 指南和项目适配示例。
