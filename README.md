# 拾音

一个给自己用的尤克里里学习 PWA，包含 3 首弹唱与 4 首指弹课程。课程内容和练习进度都在浏览器本地运行，无账号、后端或 AI。

## 本地运行

```bash
npm install
npm run dev
```

验证生产构建和规则测试：

```bash
npm test
npm run build
npm run preview
```

## GitHub Pages 部署

将项目推送到 GitHub 仓库的 `main` 分支，在仓库 Settings → Pages 中把 Build and deployment 的 Source 设为 **GitHub Actions**。`.github/workflows/deploy.yml` 会自动构建并发布 `dist`。

每日教学谱卡直接绘制在练习页，课程和进度可离线使用；歌曲详情里的参考来源与原曲入口是可选的外部链接。练习进度保存在当前浏览器，可在设置页导出或导入 JSON 备份。

## 课程内容维护

新增或修改歌曲课程前，请先阅读[歌曲课程编写规范](docs/course-authoring.md)，确保参考谱事实、教学练习和自制示意不会混淆。
