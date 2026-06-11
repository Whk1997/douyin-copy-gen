const SCENE_PROMPTS = {
  开播预热: `风格要求：轻松热情，吸引观众留下来，不要急着卖货。

请生成以下内容，每条话术独立一行，行首用【标签】标注：
1. 开场白 x 3条：【热情版】【悬念版】【福利版】
2. 互动引导话术 x 2条：【引导点赞】【引导关注】`,

  正式促单: `风格要求：突出产品价值和性价比，制造购买欲望。

请生成以下内容，每条话术独立一行，行首用【标签】标注：
1. 产品介绍话术 1条：【产品介绍】，约100字，突出卖点
2. 促单话术 x 3条：【价格锚定】【品质版】【紧迫版】
3. 处理犹豫话术 x 2条：【处理犹豫-1】【处理犹豫-2】，针对说"再看看"的观众`,

  限时秒杀: `风格要求：强调紧迫感和稀缺性，数量有限时间有限。

请生成以下内容，每条话术独立一行，行首用【标签】标注：
1. 倒计时话术 x 3条：【10分钟】【5分钟】【最后1分钟】
2. 库存紧迫话术 x 2条：【库存告急-1】【库存告急-2】
3. 催单话术 x 3条：【催单-1】【催单-2】【催单-3】`,

  结尾收单: `风格要求：感谢观众，最后一次促单，引导关注下次直播。

请生成以下内容，每条话术独立一行，行首用【标签】标注：
1. 最后促单话术 x 2条：【最后促单-1】【最后促单-2】
2. 感谢话术 x 1条：【感谢观众】
3. 引导关注下播预告话术 x 2条：【下播预告-1】【下播预告-2】`,
};

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
    const { product, sellingPoints, audience, scene = "正式促单" } =
      await request.json();
    const scenePrompt =
      SCENE_PROMPTS[scene] ?? SCENE_PROMPTS["正式促单"];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `你是抖音直播话术专家。
直播场景：${scene}
产品：${product}
核心卖点：${sellingPoints}
目标人群：${audience}

${scenePrompt}

输出格式要求：
- 每条话术单独一行，不要合并
- 行首必须是【标签】，标签后直接跟话术正文，例如：【热情版】姐妹们，今天给大家带来...
- 话术口语化、接地气，适合抖音直播口播
- 不要输出额外说明，只输出话术内容`,
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
