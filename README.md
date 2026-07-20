# 你先别急

一个不把情绪翻译没了的急急翻译器。输入原话，选择对方、表达目的和想保留的火气，一次生成“好好说、直接说、带点火”三种版本。

线上地址：[ni-xian-bie-ji.vercel.app](https://ni-xian-bie-ji.vercel.app)

## 已完成

- 关系、表达目的与火气比例选择
- 真实 AI 改写与三版本结构化输出
- 复制结果与生成 1080 × 1440 PNG 分享图
- 输入校验、超时、失败重试和基础限流
- 移动端适配
- 不在服务端记录或缓存用户输入

## 本地运行

```bash
npm install
cp .env.example .env.local
```

填入 `DEEPSEEK_API_KEY` 后，使用 Vercel CLI 启动前端和接口：

```bash
npx vercel dev
```

只查看界面可以运行 `npm run dev`，但此时 `/api/translate` 不会启动。

## 环境变量

| 变量 | 必填 | 默认值 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | 是 | 无 |
| `DEEPSEEK_BASE_URL` | 否 | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 否 | `deepseek-chat` |

也支持通过 `AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL` 接入其他兼容 OpenAI Chat Completions 的服务。

## 部署到 Vercel

1. 在 Vercel 导入本仓库。
2. 在项目的 Environment Variables 中添加 `DEEPSEEK_API_KEY`。
3. 部署。Vercel 会按 `vercel.json` 构建 Vite 页面并发布 `/api/translate`。

请勿把真实密钥写入 `.env.example` 或提交到 Git。

## 检查

```bash
npm test
npm run build
```
