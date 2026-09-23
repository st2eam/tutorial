# 拾音

一个给自己用的尤克里里学习 PWA。课程内容和练习进度都在浏览器本地运行，无账号、后端或 AI。

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

课程图示为项目自制内容；曲谱参考和听歌入口会打开外部页面。练习进度保存在当前浏览器，可在设置页导出或导入 JSON 备份。
