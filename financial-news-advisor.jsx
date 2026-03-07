import { useState, useRef } from "react";

const COLORS = {
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  border: "#E8E6E1",
  text: "#1A1A18",
  muted: "#6B6860",
  accent: "#C8963E",
  buy: "#2D7A4F",
  watch: "#C8963E",
  avoid: "#B03A2E",
  buyBg: "#EAF5EE",
  watchBg: "#FDF6EC",
  avoidBg: "#FAEAEA",
};

const style = {
  app: {
    minHeight: "100vh",
    backgroundColor: COLORS.bg,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: COLORS.text,
    padding: "0",
  },
  header: {
    borderBottom: `1px solid ${COLORS.border}`,
    padding: "28px 48px 20px",
    display: "flex",
    alignItems: "baseline",
    gap: "16px",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    color: COLORS.text,
    fontFamily: "'Georgia', serif",
  },
  logoAccent: { color: COLORS.accent },
  tagline: {
    fontSize: "12px",
    color: COLORS.muted,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  main: { maxWidth: "880px", margin: "0 auto", padding: "48px 24px" },
  inputSection: { marginBottom: "48px" },
  label: {
    display: "block",
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: COLORS.muted,
    marginBottom: "12px",
  },
  inputRow: { display: "flex", gap: "12px", alignItems: "stretch" },
  input: {
    flex: 1,
    border: `1.5px solid ${COLORS.border}`,
    borderRadius: "4px",
    padding: "14px 18px",
    fontSize: "16px",
    fontFamily: "'Georgia', serif",
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    outline: "none",
    transition: "border-color 0.2s",
  },
  btn: {
    backgroundColor: COLORS.text,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "4px",
    padding: "14px 28px",
    fontSize: "13px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "opacity 0.2s",
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  hint: {
    marginTop: "10px",
    fontSize: "12px",
    color: COLORS.muted,
    fontFamily: "'Courier New', monospace",
  },
  sectionTitle: {
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: COLORS.muted,
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  divider: {
    flex: 1,
    height: "1px",
    backgroundColor: COLORS.border,
  },
  newsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "48px",
  },
  newsCard: {
    backgroundColor: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    padding: "20px",
  },
  newsSource: {
    fontSize: "10px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: COLORS.accent,
    marginBottom: "8px",
  },
  newsTitle: {
    fontSize: "15px",
    lineHeight: "1.5",
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: "10px",
  },
  newsSummary: {
    fontSize: "13px",
    lineHeight: "1.65",
    color: COLORS.muted,
  },
  adviceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
  },
  adviceCard: (rating) => ({
    backgroundColor:
      rating === "BUY"
        ? COLORS.buyBg
        : rating === "WATCH"
        ? COLORS.watchBg
        : COLORS.avoidBg,
    border: `1.5px solid ${
      rating === "BUY"
        ? COLORS.buy
        : rating === "WATCH"
        ? COLORS.watch
        : COLORS.avoid
    }`,
    borderRadius: "6px",
    padding: "24px 20px",
  }),
  ratingBadge: (rating) => ({
    display: "inline-block",
    fontSize: "10px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.12em",
    fontWeight: "700",
    color: "#FFFFFF",
    backgroundColor:
      rating === "BUY"
        ? COLORS.buy
        : rating === "WATCH"
        ? COLORS.watch
        : COLORS.avoid,
    borderRadius: "3px",
    padding: "3px 8px",
    marginBottom: "12px",
  }),
  ticker: {
    fontSize: "24px",
    fontFamily: "'Courier New', monospace",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    color: COLORS.text,
    marginBottom: "4px",
  },
  companyName: {
    fontSize: "12px",
    color: COLORS.muted,
    marginBottom: "14px",
    fontFamily: "'Courier New', monospace",
  },
  reasoning: {
    fontSize: "13px",
    lineHeight: "1.65",
    color: COLORS.text,
    marginBottom: "14px",
    borderTop: `1px solid rgba(0,0,0,0.08)`,
    paddingTop: "14px",
  },
  confidenceRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  confidenceLabel: {
    fontSize: "10px",
    fontFamily: "'Courier New', monospace",
    color: COLORS.muted,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    minWidth: "70px",
  },
  confidenceBar: (pct, rating) => ({
    flex: 1,
    height: "4px",
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: "2px",
    overflow: "hidden",
    position: "relative",
  }),
  confidenceFill: (pct, rating) => ({
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: `${pct}%`,
    backgroundColor:
      rating === "BUY"
        ? COLORS.buy
        : rating === "WATCH"
        ? COLORS.watch
        : COLORS.avoid,
    borderRadius: "2px",
  }),
  confidencePct: {
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    color: COLORS.muted,
    minWidth: "32px",
    textAlign: "right",
  },
  status: {
    textAlign: "center",
    padding: "64px 24px",
    color: COLORS.muted,
    fontSize: "14px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.05em",
  },
  statusDot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    backgroundColor: COLORS.accent,
    borderRadius: "50%",
    marginRight: "8px",
    animation: "pulse 1.2s ease-in-out infinite",
  },
  error: {
    backgroundColor: "#FFF0F0",
    border: `1px solid ${COLORS.avoid}`,
    borderRadius: "6px",
    padding: "16px 20px",
    color: COLORS.avoid,
    fontSize: "13px",
    fontFamily: "'Courier New', monospace",
  },
};

function parseAdvice(text) {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed.advice || parsed;
  } catch {
    return null;
  }
}

function parseNews(text) {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed.articles || parsed;
  } catch {
    return null;
  }
}

function NewsCard({ article }) {
  return (
    <div style={style.newsCard}>
      <div style={style.newsSource}>{article.source || "财经资讯"}</div>
      <div style={style.newsTitle}>{article.title}</div>
      <div style={style.newsSummary}>{article.summary}</div>
    </div>
  );
}

function AdviceCard({ item }) {
  const pct = parseInt(item.confidence) || 70;
  return (
    <div style={style.adviceCard(item.rating)}>
      <div style={style.ratingBadge(item.rating)}>
        {item.rating === "BUY" ? "买入" : item.rating === "WATCH" ? "关注" : "回避"}
      </div>
      <div style={style.ticker}>{item.ticker}</div>
      <div style={style.companyName}>{item.company}</div>
      <div style={style.reasoning}>{item.reasoning}</div>
      <div style={style.confidenceRow}>
        <span style={style.confidenceLabel}>置信度</span>
        <div style={style.confidenceBar(pct, item.rating)}>
          <div style={style.confidenceFill(pct, item.rating)} />
        </div>
        <span style={style.confidencePct}>{pct}%</span>
      </div>
    </div>
  );
}

export default function App() {
  const [topicsInput, setTopicsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [news, setNews] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  async function fetchData() {
    const topics = topicsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!topics.length) return;

    setLoading(true);
    setError(null);
    setNews(null);
    setAdvice(null);

    try {
      // Step 1: Fetch news with web search
      setLoadingStep("正在搜索过去24小时的财经新闻……");
      const newsPrompt = `请在网上搜索过去24小时内与以下主题相关的最新财经新闻：${topics.join("、")}。

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

共返回6-8篇文章。仅关注股票市场、财报、经济数据和投资相关新闻。所有内容必须用中文输出。`;

      const newsRes = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: newsPrompt }],
        }),
      });

      const newsData = await newsRes.json();
      const newsText = newsData.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("");

      const parsedNews = parseNews(newsText);
      if (parsedNews) setNews(parsedNews);

      // Step 2: Generate stock advice
      setLoadingStep("正在生成股票投资建议……");
      const advicePrompt = `根据以下关于"${topics.join("、")}"的财经新闻：

${newsText}

Generate exactly 3 stock recommendations. Return ONLY a raw JSON object (no markdown, no backticks) in this format:
{
  "advice": [
    {
      "ticker": "AAPL",
      "company": "苹果公司",
      "rating": "BUY",
      "reasoning": "结合上述新闻的2-3句中文分析说明",
      "confidence": 75
    }
  ]
}

rating必须是以下之一：BUY（买入）、WATCH（关注）或AVOID（回避）。confidence为40-95之间的整数。所有reasoning和company字段必须用中文输出。建议必须与所搜索到的新闻直接相关。`;

      const adviceRes = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: advicePrompt }],
        }),
      });

      const adviceData = await adviceRes.json();
      const adviceText = adviceData.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("");

      const parsedAdvice = parseAdvice(adviceText);
      if (parsedAdvice) setAdvice(parsedAdvice);
    } catch (err) {
      setError("出现错误，请稍后重试。");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !loading) fetchData();
  };

  return (
    <div style={style.app}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        input:focus { border-color: #C8963E !important; }
        button:hover:not(:disabled) { opacity: 0.82; }
      `}</style>

      <header style={style.header}>
        <div style={style.logo}>
          signal<span style={style.logoAccent}>.</span>brief
        </div>
        <div style={style.tagline}>AI 驱动的财经智能分析平台</div>
      </header>

      <main style={style.main}>
        <div style={style.inputSection}>
          <label style={style.label}>输入主题 — 多个主题请用逗号分隔</label>
          <div style={style.inputRow}>
            <input
              ref={inputRef}
              style={style.input}
              placeholder="例如：半导体、美联储、特斯拉财报"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              style={{ ...style.btn, ...(loading ? style.btnDisabled : {}) }}
              onClick={fetchData}
              disabled={loading || !topicsInput.trim()}
            >
              分析
            </button>
          </div>
          <div style={style.hint}>
            实时搜索财经新闻 · 由 Claude 提供支持
          </div>
        </div>

        {error && <div style={style.error}>⚠ {error}</div>}

        {loading && (
          <div style={style.status}>
            <span style={style.statusDot} />
            {loadingStep}
          </div>
        )}

        {news && news.length > 0 && (
          <div style={{ marginBottom: "48px" }}>
            <div style={style.sectionTitle}>
              最新资讯
              <div style={style.divider} />
              共 {news.length} 篇 · 过去24小时
            </div>
            <div style={style.newsGrid}>
              {news.map((article, i) => (
                <NewsCard key={i} article={article} />
              ))}
            </div>
          </div>
        )}

        {advice && advice.length > 0 && (
          <div>
            <div style={style.sectionTitle}>
              股票投资建议
              <div style={style.divider} />
              AI 生成 · 仅供参考，非正式投资建议
            </div>
            <div style={style.adviceGrid}>
              {advice.map((item, i) => (
                <AdviceCard key={i} item={item} />
              ))}
            </div>
          </div>
        )}

        {!loading && !news && !error && (
          <div style={style.status}>
            请在上方输入主题开始分析
          </div>
        )}
      </main>
    </div>
  );
}
