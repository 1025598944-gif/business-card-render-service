# business-card-render-service

这是一个用于 Dify 的图片名片方案仓库，包含两部分：

## 目录结构

- `service/`
  - 本地 / 公网图片渲染服务
  - 接收 HTML 内容并输出 PNG 图片链接
- `dify/`
  - Dify 工作流 DSL
  - 对话采集 -> 名片确认 -> 调用图片渲染接口 -> 返回图片名片

## 已包含内容

- 图片版 Dify 工作流
- Node + Playwright 图片渲染服务
- Render 部署文件
- 本地联调成功的示例图片

## 推荐使用方式

1. 先将 `service/` 部署到 Render
2. 拿到公网 `/render-card` 地址
3. 把 `dify/名片工坊-图片渲染版.dify.yml` 导入 Dify
4. 在 Dify 节点 `图片渲染接口` 中替换公网 URL

## 关键文件

- `service/server.js`
- `service/render.yaml`
- `service/Dockerfile`
- `dify/名片工坊-图片渲染版.dify.yml`
