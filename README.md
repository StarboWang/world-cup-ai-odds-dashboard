# World Cup AI Odds Dashboard

一套 2026 世界杯 AI 赛果预测、真实赔率采集、模拟投注和在线看板原型。

## Local Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

把 The Odds API key 放进 `.env.local` 的 `ODDS_API_KEY` 后，服务端 API 会拉取 `soccer_fifa_world_cup` 真实赔率。没有 key 或赛事暂未覆盖时，页面只展示真实赛程和模型预测，收益模块会明确等待真实赔率源，不再使用样例盘口。

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

项目已配置 GitHub Pages 分支部署。线上版本使用随代码发布的真实赛程快照和模型预测；本地开发仍可通过 `.env.local` 接入 The Odds API。

发布或更新线上页面：

```bash
./scripts/deploy-github-pages.sh
```

脚本会推送当前分支到 GitHub，按仓库路径构建静态站点，把 `out/` 发布到 `gh-pages` 分支，并确保 Pages 从该分支根目录发布。
