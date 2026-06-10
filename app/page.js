"use client";

import { useState } from "react";

export default function Home() {
  const [product, setProduct] = useState("");
  const [sellingPoints, setSellingPoints] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, sellingPoints, audience }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setResult(data?.error ?? `请求失败 (${res.status})`);
        return;
      }

      setResult(data?.result ?? "生成失败，请重试");
    } catch {
      setResult("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <main className="w-full max-w-lg space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-zinc-900">
          直播话术生成器
        </h1>

        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-zinc-700">产品名称</span>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="例如：保湿面霜"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-zinc-700">核心卖点</span>
            <input
              type="text"
              value={sellingPoints}
              onChange={(e) => setSellingPoints(e.target.value)}
              placeholder="例如：24小时持久保湿，天然成分"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-zinc-700">目标人群</span>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="例如：25-35岁都市女性"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 py-2.5 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "生成中..." : "生成话术"}
        </button>

        {result && (
          <div className="rounded-lg bg-zinc-50 p-4">
            <p className="mb-2 text-sm font-medium text-zinc-700">生成结果</p>
            <p className="whitespace-pre-wrap text-zinc-800">{result}</p>
          </div>
        )}
      </main>
    </div>
  );
}
