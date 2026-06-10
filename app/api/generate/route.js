export async function POST(request) {
  const apiKey = process.env.API_KEY ?? process.env.ANTHROPIC_API_KEY;
  const baseUrl = process.env.API_BASE_URL ?? "https://apinebula.com/v1";
  const model = process.env.API_MODEL ?? "gpt-5.4";

  if (!apiKey) {
    return Response.json(
      { error: "未配置 API_KEY，请在 .env.local 中设置" },
      { status: 500 }
    );
  }

  try {
    const { product, sellingPoints, audience } = await request.json();

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: `你是抖音直播话术专家。
产品：${product}，卖点：${sellingPoints}，人群：${audience}
生成：1.开场白(30字) 2.促单话术(50字) 3.结尾钩子(20字)`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message ?? data?.error ?? "生成失败，请重试";
      return Response.json({ error: message }, { status: response.status });
    }

    const result = data.choices?.[0]?.message?.content;
    if (!result) {
      return Response.json({ error: "API 返回格式异常" }, { status: 500 });
    }

    return Response.json({ result });
  } catch (err) {
    console.error("[generate]", err);
    return Response.json(
      { error: err?.message ?? "生成失败，请重试" },
      { status: 500 }
    );
  }
}
