"use client";

import { useEffect, useState } from "react";

const DAILY_LIMIT = 5;

function getDateKey() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function getStorageKey() {
  return `generate-count-${getDateKey()}`;
}

function getRemainingCount() {
  const used = parseInt(localStorage.getItem(getStorageKey()) || "0", 10);
  return Math.max(0, DAILY_LIMIT - used);
}

function incrementUsedCount() {
  const key = getStorageKey();
  const used = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, String(used + 1));
}

function parseSegments(text) {
  const tagged = text.split(/(?=【[^】]+】)/).filter((s) => s.trim());
  if (tagged.length > 1) return tagged.map((s) => s.trim());

  const numbered = text.split(/(?=\d+[\.、]\s*)/).filter((s) => s.trim());
  if (numbered.length > 1) return numbered.map((s) => s.trim());

  const paragraphs = text.split(/\n\n+/).filter((s) => s.trim());
  if (paragraphs.length > 1) return paragraphs.map((s) => s.trim());

  const lines = text.split(/\n/).filter((s) => s.trim());
  if (lines.length > 1) return lines.map((s) => s.trim());

  return [text.trim()];
}

function parseSegmentLabel(segment) {
  const match = segment.match(/^【([^】]+)】(.*)$/s);
  if (match) {
    return { label: match[1], content: match[2].trim() };
  }
  return { label: null, content: segment };
}

function LoadingSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 outline-none transition-colors focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20";

export default function Home() {
  const [product, setProduct] = useState("");
  const [sellingPoints, setSellingPoints] = useState("");
  const [audience, setAudience] = useState("");
  const [scene, setScene] = useState("正式促单");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [remaining, setRemaining] = useState(DAILY_LIMIT);

  useEffect(() => {
    setRemaining(getRemainingCount());
  }, []);

  const limitReached = remaining <= 0;

  async function handleCopy(text, index) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  async function handleGenerate() {
    if (limitReached) return;

    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, sellingPoints, audience, scene }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setResult(data?.error ?? `请求失败 (${res.status})`);
        return;
      }

      setResult(data?.result ?? "生成失败，请重试");
      incrementUsedCount();
      setRemaining(getRemainingCount());
    } catch {
      setResult("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  const segments = result ? parseSegments(result) : [];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#F8F9FA]">
      <header className="border-b border-gray-200 bg-white px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">
          <span className="mr-1.5" aria-hidden="true">
            ✨
          </span>
          话术星
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">AI直播话术生成器</p>
      </header>

      <section className="border-b border-indigo-100/60 bg-gradient-to-b from-indigo-50 to-purple-50 px-4 pt-11 pb-4">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            30秒生成专业直播话术
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            AI 自动生成开播预热、促单、秒杀、收单话术，
            <br className="hidden sm:inline" />
            告别不知道说什么的尴尬
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-700 sm:text-base">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true">✨</span>
              4种直播场景
            </span>
            <span className="hidden text-gray-300 sm:inline" aria-hidden="true">
              |
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true">📋</span>
              一键复制
            </span>
            <span className="hidden text-gray-300 sm:inline" aria-hidden="true">
              |
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true">⚡</span>
              秒级生成
            </span>
          </div>
        </div>
      </section>

      <div
        id="tool"
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-8"
      >
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {/* 左侧：输入表单 */}
          <section className="sticky top-8 self-start rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-5 text-base font-semibold text-gray-700">
              填写产品信息
            </h2>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-gray-700">
                  产品名称
                </span>
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="例如：保湿面霜"
                  className={inputClass}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-gray-700">
                  核心卖点
                </span>
                <input
                  type="text"
                  value={sellingPoints}
                  onChange={(e) => setSellingPoints(e.target.value)}
                  placeholder="例如：24小时持久保湿，天然成分"
                  className={inputClass}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-gray-700">
                  目标人群
                </span>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="例如：25-35岁都市女性"
                  className={inputClass}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-gray-700">
                  直播场景
                </span>
                <select
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                  className={inputClass}
                >
                  <option value="开播预热">开播预热</option>
                  <option value="正式促单">正式促单</option>
                  <option value="限时秒杀">限时秒杀</option>
                  <option value="结尾收单">结尾收单</option>
                </select>
              </label>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              今日剩余 {remaining} 次
            </p>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || limitReached}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-base font-medium transition-colors disabled:cursor-not-allowed ${
                limitReached
                  ? "bg-gray-300 text-gray-500"
                  : "bg-[#6366F1] text-white hover:bg-[#4F46E5] disabled:opacity-60"
              }`}
            >
              {loading && <LoadingSpinner />}
              {limitReached
                ? "今日次数已用完，明日再来"
                : loading
                  ? "生成中..."
                  : "生成话术"}
            </button>
          </section>

          {/* 右侧：生成结果 */}
          <section className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              生成结果
            </h2>

            {segments.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <span className="text-5xl" aria-hidden="true">
                  💬
                </span>
                <p className="mt-4 text-sm text-gray-400">
                  填写左侧信息，点击生成话术
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {segments.map((segment, index) => {
                  const { label, content } = parseSegmentLabel(segment);
                  return (
                    <article
                      key={index}
                      className="rounded-lg border border-gray-100 bg-[#F8F9FA] p-4"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        {label ? (
                          <span className="inline-block rounded-md bg-[#6366F1]/10 px-2.5 py-1 text-sm font-medium text-[#6366F1]">
                            【{label}】
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-500">
                            话术 {index + 1}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(segment, index)}
                          className="shrink-0 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 transition-colors hover:border-[#6366F1]/30 hover:text-[#6366F1]"
                        >
                          {copiedIndex === index ? "已复制 ✓" : "复制"}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                        {content}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
