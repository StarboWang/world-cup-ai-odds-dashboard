# World Cup AI Odds Dashboard

一套 2026 世界杯 AI 赛果预测、真实赔率采集、模拟投注和在线看板原型。

## Local Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

把 The Odds API key 放进 `.env.local` 的 `ODDS_API_KEY` 后，服务端 API 会优先拉取 `soccer_fifa_world_cup` 真实赔率。没有 key 或赛事暂未覆盖时，会使用缓存样例赔率保证看板可演示。

可选 FastAPI 服务：

```bash
pip install -r backend/requirements.txt
npm run backend
```

## API

- `GET /api/matches`
- `GET /api/matches/:id`
- `GET /api/predictions/latest`
- `GET /api/bets/ledger`
- `GET /api/performance`
- `POST /api/jobs/refresh-odds`
- `POST /api/jobs/run-predictions`

系统仅用于模拟投注和分析展示，不接入真实下注或资金交易。

## GitHub Pages 部署

项目已配置 GitHub Actions 自动部署。推送到 `main` 分支后，GitHub 会自动构建静态站点并发布到 Pages。

首次上线：

```bash
git init
git add .
git commit -m "Initial GitHub Pages deploy"
gh repo create world-cup-ai-odds-dashboard --public --source=. --remote=origin --push
```

然后在 GitHub 仓库的 `Settings -> Pages` 中，把 `Build and deployment` 的 `Source` 设为 `GitHub Actions`。之后每次提交并推送到 `main`，在线页面都会自动更新。

线上版本使用随代码发布的缓存赔率和模型预测；本地开发仍可通过 `.env.local` 接入 The Odds API。
