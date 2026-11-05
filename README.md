# personal-website

A personal website — one HTML file, no framework, no build step.

- 线上：https://theinbetween07-byte.github.io/personal-website/
- 数字分身后端：`server/`（Node，部署在阿里云函数计算 FC）

## 改完先跑测试

```bash
node tools/verify-page.js         # 结构 / 导航 / 锚点 / 配色   90 条
node tools/run-share-tests.js     # 分享弹窗与焦点管理           32 条
node tools/run-feedback-tests.js  # 反馈表单                     67 条
node tools/run-twin-tests.js      # 数字分身（规则版兜底）        26 条
```

四条全绿再提交。测试从 `index.html` 实时提取脚本，不做快照。
