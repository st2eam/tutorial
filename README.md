# 拾艺

一个给自己用的技能教程合集 PWA。当前包含音乐分类下的尤克里里课程，学习进度保存在当前浏览器，无账号或后端。其他技能可以通过课程数据文件加入，不需要为步骤型课程另写页面。

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

尤克里里歌曲课程仍维护在 `src/data/course.ts`，谱卡和音符数据维护在 `src/data/score-sheets.ts`。新增或修改歌曲课程前，请先阅读课程编写规范，确保参考谱事实、教学练习和自制示意不会混淆。
