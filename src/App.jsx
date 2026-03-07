import { useState, useRef } from "react";

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  en: {
    tagline: "AI-Powered Financial Intelligence",
    langBtn: "中文",
    label: "Topics — separate multiple with commas",
    placeholder: "e.g. semiconductors, Federal Reserve, Tesla earnings",
    analyseBtn: "Analyse",
    hint: "Searches real-time financial news · Powered by Claude",
    loadingNews: "Searching financial news from the last 24 hours...",
    loadingAdvice: "Generating stock recommendations...",
    loadingAccum: "Detecting smart money accumulation signals...",
    error: "Something went wrong. Please try again.",
    newsSection: "Latest News",
    newsCount: (n) => `${n} articles · last 24 hrs`,
    adviceSection: "Stock Recommendations",
    adviceDisclaimer: "AI-generated · not financial advice",
    accumSection: "Smart Money Signal",
    accumDisclaimer: "Institutional accumulation pattern detected",
    emptyState: "Enter a topic above to get started",
    fallbackSource: "Financial News",
    confidence: "Confidence",
    accumLabel: "ACCUMULATION",
    accumStrength: "Signal Strength",
    accumPhase: "Phase",
    accumPhaseVal: "Wyckoff Accumulation",
    ratings: { BUY: "BUY", WATCH: "WATCH", AVOID: "AVOID" },
    newsPrompt: (topics) =>
      `Search the web for the latest financial news from the last 24 hours related to these topics: ${topics.join(", ")}.

Return ONLY a raw JSON object (no markdown, no backticks) in this exact format:
{
  "articles": [
    {
      "title": "Article headline",
      "source": "Publication name",
      "summary": "2-3 sentence summary of the article and its financial relevance"
    }
  ]
}

Return 6-8 articles total. Focus on stock market, earnings, economic data, and investment-relevant news only.`,
    advicePrompt: (topics, newsText) =>
      `Based on this financial news about ${topics.join(", ")}:

${newsText}

Generate exactly 3 stock recommendations. Return ONLY a raw JSON object (no markdown, no backticks) in this format:
{
  "advice": [
    {
      "ticker": "AAPL",
      "company": "Apple Inc.",
      "rating": "BUY",
      "reasoning": "2-3 sentence explanation grounded in the news above",
      "confidence": 75
    }
  ]
}

Rating must be one of: BUY, WATCH, or AVOID. Confidence is a number 40-95. Make recommendations directly tied to the news found.`,
    accumPrompt: (topics, newsText) =>
      `Based on this financial news about ${topics.join(", ")}:

${newsText}

Identify ONE stock where institutional investors appear to be quietly accumulating shares — the price has been moving sideways at a relatively low base, volume patterns suggest smart money absorption, and a breakout may be forthcoming. This is a Wyckoff-style accumulation pattern.

Return ONLY a raw JSON object (no markdown, no backticks) in this format:
{
  "accum": {
    "ticker": "MSFT",
    "company": "Microsoft Corp.",
    "reasoning": "2-3 sentences explaining the sideways price action, volume absorption clues, and why a breakout may be near",
    "signal_strength": 78,
    "key_levels": "Support: $XXX / Resistance: $XXX",
    "watch_for": "One sentence on what to watch as a breakout confirmation trigger"
  }
}

signal_strength is a number 50-95. Base the pick on the news context provided.`,
  },
  zh: {
    tagline: "AI 驱动的财经智能分析平台",
    langBtn: "English",
    label: "输入主题 — 多个主题请用逗号分隔",
    placeholder: "例如：半导体、国有银行、央企改革",
    analyseBtn: "分析",
    hint: "实时搜索财经新闻 · 由 Claude 提供支持",
    loadingNews: "正在搜索过去24小时的财经新闻……",
    loadingAdvice: "正在生成国有企业股票投资建议……",
    loadingAccum: "正在检测机构资金吸筹信号……",
    error: "出现错误，请稍后重试。",
    newsSection: "最新资讯",
    newsCount: (n) => `共 ${n} 篇 · 过去24小时`,
    adviceSection: "国企股票投资建议",
    adviceDisclaimer: "AI 生成 · 仅供参考，非正式投资建议",
    accumSection: "主力资金信号",
    accumDisclaimer: "检测到机构吸筹形态",
    emptyState: "请在上方输入主题开始分析",
    fallbackSource: "财经资讯",
    confidence: "置信度",
    accumLabel: "吸筹建仓",
    accumStrength: "信号强度",
    accumPhase: "阶段",
    accumPhaseVal: "威科夫吸筹阶段",
    ratings: { BUY: "买入", WATCH: "关注", AVOID: "回避" },
    newsPrompt: (topics) =>
      `请在网上搜索过去24小时内与以下主题相关的最新财经新闻：${topics.join("、")}。

仅返回原始JSON对象（无markdown，无反引号），格式如下：
{
  "articles": [
    {
      "title": "文章标题（中文）",
      "source": "媒体来源名称",
      "summary": "2-3句话的中文摘要，说明文章内容及其财经相关性"
    }
  ]
}

共返回6-8篇文章。仅关注股票市场、财报、经济数据和投资相关新闻。所有内容必须用中文输出。`,
    advicePrompt: (topics, newsText) =>
      `根据以下关于"${topics.join("、")}"的财经新闻：

${newsText}

请生成恰好3条股票投资建议。

【重要限制】：只能推荐中国A股或港股市场中的国有企业（央企或地方国企），例如中国工商银行、中国石油、中国移动、中国建筑、招商银行等。严禁推荐任何民营企业或外资企业股票。

仅返回原始JSON对象（无markdown，无反引号），格式如下：
{
  "advice": [
    {
      "ticker": "601398.SS",
      "company": "中国工商银行",
      "rating": "BUY",
      "reasoning": "结合上述新闻的2-3句中文分析说明",
      "confidence": 75
    }
  ]
}

rating必须是以下之一：BUY、WATCH或AVOID。confidence为40-95之间的整数。所有reasoning和company字段必须用中文输出。只能推荐国有企业股票。`,
    accumPrompt: (topics, newsText) =>
      `根据以下关于"${topics.join("、")}"的财经新闻：

${newsText}

请从中国A股或港股国有企业中，找出一只疑似机构资金正在悄然吸筹的股票——股价在低位横盘整理，成交量形态显示主力资金在吸收筹码，可能即将迎来突破行情。这是威科夫吸筹理论的典型形态。

仅返回原始JSON对象（无markdown，无反引号），格式如下：
{
  "accum": {
    "ticker": "601398.SS",
    "company": "中国工商银行",
    "reasoning": "2-3句中文说明，解释横盘走势、成交量吸筹特征及潜在突破逻辑",
    "signal_strength": 78,
    "key_levels": "支撑位：XX元 / 压力位：XX元",
    "watch_for": "一句话说明需关注的突破确认信号"
  }
}

signal_strength为50-95之间的整数。必须只推荐国有企业股票，所有字段用中文输出（ticker除外）。`,
  },
};

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#FAFAF8", surface: "#FFFFFF", border: "#E8E6E1",
  text: "#1A1A18", muted: "#6B6860", accent: "#C8963E",
  buy: "#2D7A4F", watch: "#C8963E", avoid: "#B03A2E",
  buyBg: "#EAF5EE", watchBg: "#FDF6EC", avoidBg: "#FAEAEA",
  accum: "#2C4A7C", accumBg: "#EEF3FB", accumBorder: "#4A72B8",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const style = {
  app: { minHeight: "100vh", backgroundColor: COLORS.bg, fontFamily: "'Georgia', 'Times New Roman', serif", color: COLORS.text },
  header: { borderBottom: `1px solid ${COLORS.border}`, padding: "28px 48px 20px", display: "flex", alignItems: "center", gap: "16px" },
  logo: { fontSize: "22px", fontWeight: "700", letterSpacing: "-0.5px", color: COLORS.text, fontFamily: "'Georgia', serif" },
  logoAccent: { color: COLORS.accent },
  tagline: { fontSize: "12px", color: COLORS.muted, fontFamily: "'Courier New', monospace", letterSpacing: "0.08em", textTransform: "uppercase", flex: 1 },
  langToggle: { backgroundColor: "transparent", border: `1.5px solid ${COLORS.border}`, borderRadius: "4px", padding: "6px 14px", fontSize: "12px", fontFamily: "'Courier New', monospace", letterSpacing: "0.08em", color: COLORS.muted, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" },
  main: { maxWidth: "960px", margin: "0 auto", padding: "48px 24px" },
  inputSection: { marginBottom: "48px" },
  label: { display: "block", fontSize: "11px", fontFamily: "'Courier New', monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.muted, marginBottom: "12px" },
  inputRow: { display: "flex", gap: "12px", alignItems: "stretch" },
  input: { flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: "4px", padding: "14px 18px", fontSize: "16px", fontFamily: "'Georgia', serif", backgroundColor: COLORS.surface, color: COLORS.text, outline: "none", transition: "border-color 0.2s" },
  btn: { backgroundColor: COLORS.text, color: "#FFFFFF", border: "none", borderRadius: "4px", padding: "14px 28px", fontSize: "13px", fontFamily: "'Courier New', monospace", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", transition: "opacity 0.2s" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  hint: { marginTop: "10px", fontSize: "12px", color: COLORS.muted, fontFamily: "'Courier New', monospace" },
  sectionTitle: { fontSize: "11px", fontFamily: "'Courier New', monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.muted, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" },
  divider: { flex: 1, height: "1px", backgroundColor: COLORS.border },
  newsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "48px" },
  newsCard: { backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "20px" },
  newsSource: { fontSize: "10px", fontFamily: "'Courier New', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.accent, marginBottom: "8px" },
  newsTitle: { fontSize: "15px", lineHeight: "1.5", fontWeight: "600", color: COLORS.text, marginBottom: "10px" },
  newsSummary: { fontSize: "13px", lineHeight: "1.65", color: COLORS.muted },
  // advice cards — 4-col grid
  cardsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" },
  adviceCard: (r) => ({ backgroundColor: r === "BUY" ? COLORS.buyBg : r === "WATCH" ? COLORS.watchBg : COLORS.avoidBg, border: `1.5px solid ${r === "BUY" ? COLORS.buy : r === "WATCH" ? COLORS.watch : COLORS.avoid}`, borderRadius: "6px", padding: "22px 18px" }),
  ratingBadge: (r) => ({ display: "inline-block", fontSize: "10px", fontFamily: "'Courier New', monospace", letterSpacing: "0.12em", fontWeight: "700", color: "#FFFFFF", backgroundColor: r === "BUY" ? COLORS.buy : r === "WATCH" ? COLORS.watch : COLORS.avoid, borderRadius: "3px", padding: "3px 8px", marginBottom: "12px" }),
  ticker: { fontSize: "22px", fontFamily: "'Courier New', monospace", fontWeight: "700", letterSpacing: "-0.5px", color: COLORS.text, marginBottom: "4px" },
  companyName: { fontSize: "11px", color: COLORS.muted, marginBottom: "14px", fontFamily: "'Courier New', monospace" },
  reasoning: { fontSize: "13px", lineHeight: "1.65", color: COLORS.text, marginBottom: "14px", borderTop: `1px solid rgba(0,0,0,0.08)`, paddingTop: "14px" },
  confidenceRow: { display: "flex", alignItems: "center", gap: "8px" },
  confidenceLabel: { fontSize: "10px", fontFamily: "'Courier New', monospace", color: COLORS.muted, letterSpacing: "0.05em", textTransform: "uppercase", minWidth: "60px" },
  confidenceBar: { flex: 1, height: "4px", backgroundColor: "rgba(0,0,0,0.08)", borderRadius: "2px", overflow: "hidden", position: "relative" },
  confidenceFill: (pct, r) => ({ position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`, backgroundColor: r === "BUY" ? COLORS.buy : r === "WATCH" ? COLORS.watch : COLORS.avoid, borderRadius: "2px" }),
  confidencePct: { fontSize: "11px", fontFamily: "'Courier New', monospace", color: COLORS.muted, minWidth: "32px", textAlign: "right" },
  // accumulation card
  accumCard: { backgroundColor: COLORS.accumBg, border: `1.5px solid ${COLORS.accumBorder}`, borderRadius: "6px", padding: "22px 18px" },
  accumBadge: { display: "inline-block", fontSize: "10px", fontFamily: "'Courier New', monospace", letterSpacing: "0.12em", fontWeight: "700", color: "#FFFFFF", backgroundColor: COLORS.accum, borderRadius: "3px", padding: "3px 8px", marginBottom: "12px" },
  accumTicker: { fontSize: "22px", fontFamily: "'Courier New', monospace", fontWeight: "700", letterSpacing: "-0.5px", color: COLORS.accum, marginBottom: "4px" },
  accumCompany: { fontSize: "11px", color: COLORS.accum, opacity: 0.7, marginBottom: "14px", fontFamily: "'Courier New', monospace" },
  accumReasoning: { fontSize: "13px", lineHeight: "1.65", color: COLORS.text, marginBottom: "12px", borderTop: `1px solid rgba(44,74,124,0.15)`, paddingTop: "14px" },
  accumMeta: { fontSize: "11px", fontFamily: "'Courier New', monospace", color: COLORS.accum, lineHeight: "1.8", marginBottom: "12px", backgroundColor: "rgba(44,74,124,0.06)", borderRadius: "4px", padding: "10px 12px" },
  accumMetaLabel: { color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.08em" },
  accumSignalRow: { display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" },
  accumSignalLabel: { fontSize: "10px", fontFamily: "'Courier New', monospace", color: COLORS.accum, letterSpacing: "0.05em", textTransform: "uppercase", minWidth: "60px", opacity: 0.8 },
  accumSignalBar: { flex: 1, height: "4px", backgroundColor: "rgba(44,74,124,0.15)", borderRadius: "2px", overflow: "hidden", position: "relative" },
  accumSignalFill: (pct) => ({ position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`, backgroundColor: COLORS.accum, borderRadius: "2px" }),
  accumSignalPct: { fontSize: "11px", fontFamily: "'Courier New', monospace", color: COLORS.accum, minWidth: "32px", textAlign: "right" },
  status: { textAlign: "center", padding: "64px 24px", color: COLORS.muted, fontSize: "14px", fontFamily: "'Courier New', monospace", letterSpacing: "0.05em" },
  statusDot: { display: "inline-block", width: "6px", height: "6px", backgroundColor: COLORS.accent, borderRadius: "50%", marginRight: "8px", animation: "pulse 1.2s ease-in-out infinite" },
  error: { backgroundColor: "#FFF0F0", border: `1px solid ${COLORS.avoid}`, borderRadius: "6px", padding: "16px 20px", color: COLORS.avoid, fontSize: "13px", fontFamily: "'Courier New', monospace" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseJSON(text, key) {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed[key] || parsed;
  } catch { return null; }
}

// Try direct Anthropic API first (Claude.ai preview handles auth automatically),
// then fall back to /api/claude proxy (for Vercel deployment).
async function callClaude(body) {
  const directHeaders = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    "anthropic-beta": "web-search-2025-03-05",
  };
  const proxyHeaders = { "Content-Type": "application/json" };

  let data;
  let lastError;

  // Try direct API first (Claude.ai preview)
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: directHeaders,
      body: JSON.stringify(body),
    });
    data = await res.json();
    if (Array.isArray(data?.content)) return data;
    lastError = data?.error?.message || `Direct API: ${JSON.stringify(data)}`;
  } catch (e) {
    lastError = e.message;
  }

  // Try proxy (Vercel)
  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: proxyHeaders,
      body: JSON.stringify(body),
    });
    data = await res.json();
    if (Array.isArray(data?.content)) return data;
    lastError = data?.error?.message || `Proxy: ${JSON.stringify(data)}`;
  } catch (e) {
    lastError = e.message;
  }

  throw new Error(lastError || "No valid response from API");
}

// ─── Components ───────────────────────────────────────────────────────────────
function NewsCard({ article, t }) {
  return (
    <div style={style.newsCard}>
      <div style={style.newsSource}>{article.source || t.fallbackSource}</div>
      <div style={style.newsTitle}>{article.title}</div>
      <div style={style.newsSummary}>{article.summary}</div>
    </div>
  );
}

function AdviceCard({ item, t }) {
  const pct = parseInt(item.confidence) || 70;
  return (
    <div style={style.adviceCard(item.rating)}>
      <div style={style.ratingBadge(item.rating)}>{t.ratings[item.rating] || item.rating}</div>
      <div style={style.ticker}>{item.ticker}</div>
      <div style={style.companyName}>{item.company}</div>
      <div style={style.reasoning}>{item.reasoning}</div>
      <div style={style.confidenceRow}>
        <span style={style.confidenceLabel}>{t.confidence}</span>
        <div style={style.confidenceBar}>
          <div style={style.confidenceFill(pct, item.rating)} />
        </div>
        <span style={style.confidencePct}>{pct}%</span>
      </div>
    </div>
  );
}

function AccumCard({ data, t }) {
  const pct = parseInt(data.signal_strength) || 70;
  return (
    <div style={style.accumCard}>
      <div style={style.accumBadge}>◈ {t.accumLabel}</div>
      <div style={style.accumTicker}>{data.ticker}</div>
      <div style={style.accumCompany}>{data.company}</div>
      <div style={style.accumReasoning}>{data.reasoning}</div>
      <div style={style.accumMeta}>
        {data.key_levels && (
          <div><span style={style.accumMetaLabel}>{t.accumPhase}: </span>{t.accumPhaseVal}<br />{data.key_levels}</div>
        )}
        {data.watch_for && (
          <div style={{ marginTop: "6px" }}><span style={style.accumMetaLabel}>▶ </span>{data.watch_for}</div>
        )}
      </div>
      <div style={style.accumSignalRow}>
        <span style={style.accumSignalLabel}>{t.accumStrength}</span>
        <div style={style.accumSignalBar}>
          <div style={style.accumSignalFill(pct)} />
        </div>
        <span style={style.accumSignalPct}>{pct}%</span>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("en");
  const [topicsInput, setTopicsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [news, setNews] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [accum, setAccum] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const t = T[lang];

  async function fetchData() {
    const topics = topicsInput.split(/[,、]/).map((s) => s.trim()).filter(Boolean);
    if (!topics.length) return;

    setLoading(true);
    setError(null);
    setNews(null);
    setAdvice(null);
    setAccum(null);

    try {
      // Step 1: news
      setLoadingStep(t.loadingNews);
      const newsData = await callClaude({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: t.newsPrompt(topics) }],
      });
      const newsText = newsData.content.map((b) => b.type === "text" ? b.text : "").join("");
      const parsedNews = parseJSON(newsText, "articles");
      if (parsedNews) setNews(parsedNews);

      // Step 2: advice
      setLoadingStep(t.loadingAdvice);
      const adviceData = await callClaude({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: t.advicePrompt(topics, newsText) }],
      });
      const adviceText = adviceData.content.map((b) => b.type === "text" ? b.text : "").join("");
      const parsedAdvice = parseJSON(adviceText, "advice");
      if (parsedAdvice) setAdvice(parsedAdvice);

      // Step 3: smart money accumulation
      setLoadingStep(t.loadingAccum);
      const accumData = await callClaude({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: t.accumPrompt(topics, newsText) }],
      });
      const accumText = accumData.content.map((b) => b.type === "text" ? b.text : "").join("");
      const parsedAccum = parseJSON(accumText, "accum");
      if (parsedAccum) setAccum(parsedAccum);

    } catch (err) {
      setError(err?.message || t.error);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  return (
    <div style={style.app}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        input:focus { border-color: #C8963E !important; }
        button:hover:not(:disabled) { opacity: 0.78; }
        .lang-btn:hover { border-color: #C8963E !important; color: #C8963E !important; }
        @media (max-width: 700px) {
          .cards-grid { grid-template-columns: 1fr 1fr !important; }
          .news-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <header style={style.header}>
        <div style={style.logo}>signal<span style={style.logoAccent}>.</span>brief</div>
        <div style={style.tagline}>{t.tagline}</div>
        <button className="lang-btn" style={style.langToggle} onClick={() => setLang(lang === "en" ? "zh" : "en")}>
          {t.langBtn}
        </button>
      </header>

      <main style={style.main}>
        <div style={style.inputSection}>
          <label style={style.label}>{t.label}</label>
          <div style={style.inputRow}>
            <input
              ref={inputRef}
              style={style.input}
              placeholder={t.placeholder}
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && fetchData()}
              disabled={loading}
            />
            <button
              style={{ ...style.btn, ...(loading ? style.btnDisabled : {}) }}
              onClick={fetchData}
              disabled={loading || !topicsInput.trim()}
            >
              {t.analyseBtn}
            </button>
          </div>
          <div style={style.hint}>{t.hint}</div>
        </div>

        {error && <div style={style.error}>⚠ {error}</div>}

        {loading && (
          <div style={style.status}>
            <span style={style.statusDot} />{loadingStep}
          </div>
        )}

        {news && news.length > 0 && (
          <div style={{ marginBottom: "48px" }}>
            <div style={style.sectionTitle}>
              {t.newsSection}<div style={style.divider} />{t.newsCount(news.length)}
            </div>
            <div className="news-grid" style={style.newsGrid}>
              {news.map((a, i) => <NewsCard key={i} article={a} t={t} />)}
            </div>
          </div>
        )}

        {(advice?.length > 0 || accum) && (
          <div>
            <div style={style.sectionTitle}>
              {t.adviceSection}<div style={style.divider} />{t.adviceDisclaimer}
            </div>
            <div className="cards-grid" style={style.cardsGrid}>
              {advice && advice.map((item, i) => <AdviceCard key={i} item={item} t={t} />)}
              {accum && <AccumCard data={accum} t={t} />}
            </div>
          </div>
        )}

        {!loading && !news && !error && (
          <div style={style.status}>{t.emptyState}</div>
        )}
      </main>
    </div>
  );
}
