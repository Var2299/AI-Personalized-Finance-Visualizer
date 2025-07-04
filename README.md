# 💸 Personal Finance Visualizer

A sleek and responsive full-stack web application to **track, visualize, and budget personal finances** — enhanced with **AI-powered insights** using Groq API.

> ⚡ Built with Next.js · React · MongoDB · Recharts · shadcn/ui  
> ✨ Features dynamic charts, budgeting tools, and personalized money-saving advice.

---

## 🚀 Features

- Add, edit, and delete financial transactions
- Dashboard with:
  - 💰 Total spending summary
  - 📂 Category-wise breakdown
  - 🧾 Recent transactions
- Monthly expenses visualized using bar and pie charts
- Set and manage budgets per category
- Budget vs actual expense comparison
- Smart **spending insights**
- 🔮 AI-generated monthly financial summary and money-saving tips

---

## 🛠 Tech Stack

- **Frontend:** Next.js, React, Recharts, shadcn/ui
- **Backend:** Next.js API routes, MongoDB (via Atlas)
- **Styling:** Global CSS (no Tailwind)
- **AI:** Groq API (LLaMA 3)
- **Deployment:** Vercel (Frontend + API)

---

## 📸 Demo

![Dashboard Screenshot](./screenshot.png)

🔗 **Live Demo:** [your-vercel-url.com](https://your-vercel-url.com)

---

## 🧪 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/personal-finance-visualizer

# 2. Install dependencies
npm install

# 3. Create `.env.local` and add your MongoDB URI + Groq API Key
MONGODB_URI=your_mongo_connection_string
GROQ_API_KEY=your_groq_api_key

# 4. Run locally
npm run dev
