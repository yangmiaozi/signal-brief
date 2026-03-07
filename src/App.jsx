import { useState, useRef } from "react";

const T = {
  en: {
    tagline: "AI-Powered Financial Intelligence",
    langBtn: "中文",
    label: "Topics — separate multiple with commas",
    placeholder: "e.g. semiconductors, Federal Reserve, Tesla earnings",
    analyseBtn: "Analyse",
    hint: "AI-powered financial analysis · Free preview",
    loadingNews: "Generating financial news context...",
    loadingAdvice: "Generating stock recommendations...",
    loadingAccum: "Detecting smart money signals...",
    error: "Something went wrong. Please try again.",
    newsSection: "Latest News",
    newsCount: (n) => `${n} articles · last 24 hrs`,
    adviceSection: "Stock Recommendations",
    adviceDisclaimer: "AI-generated · not financial advice",
    emptyState: "Enter a topic above to get started",
    fallbackSource: "Financial News",
    confidence: "Confidence",
    accumLabel: "ACCUMULATION",
    accumStrength: "Signal Strength",
    accumPhase: "Phase",
    accumPhaseVal: "Wyckoff Accumulation",
    ratings: { BUY: "BUY", WATCH: "WATCH", AVOID: "AVOID" },
    newsPrompt: (topics) =>
      `You are a financial news analyst. Based on your knowledge of recent market developments, generate 6 realistic financial news articles related to: ${topics.join(", ")}.

Return ONLY raw JSON, no markdown, no backticks:
{"articles":[{"title":"headline","source":"Bloomberg or Reuters etc","summary":"2-3 sentence financial summary"}]}`,
    advicePrompt: (topics, ctx) =>
      `You are a financial analyst. Given this context about ${topics.join(", ")}:
${ctx}
Generate exactly 3 stock recommendations. Return ONLY raw JSON, no markdown:
{"advice":[{"ticker":"AAPL","company":"Apple Inc.","rating":"BUY","reasoning":"2-3 sentences","confidence":75}]}
Rating: BUY, WATCH, or AVOID. Confidence: 40-95.`,
    accumPrompt: (topics, ctx) =>
      `You are a Wyckoff technical analyst. Given context about ${topics.join(", ")}:
${ctx}
Identify ONE stock showing institutional accumulation (sideways price, smart money absorption, potential breakout). Return ONLY raw JSON, no markdown:
{"accum":{"ticker":"MSFT","company":"Microsoft Corp.","reasoning":"2-3 sentences","signal_strength":78,"key_levels":"Support: $X / Resistance: $Y","watch_for":"one sentence trigger"}}`,
  },
  zh: {
    tagline: "AI 驱动的财经智能分析平台",
    langBtn: "English",
    label: "输入主题 — 多个主题请用逗号分隔",
    placeholder: "例如：半导体、国有银行、央企改革",
    analyseBtn: "分析",
    hint: "AI 驱动财经分析 · 免费预览",
    loadingNews: "正在生成财经资讯……",
    loadingAdvice: "正在生成国有企业股票投资建议……",
    loadingAccum: "正在检测机构资金吸筹信号……",
    error: "出现错误，请稍后重试。",
    newsSection: "最新资讯",
    newsCount: (n) => `共 ${n} 篇`,
    adviceSection: "国企股票投资建议",
    adviceDisclaimer: "AI 生成 · 仅供参考",
    emptyState: "请在上方输入主题开始分析",
    fallbackSource: "财经资讯",
    confidence: "置信度",
    accumLabel: "吸筹建仓",
    accumStrength: "信号强度",
    accumPhase: "阶段",
    accumPhaseVal: "威科夫吸筹阶段",
    ratings: { BUY: "买入", WATCH: "关注", AVOID: "回避" },
    newsPrompt: (topics) =>
      `你是财经新闻分析师。请根据你对近期市场动态的了解，生成6条与以下主题相关的财经新闻：${topics.join("、")}。
仅返回原始JSON，无markdown，无反引号：
{"articles":[{"title":"标题","source":"财联社或Bloomberg等","summary":"2-3句中文摘要"}]}`,
    advicePrompt: (topics, ctx) =>
      `你是财经分析师。关于"${topics.join("、")}"的背景：
${ctx}
请生成3条股票建议。【重要】只能推荐中国A股或港股的国有企业（央企或地方国企），如工商银行、中国石油、中国移动等，严禁推荐民营企业。
仅返回原始JSON，无markdown：
{"advice":[{"ticker":"601398.SS","company":"中国工商银行","rating":"BUY","reasoning":"2-3句中文分析","confidence":75}]}
rating为BUY/WATCH/AVOID之一，confidence为40-95整数。`,
    accumPrompt: (topics, ctx) =>
      `你是威科夫技术分析师。关于"${topics.join("、")}"的背景：
${ctx}
从中国A股或港股国有企业中，找出一只疑似机构吸筹的股票（低位横盘、主力吸筹、潜在突破）。
仅返回原始JSON，无markdown：
{"accum":{"ticker":"601398.SS","company":"中国工商银行","reasoning":"2-3句中文说明","signal_strength":78,"key_levels":"支撑位：XX元 / 压力位：XX元","watch_for":"一句话突破确认信号"}}`,
  },
};

const C = {
  bg: "#FAFAF8", surface: "#FFF", border: "#E8E6E1",
  text: "#1A1A18", muted: "#6B6860", accent: "#C8963E",
  buy: "#2D7A4F", watch: "#C8963E", avoid: "#B03A2E",
  buyBg: "#EAF5EE", watchBg: "#FDF6EC", avoidBg: "#FAEAEA",
  accum: "#2C4A7C", accumBg: "#EEF3FB", accumBorder: "#4A72B8",
};

function parseJSON(text, key) {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const j = JSON.parse(clean);
    return j[key] || j;
  } catch { return null; }
}

async function callAPI(prompt) {
  // Detect if we're in Claude.ai preview (no /api/claude proxy available)
  const isPreview = window.location.hostname === "" || window.location.protocol === "blob:" || window.location.hostname.includes("claude.ai") || window.location.hostname.includes("anthropic");

  if (!isPreview) {
    // On Vercel — use OpenRouter proxy
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (text) return text;
    throw new Error("Proxy error: " + (data?.error?.message || JSON.stringify(data)));
  }

  // Claude.ai preview — direct Anthropic (auth handled automatically)
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data?.content?.find((b) => b.type === "text")?.text;
  if (text) return text;
  throw new Error(data?.error?.message || "No response");
}

function Bar({ pct, color }) {
  return (
    <div style={{ flex: 1, height: 4, backgroundColor: "rgba(0,0,0,0.08)", borderRadius: 2, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: 2 }} />
    </div>
  );
}

function NewsCard({ a, t }) {
  return (
    <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 20 }}>
      <div style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: C.accent, marginBottom: 8 }}>{a.source || t.fallbackSource}</div>
      <div style={{ fontSize: 15, lineHeight: 1.5, fontWeight: 600, color: C.text, marginBottom: 10 }}>{a.title}</div>
      <div style={{ fontSize: 13, lineHeight: 1.65, color: C.muted }}>{a.summary}</div>
    </div>
  );
}

function AdviceCard({ item, t }) {
  const pct = parseInt(item.confidence) || 70;
  const bg = item.rating === "BUY" ? C.buyBg : item.rating === "WATCH" ? C.watchBg : C.avoidBg;
  const color = item.rating === "BUY" ? C.buy : item.rating === "WATCH" ? C.watch : C.avoid;
  return (
    <div style={{ backgroundColor: bg, border: `1.5px solid ${color}`, borderRadius: 6, padding: "22px 18px" }}>
      <div style={{ display: "inline-block", fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: "#fff", backgroundColor: color, borderRadius: 3, padding: "3px 8px", marginBottom: 12 }}>{t.ratings[item.rating]}</div>
      <div style={{ fontSize: 22, fontFamily: "monospace", fontWeight: 700, color: C.text, marginBottom: 4 }}>{item.ticker}</div>
      <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 14 }}>{item.company}</div>
      <div style={{ fontSize: 13, lineHeight: 1.65, color: C.text, marginBottom: 14, borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 14 }}>{item.reasoning}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, fontFamily: "monospace", color: C.muted, textTransform: "uppercase", minWidth: 60 }}>{t.confidence}</span>
        <Bar pct={pct} color={color} />
        <span style={{ fontSize: 11, fontFamily: "monospace", color: C.muted, minWidth: 32, textAlign: "right" }}>{pct}%</span>
      </div>
    </div>
  );
}

function AccumCard({ data, t }) {
  const pct = parseInt(data.signal_strength) || 70;
  return (
    <div style={{ backgroundColor: C.accumBg, border: `1.5px solid ${C.accumBorder}`, borderRadius: 6, padding: "22px 18px" }}>
      <div style={{ display: "inline-block", fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: "#fff", backgroundColor: C.accum, borderRadius: 3, padding: "3px 8px", marginBottom: 12 }}>◈ {t.accumLabel}</div>
      <div style={{ fontSize: 22, fontFamily: "monospace", fontWeight: 700, color: C.accum, marginBottom: 4 }}>{data.ticker}</div>
      <div style={{ fontSize: 11, color: C.accum, opacity: 0.7, fontFamily: "monospace", marginBottom: 14 }}>{data.company}</div>
      <div style={{ fontSize: 13, lineHeight: 1.65, color: C.text, marginBottom: 12, borderTop: "1px solid rgba(44,74,124,0.15)", paddingTop: 14 }}>{data.reasoning}</div>
      <div style={{ fontSize: 11, fontFamily: "monospace", color: C.accum, lineHeight: 1.8, marginBottom: 12, backgroundColor: "rgba(44,74,124,0.06)", borderRadius: 4, padding: "10px 12px" }}>
        <span style={{ color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.accumPhase}: </span>{t.accumPhaseVal}<br />
        {data.key_levels}<br />
        {data.watch_for && <><span style={{ color: C.muted }}>▶ </span>{data.watch_for}</>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, fontFamily: "monospace", color: C.accum, textTransform: "uppercase", minWidth: 60, opacity: 0.8 }}>{t.accumStrength}</span>
        <Bar pct={pct} color={C.accum} />
        <span style={{ fontSize: 11, fontFamily: "monospace", color: C.accum, minWidth: 32, textAlign: "right" }}>{pct}%</span>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("en");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [news, setNews] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [accum, setAccum] = useState(null);
  const [error, setError] = useState(null);
  const t = T[lang];

  async function run() {
    const topics = input.split(/[,、]/).map(s => s.trim()).filter(Boolean);
    if (!topics.length || loading) return;
    setLoading(true); setError(null); setNews(null); setAdvice(null); setAccum(null);
    try {
      setStep(t.loadingNews);
      const newsText = await callAPI(t.newsPrompt(topics));
      setNews(parseJSON(newsText, "articles"));

      setStep(t.loadingAdvice);
      const adviceText = await callAPI(t.advicePrompt(topics, newsText));
      setAdvice(parseJSON(adviceText, "advice"));

      setStep(t.loadingAccum);
      const accumText = await callAPI(t.accumPrompt(topics, newsText));
      setAccum(parseJSON(accumText, "accum"));
    } catch (e) {
      setError(e.message || t.error);
    } finally {
      setLoading(false); setStep("");
    }
  }

  const S = {
    app: { minHeight: "100vh", backgroundColor: C.bg, fontFamily: "Georgia, serif", color: C.text },
    header: { borderBottom: `1px solid ${C.border}`, padding: "24px 40px 18px", display: "flex", alignItems: "center", gap: 14 },
    logo: { fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" },
    dot: { color: C.accent },
    tag: { fontSize: 11, color: C.muted, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", flex: 1 },
    langBtn: { backgroundColor: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 4, padding: "5px 12px", fontSize: 12, fontFamily: "monospace", color: C.muted, cursor: "pointer" },
    main: { maxWidth: 940, margin: "0 auto", padding: "40px 20px" },
    label: { display: "block", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 10 },
    row: { display: "flex", gap: 10, marginBottom: 8 },
    input: { flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 4, padding: "13px 16px", fontSize: 15, fontFamily: "Georgia, serif", backgroundColor: C.surface, color: C.text, outline: "none" },
    btn: { backgroundColor: loading ? C.muted : C.text, color: "#fff", border: "none", borderRadius: 4, padding: "13px 24px", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer" },
    hint: { fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 36 },
    secTitle: { fontSize: 11, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 },
    div: { flex: 1, height: 1, backgroundColor: C.border },
    status: { textAlign: "center", padding: "60px 0", color: C.muted, fontSize: 13, fontFamily: "monospace" },
    dot2: { display: "inline-block", width: 6, height: 6, backgroundColor: C.accent, borderRadius: "50%", marginRight: 8, animation: "pulse 1.2s ease-in-out infinite" },
    err: { backgroundColor: "#FFF0F0", border: `1px solid ${C.avoid}`, borderRadius: 6, padding: "14px 18px", color: C.avoid, fontSize: 12, fontFamily: "monospace", marginBottom: 24 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 40 },
    grid4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 },
  };

  return (
    <div style={S.app}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} button:hover{opacity:0.8}`}</style>
      <header style={S.header}>
        <div style={S.logo}>signal<span style={S.dot}>.</span>brief</div>
        <div style={S.tag}>{t.tagline}</div>
        <button style={S.langBtn} onClick={() => setLang(lang === "en" ? "zh" : "en")}>{t.langBtn}</button>
      </header>
      <main style={S.main}>
        <label style={S.label}>{t.label}</label>
        <div style={S.row}>
          <input style={S.input} placeholder={t.placeholder} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            disabled={loading} />
          <button style={S.btn} onClick={run} disabled={loading || !input.trim()}>{t.analyseBtn}</button>
        </div>
        <div style={S.hint}>{t.hint}</div>

        {error && <div style={S.err}>⚠ {error}</div>}
        {loading && <div style={S.status}><span style={S.dot2} />{step}</div>}

        {news?.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={S.secTitle}>{t.newsSection}<div style={S.div} />{t.newsCount(news.length)}</div>
            <div style={S.grid2}>{news.map((a, i) => <NewsCard key={i} a={a} t={t} />)}</div>
          </div>
        )}

        {(advice?.length > 0 || accum) && (
          <div>
            <div style={S.secTitle}>{t.adviceSection}<div style={S.div} />{t.adviceDisclaimer}</div>
            <div style={S.grid4}>
              {advice?.map((item, i) => <AdviceCard key={i} item={item} t={t} />)}
              {accum && <AccumCard data={accum} t={t} />}
            </div>
          </div>
        )}

        {!loading && !news && !error && <div style={S.status}>{t.emptyState}</div>}
      </main>
    </div>
  );
}
