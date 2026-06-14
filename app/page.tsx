"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  ChartColumn,
  CircleDollarSign,
  Clock3,
  Goal,
  History,
  LineChart,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildDashboardData, computeFairProbabilities, percent } from "@/lib/model";
import type { BetStatus, DashboardData, Match, MatchStatus, PredictionSnapshot } from "@/lib/types";

const initialData = buildDashboardData();
const isStaticDemo = process.env.NEXT_PUBLIC_STATIC_DEMO === "true";

const timezones = [
  { label: "北京时间", value: "Asia/Shanghai" },
  { label: "美东时间", value: "America/New_York" },
  { label: "UTC", value: "UTC" }
];

const stageLabels: Record<string, string> = {
  "Group Stage": "小组赛",
  "Round of 32": "32 强",
  "Round of 16": "16 强",
  Quarterfinal: "1/4 决赛",
  Semifinal: "半决赛",
  "Third-place Match": "三四名决赛",
  Final: "决赛"
};

const groupLabels: Record<string, string> = {
  "Group A": "A 组",
  "Group B": "B 组",
  "Group C": "C 组",
  "Group E": "E 组",
  "Group F": "F 组",
  "Group G": "G 组",
  "Group H": "H 组",
  "Group I": "I 组",
  "Group J": "J 组",
  "Group K": "K 组",
  "Group L": "L 组",
  Knockout: "淘汰赛"
};

const statusLabels: Record<MatchStatus, string> = {
  scheduled: "即将开赛",
  live: "进行中",
  final: "刚结束"
};

const betStatusLabels: Record<BetStatus, string> = {
  open: "未结算",
  won: "命中",
  lost: "未命中",
  push: "走水"
};

const teamNameLabels: Record<string, string> = {
  Mexico: "墨西哥",
  "South Africa": "南非",
  Germany: "德国",
  Curacao: "库拉索",
  "Ivory Coast": "科特迪瓦",
  Ecuador: "厄瓜多尔",
  Netherlands: "荷兰",
  Japan: "日本",
  Sweden: "瑞典",
  Tunisia: "突尼斯",
  Brazil: "巴西",
  Morocco: "摩洛哥",
  Argentina: "阿根廷",
  France: "法国",
  Spain: "西班牙",
  England: "英格兰",
  Portugal: "葡萄牙",
  Belgium: "比利时",
  Croatia: "克罗地亚",
  Uruguay: "乌拉圭",
  "United States": "美国",
  Colombia: "哥伦比亚",
  Italy: "意大利",
  Switzerland: "瑞士",
  Denmark: "丹麦",
  Senegal: "塞内加尔",
  Austria: "奥地利",
  Iran: "伊朗",
  "Korea Republic": "韩国",
  Australia: "澳大利亚",
  Serbia: "塞尔维亚",
  Poland: "波兰",
  Turkey: "土耳其",
  Ukraine: "乌克兰",
  Canada: "加拿大",
  Norway: "挪威",
  Czechia: "捷克",
  Egypt: "埃及",
  Algeria: "阿尔及利亚",
  Nigeria: "尼日利亚",
  Panama: "巴拿马",
  Paraguay: "巴拉圭",
  Chile: "智利",
  Peru: "秘鲁",
  Qatar: "卡塔尔",
  "Saudi Arabia": "沙特阿拉伯",
  Ghana: "加纳",
  "Costa Rica": "哥斯达黎加",
  "New Zealand": "新西兰",
  Draw: "平局"
};

const cityLabels: Record<string, string> = {
  "Mexico City": "墨西哥城",
  "New York/New Jersey": "纽约/新泽西",
  Philadelphia: "费城",
  Dallas: "达拉斯",
  Vancouver: "温哥华",
  Miami: "迈阿密",
  "Los Angeles": "洛杉矶",
  Seattle: "西雅图",
  Atlanta: "亚特兰大",
  "San Francisco Bay Area": "旧金山湾区",
  Houston: "休斯敦",
  Boston: "波士顿",
  Toronto: "多伦多",
  "Kansas City": "堪萨斯城",
  Guadalajara: "瓜达拉哈拉",
  Monterrey: "蒙特雷"
};

const factorLabels: Record<string, string> = {
  "Mild evening, altitude advantage for Mexico": "夜间天气温和，墨西哥具备高原适应优势",
  "Warm afternoon, light wind": "午后偏暖，风力较小",
  "Humid, possible late showers": "湿度较高，末段可能有阵雨",
  "Indoor controlled conditions": "室内球场，环境变量较少",
  "Hot and humid": "炎热潮湿，体能衰减更关键",
  "Mexico altitude familiarity": "墨西哥更熟悉高海拔环境",
  "South Africa compact low block": "南非低位防守压缩空间",
  "Germany expected to rotate front line": "德国锋线可能轮换",
  "Curacao goalkeeper in strong club form": "库拉索门将近期俱乐部状态出色",
  "Ecuador defensive continuity": "厄瓜多尔防线延续性更好",
  "Ivory Coast set-piece edge": "科特迪瓦定位球优势明显",
  "Japan transition threat": "日本反击转换威胁高",
  "Netherlands aerial mismatch": "荷兰高空球对位占优",
  "Tunisia defensive shape lowers total": "突尼斯防守阵型压低总进球",
  "Sweden set-piece volume": "瑞典定位球产量稳定",
  "Morocco rest defense travels well": "摩洛哥退防组织稳定",
  "Brazil forward depth advantage": "巴西前场阵容厚度占优"
};

function cnTeam(name: string) {
  return teamNameLabels[name] ?? name;
}

function cnStage(stage: string) {
  return stageLabels[stage] ?? stage;
}

function cnGroup(group: string) {
  return groupLabels[group] ?? group;
}

function cnCity(city: string) {
  return cityLabels[city] ?? city;
}

function cnFactor(factor: string) {
  if (factor.startsWith("Elo delta")) return factor.replace("Elo delta", "Elo 差值");
  return factorLabels[factor] ?? factor;
}

function formatTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone
  }).format(new Date(value));
}

function formatRefresh(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone
  }).format(new Date(value));
}

function widthPercent(value: number) {
  return `${Math.max(0, Math.min(100, value * 100))}%`;
}

function money(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 0
  }).format(value);
}

function signedMoney(value: number) {
  return `${value >= 0 ? "+" : ""}${money(value)}`;
}

function rankText(index: number) {
  return `${index + 1}`;
}

function getPrediction(data: DashboardData, matchId: string) {
  return data.predictions.find((item) => item.matchId === matchId);
}

function getOdds(data: DashboardData, matchId: string) {
  return data.odds.find((item) => item.matchId === matchId);
}

function getMatchResult(match: Match) {
  if (match.homeScore === null || match.awayScore === null) return "未开赛";
  return `${match.homeScore} : ${match.awayScore}`;
}

function getTopPick(match: Match, prediction?: PredictionSnapshot) {
  if (!prediction) return { label: "暂无预测", value: 0 };
  const picks = [
    { label: cnTeam(match.homeTeam.name), value: prediction.homeWinProbability },
    { label: "平局", value: prediction.drawProbability },
    { label: cnTeam(match.awayTeam.name), value: prediction.awayWinProbability }
  ];
  return picks.sort((a, b) => b.value - a.value)[0];
}

function sortByUserPriority(matches: Match[]) {
  const now = Date.now();
  return [...matches].sort((a, b) => {
    const aTime = new Date(a.kickoff).getTime();
    const bTime = new Date(b.kickoff).getTime();
    const aRank = a.status === "live" ? 0 : a.status === "scheduled" ? 1 : 2;
    const bRank = b.status === "live" ? 0 : b.status === "scheduled" ? 1 : 2;
    if (aRank !== bRank) return aRank - bRank;
    return Math.abs(aTime - now) - Math.abs(bTime - now);
  });
}

function MatchFocusCard({
  match,
  data,
  selected,
  onSelect,
  timeZone
}: {
  match: Match;
  data: DashboardData;
  selected: boolean;
  onSelect: () => void;
  timeZone: string;
}) {
  const prediction = getPrediction(data, match.id);
  const topPick = getTopPick(match, prediction);
  const bets = data.bets.filter((bet) => bet.matchId === match.id);
  const bestBet = bets.sort((a, b) => b.edge - a.edge)[0];

  return (
    <button className={`focus-card ${selected ? "selected" : ""}`} onClick={onSelect}>
      <div className="focus-card-top">
        <span className={`status-pill ${match.status}`}>{statusLabels[match.status]}</span>
        <span>{formatTime(match.kickoff, timeZone)}</span>
      </div>
      <div className="focus-teams">
        <div>
          <span>{match.homeTeam.flag}</span>
          <strong>{cnTeam(match.homeTeam.name)}</strong>
        </div>
        <span className="match-score">{getMatchResult(match)}</span>
        <div>
          <span>{match.awayTeam.flag}</span>
          <strong>{cnTeam(match.awayTeam.name)}</strong>
        </div>
      </div>
      <div className="focus-meta">
        <span>{cnStage(match.stage)} · {cnGroup(match.group)}</span>
        <span>{cnCity(match.city)}</span>
      </div>
      <div className="focus-pick">
        <div>
          <small>模型首选</small>
          <strong>{topPick.label}</strong>
        </div>
        <div>
          <small>概率</small>
          <strong>{percent(topPick.value)}</strong>
        </div>
        <div>
          <small>价值下注</small>
          <strong>{bestBet ? `${cnTeam(bestBet.selection)} ${percent(bestBet.edge)}` : "暂无"}</strong>
        </div>
      </div>
    </button>
  );
}

function PredictionBars({ prediction }: { prediction?: PredictionSnapshot }) {
  const rows = [
    { label: "主胜", value: prediction?.homeWinProbability ?? 0, tone: "home" },
    { label: "平局", value: prediction?.drawProbability ?? 0, tone: "draw" },
    { label: "客胜", value: prediction?.awayWinProbability ?? 0, tone: "away" }
  ];

  return (
    <div className="prediction-bars">
      {rows.map((row) => (
        <div className="prob-line" key={row.label}>
          <span>{row.label}</span>
          <div className={`bar ${row.tone}`}>
            <span style={{ width: widthPercent(row.value) }} />
          </div>
          <strong>{percent(row.value, 0)}</strong>
        </div>
      ))}
    </div>
  );
}

function ComparisonRow({
  match,
  data,
  timeZone,
  selected,
  onSelect
}: {
  match: Match;
  data: DashboardData;
  timeZone: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const prediction = getPrediction(data, match.id);
  const topPick = getTopPick(match, prediction);
  const odds = getOdds(data, match.id);
  const fair = odds ? computeFairProbabilities(odds) : [];
  const bestPrice = fair.find((item) => cnTeam(item.outcome) === topPick.label) ?? fair[0];

  return (
    <button className={`comparison-row ${selected ? "selected" : ""}`} onClick={onSelect}>
      <div className="comparison-main">
        <span className={`status-pill ${match.status}`}>{statusLabels[match.status]}</span>
        <div>
          <strong>
            {match.homeTeam.flag} {cnTeam(match.homeTeam.name)} vs {match.awayTeam.flag} {cnTeam(match.awayTeam.name)}
          </strong>
          <small>
            {formatTime(match.kickoff, timeZone)} · {cnStage(match.stage)} · {cnCity(match.city)}
          </small>
        </div>
      </div>
      <div className="comparison-result">
        <small>赛果</small>
        <strong>{getMatchResult(match)}</strong>
      </div>
      <div className="comparison-result">
        <small>预测</small>
        <strong>{topPick.label}</strong>
      </div>
      <div className="comparison-result">
        <small>概率/赔率</small>
        <strong>
          {percent(topPick.value, 0)} {bestPrice ? `@ ${bestPrice.decimalOdds.toFixed(2)}` : ""}
        </strong>
      </div>
    </button>
  );
}

export default function Page() {
  const [data, setData] = useState<DashboardData>(initialData);
  const [selectedMatchId, setSelectedMatchId] = useState(initialData.matches[1]?.id ?? initialData.matches[0].id);
  const [stage, setStage] = useState("All");
  const [team, setTeam] = useState("All");
  const [timezone, setTimezone] = useState("Asia/Shanghai");
  const [query, setQuery] = useState("");
  const [busyAction, setBusyAction] = useState<"odds" | "predictions" | null>(null);
  const [notice, setNotice] = useState(isStaticDemo ? "在线演示版已载入缓存赔率和模型预测" : "已载入缓存赔率，正在检查实时赔率源");
  const [mounted, setMounted] = useState(false);

  async function loadData(nextNotice?: string) {
    if (isStaticDemo) {
      setNotice(nextNotice ?? "在线演示版使用随代码发布的缓存赔率和模型预测");
      return;
    }

    const response = await fetch("/api/data", { cache: "no-store" });
    if (!response.ok) {
      setNotice("实时数据暂时不可用，继续展示缓存赔率");
      return;
    }
    const nextData = (await response.json()) as DashboardData;
    setData(nextData);
    setNotice(nextNotice ?? (nextData.odds.some((item) => item.source === "the-odds-api") ? "已接入实时赔率" : "当前使用缓存赔率演示"));
  }

  async function runJob(kind: "odds" | "predictions") {
    if (isStaticDemo) {
      setNotice(kind === "odds" ? "在线演示版不能直接刷新赔率；推送新数据后页面会自动更新" : "在线演示版不能直接重跑预测；推送新预测后页面会自动更新");
      return;
    }

    setBusyAction(kind);
    const endpoint = kind === "odds" ? "/api/jobs/refresh-odds" : "/api/jobs/run-predictions";
    try {
      await fetch(endpoint, { method: "POST" });
      await loadData(kind === "odds" ? "赔率刷新完成" : "预测重跑完成");
    } catch {
      setNotice("任务执行失败，继续展示上一次可用数据");
    } finally {
      setBusyAction(null);
    }
  }

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const selectedMatch = data.matches.find((match) => match.id === selectedMatchId) ?? data.matches[0];
  const selectedPrediction = getPrediction(data, selectedMatch.id);
  const selectedOdds = getOdds(data, selectedMatch.id);
  const selectedFair = selectedOdds ? computeFairProbabilities(selectedOdds) : [];
  const selectedBets = data.bets.filter((item) => item.matchId === selectedMatch.id);
  const selectedTopPick = getTopPick(selectedMatch, selectedPrediction);

  const focusMatches = useMemo(() => sortByUserPriority(data.matches).slice(0, 4), [data.matches]);
  const rankingBets = useMemo(() => [...data.bets].sort((a, b) => b.profit - a.profit).slice(0, 6), [data.bets]);

  const filteredMatches = useMemo(() => {
    return sortByUserPriority(data.matches).filter((match) => {
      const stageMatch = stage === "All" || match.stage === stage;
      const teamMatch = team === "All" || match.homeTeam.name === team || match.awayTeam.name === team || match.group === team;
      const haystack = [
        match.homeTeam.name,
        match.awayTeam.name,
        cnTeam(match.homeTeam.name),
        cnTeam(match.awayTeam.name),
        match.city,
        cnCity(match.city),
        match.group,
        cnGroup(match.group)
      ]
        .join(" ")
        .toLowerCase();
      const queryMatch = query.trim().length === 0 || haystack.includes(query.toLowerCase());
      return stageMatch && teamMatch && queryMatch;
    });
  }, [data.matches, stage, team, query]);

  const filterValues = data.matches
    .flatMap((match) => [match.homeTeam.name, match.awayTeam.name, match.group])
    .filter((value, index, array) => array.indexOf(value) === index);

  const chartData = data.performance.equityCurve;
  const liveCount = data.matches.filter((match) => match.status === "live").length;
  const finalCount = data.matches.filter((match) => match.status === "final").length;
  const nextCount = data.matches.filter((match) => match.status === "scheduled").length;

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#nearby">
            <div className="brand-mark">世</div>
            <div>
              <h1 className="brand-title">世界杯 AI 预测台</h1>
              <p className="brand-subtitle">赛程、赔率、模型判断和模拟收益</p>
            </div>
          </a>

          <nav className="nav">
            <a href="#nearby">临近赛况</a>
            <a href="#returns">预测收益</a>
            <a href="#comparison">全量对比</a>
          </nav>

          <div className="top-actions">
            <select className="timezone-select" value={timezone} onChange={(event) => setTimezone(event.target.value)} aria-label="切换时区">
              {timezones.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button className="icon-button" title="刷新赔率" onClick={() => runJob("odds")} disabled={busyAction !== null}>
              <RefreshCcw size={16} />
            </button>
            <button className="icon-button primary" title="运行预测" onClick={() => runJob("predictions")} disabled={busyAction !== null}>
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="risk-strip" aria-label="风险提示">
          <strong>重要提示</strong>
          <span>预测仅供技术交流和娱乐参考，不构成投注建议。理性看球，别让模型替你冲动决策。</span>
        </section>

        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">AI Prediction Board</span>
            <h2>世界杯预测看板 2026</h2>
            <p>{notice} · 最近刷新 {formatRefresh(data.lastRefresh, timezone)}</p>
            <div className="hero-actions">
              <a href="#nearby">查看临近比赛</a>
              <a href="#returns">收益排行榜</a>
            </div>
          </div>
          <div className="hero-stats">
            <div>
              <small>即将开赛</small>
              <strong>{nextCount}</strong>
            </div>
            <div>
              <small>进行中</small>
              <strong>{liveCount}</strong>
            </div>
            <div>
              <small>刚结束</small>
              <strong>{finalCount}</strong>
            </div>
          </div>
        </section>

        <section className="leaderboard-card" aria-label="收益排行榜摘要">
          <div className="leaderboard-head">
            <div>
              <span>LLM Profit Board</span>
              <h2>收益排行榜</h2>
            </div>
            <small>最新 {formatRefresh(data.lastRefresh, timezone)}</small>
          </div>
          <div className="leaderboard-list">
            {rankingBets.map((bet, index) => (
              <div key={bet.id} className="leaderboard-row">
                <span className="rank-badge">{rankText(index)}</span>
                <div>
                  <strong>{cnTeam(bet.selection)}</strong>
                  <small>{bet.bookmaker} · {betStatusLabels[bet.status]}</small>
                </div>
                <b className={bet.profit >= 0 ? "positive" : "negative"}>{signedMoney(bet.profit)}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card" id="nearby">
          <div className="section-head">
            <div>
              <h2>
                <Clock3 size={19} />
                临近赛况
              </h2>
              <p>即将开赛和刚结束的比赛放在最前面，点一场即可查看预测、赔率和解释信号。</p>
            </div>
            <span className="section-index">01</span>
          </div>

          <div className="nearby-grid">
            <div className="focus-list">
              {focusMatches.map((match) => (
                <MatchFocusCard
                  key={match.id}
                  match={match}
                  data={data}
                  selected={selectedMatchId === match.id}
                  onSelect={() => setSelectedMatchId(match.id)}
                  timeZone={timezone}
                />
              ))}
            </div>

            <aside className="match-detail">
              <div className="detail-hero">
                <span className={`status-pill ${selectedMatch.status}`}>{statusLabels[selectedMatch.status]}</span>
                <h3>
                  {selectedMatch.homeTeam.flag} {cnTeam(selectedMatch.homeTeam.name)} vs {selectedMatch.awayTeam.flag} {cnTeam(selectedMatch.awayTeam.name)}
                </h3>
                <p>
                  {formatTime(selectedMatch.kickoff, timezone)} · {cnStage(selectedMatch.stage)} · {cnGroup(selectedMatch.group)} · {cnCity(selectedMatch.city)}
                </p>
              </div>

              <div className="decision-card">
                <small>模型建议</small>
                <strong>{selectedTopPick.label}</strong>
                <span>胜出概率 {percent(selectedTopPick.value)}，最可能比分 {selectedPrediction?.mostLikelyScore ?? "—"}</span>
              </div>

              <PredictionBars prediction={selectedPrediction} />

              <div className="detail-mini-grid">
                <div>
                  <small>置信度</small>
                  <strong>{percent(selectedPrediction?.confidence ?? 0)}</strong>
                </div>
                <div>
                  <small>大 2.5 球</small>
                  <strong>{percent(selectedPrediction?.over25Probability ?? 0)}</strong>
                </div>
                <div>
                  <small>双方进球</small>
                  <strong>{percent(selectedPrediction?.bttsProbability ?? 0)}</strong>
                </div>
              </div>

              <div className="detail-block">
                <h4>
                  <CircleDollarSign size={15} />
                  价值赔率
                </h4>
                <div className="odds-chips">
                  {selectedFair.slice(0, 5).map((item) => (
                    <span key={`${item.outcome}-${item.bookmaker}`}>
                      {cnTeam(item.outcome)} <b>{item.decimalOdds.toFixed(2)}</b>
                    </span>
                  ))}
                </div>
              </div>

              <div className="detail-block">
                <h4>
                  <Activity size={15} />
                  影响因素
                </h4>
                <ul className="plain-list">
                  {selectedPrediction?.topFactors.map((factor) => <li key={factor}>{cnFactor(factor)}</li>)}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="section-card returns-card" id="returns">
          <div className="section-head">
            <div>
              <h2>
                <LineChart size={19} />
                预测收益
              </h2>
              <p>把模型预测转成模拟投注后的账户表现，优先看收益、风险和仍未结算的敞口。</p>
            </div>
            <span className="section-index">02</span>
          </div>

          <div className="returns-layout">
            <div className="bankroll-card">
              <small>当前模拟本金</small>
              <strong>{money(data.performance.currentBankroll)}</strong>
              <span className={data.performance.totalProfit >= 0 ? "positive" : "negative"}>
                {signedMoney(data.performance.totalProfit)} · ROI {percent(data.performance.roi)}
              </span>
            </div>

            <div className="metric-grid">
              <div className="metric-tile">
                <Target size={17} />
                <small>命中率</small>
                <strong>{percent(data.performance.hitRate)}</strong>
              </div>
              <div className="metric-tile">
                <ShieldCheck size={17} />
                <small>最大回撤</small>
                <strong>{percent(data.performance.maxDrawdown)}</strong>
              </div>
              <div className="metric-tile">
                <CalendarDays size={17} />
                <small>未结算</small>
                <strong>{data.performance.openBets} 笔</strong>
              </div>
              <div className="metric-tile">
                <ChartColumn size={17} />
                <small>平均 CLV</small>
                <strong>{percent(data.performance.averageClv, 1)}</strong>
              </div>
            </div>

            <div className="chart-panel">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="bankrollFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00a878" stopOpacity={0.34} />
                        <stop offset="95%" stopColor="#00a878" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(31, 41, 55, 0.12)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="bankroll" stroke="#00a878" fill="url(#bankrollFill)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>

          <div className="ticket-list">
            {data.bets.slice(0, 5).map((bet) => (
              <div key={bet.id} className="ticket-row">
                <div>
                  <span className={`status-badge ${bet.status}`}>{betStatusLabels[bet.status]}</span>
                  <h3>{cnTeam(bet.selection)}</h3>
                  <p>{bet.bookmaker} · 胜平负 · {bet.placedAt.slice(0, 10)}</p>
                </div>
                <div className="ticket-numbers">
                  <span>本金 {bet.stake.toFixed(0)}</span>
                  <span>赔率 {bet.decimalOdds.toFixed(2)}</span>
                  <span>边际 {percent(bet.edge)}</span>
                  <strong className={bet.profit >= 0 ? "positive" : "negative"}>{signedMoney(bet.profit)}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card" id="comparison">
          <div className="section-head">
            <div>
              <h2>
                <History size={19} />
                全量赛程、赛果与预测对比
              </h2>
              <p>完整列表用于复盘：赛果、模型首选、概率和市场赔率放在同一行。</p>
            </div>
            <span className="section-index">03</span>
          </div>

          <div className="filters">
            <label className="search-box">
              <Search size={15} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索球队、城市、分组" />
            </label>
            <select value={stage} onChange={(event) => setStage(event.target.value)}>
              <option value="All">全部阶段</option>
              <option value="Group Stage">小组赛</option>
              <option value="Round of 32">32 强</option>
              <option value="Round of 16">16 强</option>
              <option value="Quarterfinal">1/4 决赛</option>
              <option value="Semifinal">半决赛</option>
              <option value="Third-place Match">三四名决赛</option>
              <option value="Final">决赛</option>
            </select>
            <select value={team} onChange={(event) => setTeam(event.target.value)}>
              <option value="All">全部球队/小组</option>
              {filterValues.map((value) => (
                <option key={value} value={value}>
                  {teamNameLabels[value] ?? groupLabels[value] ?? value}
                </option>
              ))}
            </select>
          </div>

          <div className="comparison-list">
            {filteredMatches.map((match) => (
              <ComparisonRow
                key={match.id}
                match={match}
                data={data}
                timeZone={timezone}
                selected={selectedMatchId === match.id}
                onSelect={() => setSelectedMatchId(match.id)}
              />
            ))}
            {filteredMatches.length === 0 ? <div className="empty-state">没有匹配的比赛。</div> : null}
          </div>
        </section>

        <section className="section-card compact-section">
          <div className="section-head">
            <div>
              <h2>
                <Trophy size={19} />
                冠军概率速览
              </h2>
              <p>保留锦标赛模拟，但弱化到页面末尾，避免干扰赛前决策。</p>
            </div>
          </div>
          <div className="projection-list">
            {data.tournament.slice(0, 6).map((item) => (
              <div key={item.team.id} className="projection-row">
                <strong>
                  {item.team.flag} {cnTeam(item.team.name)}
                </strong>
                <span>出线 {percent(item.qualify)}</span>
                <span>四强 {percent(item.semiFinal)}</span>
                <span>冠军 {percent(item.champion)}</span>
                <ArrowUpRight size={15} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="mobile-tabs">
        <a href="#nearby">赛况</a>
        <a href="#returns">收益</a>
        <a href="#comparison">对比</a>
      </nav>
    </div>
  );
}
