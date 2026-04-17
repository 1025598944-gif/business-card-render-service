# 名片图片渲染服务

这个服务专门给 Dify 的“名片工坊-图片渲染版”工作流使用。

## 作用

1. 接收 Dify 传来的 `html_content`
2. 用 Playwright 打开这段 HTML
3. 截图生成 PNG 名片
4. 返回 `image_url`

## 接口

### 健康检查

`GET /health`

### 图片渲染

`POST /render-card`

请求体示例：

```json
{
  "html_content": "<html><body>Hello</body></html>",
  "output_filename": "business_card.png"
}
```

响应示例：

```json
{
  "success": true,
  "image_url": "http://127.0.0.1:3200/cards/business_card.png",
  "filename": "business_card.png"
}
```

## 启动方式

1. 进入当前目录
2. 安装依赖
3. 启动服务

PowerShell:

```powershell
npm.cmd install
npm.cmd start
```

如果你的电脑已经安装了 Microsoft Edge，这个服务会优先复用系统自带的 Edge 来截图，不一定要等 Playwright 的 Chromium 下载完成。

## 一键开公网测试地址

为了让 Dify 云端工作区也能访问你的本地渲染服务，我另外给你做了一个脚本：

```powershell
powershell -ExecutionPolicy Bypass -File .\start-public-tunnel.ps1
```

它会做两件事：

1. 启动本地图片渲染服务
2. 启动临时公网隧道

跑起来后，它会输出一个类似下面的地址：

```text
https://xxxxx.loca.lt/render-card
```

你把这个地址填到 Dify 工作流里的 `图片渲染接口` 节点即可。

## 环境变量

可选环境变量：

```powershell
$env:PORT="3200"
$env:HOST="0.0.0.0"
$env:PUBLIC_BASE_URL="http://你的公网地址:3200"
$env:CARD_WIDTH="1125"
$env:CARD_HEIGHT="637"
```

## 接 Dify 时要改的地方

把 Dify 工作流里 `图片渲染接口` 节点的 URL：

`https://your-public-render-api.example.com/render-card`

替换成你的真实地址，例如：

`http://127.0.0.1:3200/render-card`

如果你的 Dify 是云端版，这里必须换成公网地址，不能只填本机地址。

## 最佳做法

如果你现在用的是 Dify 云端工作区，最稳的方式不是长期依赖临时隧道，而是把这个服务部署到公网。

我已经顺手给你补好了：

1. `Dockerfile`
2. `render.yaml`

这样你可以把当前目录直接部署到支持 Docker 的平台。

最省事的就是 Render。
