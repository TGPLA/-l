---
name: 上传文件路径必须用绝对路径
description: routes.go 中 Static 服务的 uploads 路径不能用相对路径，因为本地/Docker/直接运行的工作目录各不相同
type: feedback
---

`router.Static("/uploads", ...)` 必须使用绝对路径，不能硬编码相对路径。

**Why:** 不同运行环境的工作目录不同——`go run main.go` 从 `backend/` 启动（cwd=`backend/`），Docker 容器 WORKDIR 是 `/app`，直接运行二进制文件的 cwd 不确定。相对路径 `./uploads` 或 `./backend/uploads` 都会在某些环境下解析为错误的目录，导致 EPUB 文件 404。

**How to apply:** 通过 `config.UploadsPath` 获取上传目录路径，该值由 `resolveUploadsPath()` 计算：优先读 `UPLOADS_PATH` 环境变量 → 可执行文件同级的 `uploads/` → `cwd/uploads`。修改 routes.go 时绝对不能将 `uploadsPath` 参数改为硬编码的相对路径字符串。
