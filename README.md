# PerfectPixel 网页版演示

> **自动识别网格，还原完美像素图**

<img src="assets/image.png" width="100%" />

普通的缩放方式往往无法正确采样 AI 生成的像素画，因为这类图片的格子尺寸不一致，网格也未必是正方形。

本工具会自动检测最佳网格，输出对齐精准、像素完美的结果。


## 本仓库相对官方演示的改动

- **中文化界面** —— 主界面与去背景页均为中文
- **内置去背景** —— 结果面板集成像素去背景，可把纯色背景抠成透明 PNG
- **本地启动脚本** —— `Launch.ps1` 一键启动本地服务并打开页面

## 去背景插件（可单独使用）

去背景功能已拆分为独立插件并公开发布：
**[perfectPixel-remove-white](https://github.com/Dan-3401/perfectPixel-remove-white)**

- 在线演示：https://dan-3401.github.io/perfectPixel-remove-white/
- 零依赖算法，一行 `import` 即可接入自己的项目
- 中英双语界面与文档，用户可自行选择

如果只想去背景，用插件就够了；想要「生成像素图 → 去背景 → 下载」一气呵成，就继续用本仓库的内置版本。

---

**这是 [perfect-pixel](https://github.com/theamusing/perfectPixel) 库的官方网页演示。**

*由 google ai studio 构建*
