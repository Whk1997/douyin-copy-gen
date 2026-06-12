# ✨ 话术星 · AI直播话术生成器

> AI-powered live streaming script generator for Douyin e-commerce sellers

🔗 **Live Demo**: https://douyin-copy-gen.vercel.app

---

## What it does

Instantly generates professional live streaming scripts for agricultural
and e-commerce sellers on Douyin (Chinese TikTok).

Sellers input their product name, selling points, and target audience —
the AI generates 8-12 ready-to-use scripts tailored to 4 live streaming scenarios.

---

## Features

- 🎯 **4 live scenarios**: Opening hook / Sales pitch / Flash sale / Closing
- 📋 **10+ script variations** per generation with distinct styles
- ⚡ **One-click copy** for each individual script
- 🔒 **Daily usage limit** via localStorage (no backend auth needed)
- 📱 **Mobile responsive** layout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| AI | Anthropic Claude API |
| Deployment | Vercel |

---

## Local Development

```bash
git clone https://github.com/Whk1997/douyin-copy-gen.git
cd douyin-copy-gen
npm install

# Add your API key
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local

npm run dev
```

Open http://localhost:3000

---

## How it works

1. User inputs product name, selling points, and target audience
2. Selects a live streaming scenario
3. Frontend calls `/api/generate` (Next.js API Route)
4. Server sends a scenario-specific prompt to Claude API
5. Results display as individually copyable script cards
