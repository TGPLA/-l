# 部署运维 — L2 领域 Skill

## 职责
构建、部署、环境配置相关的任务，加载此文件。

---

## 常见任务

| 任务 | 关键词 |
| --- | --- |
| 本地启动开发服务器 | `npm run dev` |
| 生产构建 | `npm run build` |
| 预览构建结果 | `npm run preview` |
| ESLint 检查 | `npm run lint` |
| 腾讯云部署 | SSH + nginx + 反向代理 |
| GitHub Actions CI/CD | `.github/workflows/` |

---

## 项目构建配置

- **构建工具**：Vite
- **输出目录**：`dist/`
- **Node 版本**：见 `.node-version` 或 `package.json`

---

## 部署检查清单

1. `npm run build` 构建成功
2. `npm run lint` 无 error
3. `npm run test` 测试通过
4. `dist/` 目录已生成
