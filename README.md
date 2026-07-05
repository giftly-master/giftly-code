<div align="center">

# 🎁 Giftly

### *The art of giving, reimagined.*

**Send time-locked cash gifts that stay hidden until the perfect moment — powered by the Stellar blockchain.**

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-7D00FF?style=for-the-badge&logo=stellar)](https://stellar.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/codeze-us/giftly/pulls)

<br />

> **"Don't just send money. Send a moment."**

[🚀 Get Started](#-quick-start) · [✨ Features](#-features) · [🏗 Architecture](#-architecture) · [🤝 Contributing](#-contributing) · [📄 License](#-license)

</div>

---

## ✨ Why Giftly?

Money is practical. Moments are priceless. Giftly bridges the two.

Whether it's a birthday surprise locked until midnight, a graduation gift that lands the exact second they walk off stage, or savings that quietly earn yield while you wait — Giftly turns digital money into a genuine experience.

No more "I'll send it later." No more forgetting. Just locked, secure, on-chain gifts that arrive exactly when they should.

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🔒 **Time-Locked Gifts** | Funds locked in Soroban smart contracts, released only after your chosen date & time |
| 💵 **Stablecoin Payments** | USDC on Stellar keeps gift value stable from send to reveal — no volatility risk |
| 📈 **Yield on Savings** | Idle savings earn passive yield via Stellar AMM pools or Blend Protocol lending |
| 🏦 **Bank Integration** | Seamless NGN on/off-ramps via Paystack for Nigerian bank payouts |
| 🎉 **Surprise Experience** | Recipients see a locked gift — the reveal only happens at the exact unlock moment |
| 🌍 **Low-Cost Global Transfers** | Stellar's 3–5 second finality and near-zero fees make gifting practical at any amount |
| 📊 **Expense Tracking** | Daily expense calculation with categorization and spending summaries |
| 🔐 **Secure Auth** | JWT access + refresh tokens, OTP verification, rate limiting, and fingerprint binding |

---

## 🛠 Tech Stack

### Frontend — `web/`
- **[Next.js 16](https://nextjs.org/)** — App Router, React 19
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** — Smooth animations
- **TypeScript 5** — End-to-end type safety

### Backend — `backend/`
- **[Express.js](https://expressjs.com/)** — Lightweight Node.js API server
- **[PostgreSQL](https://www.postgresql.org/)** + **[Drizzle ORM](https://orm.drizzle.team/)** — Type-safe database layer
- **[Nodemailer](https://nodemailer.com/)** — Transactional email (OTP, verification)
- **[Stripe](https://stripe.com/)** + **[Paystack](https://paystack.com/)** — Payments & NGN payouts
- **Background cron jobs** — Gift release scheduling

### Blockchain
- **[Stellar Soroban](https://soroban.stellar.org/)** — Rust smart contracts for time-lock logic
- **USDC on Stellar** — Stable, circle-issued stablecoin
- **Blend Protocol** — DeFi lending for savings yield

---

## 🏗 Architecture

```
giftly/
├── web/                        # Next.js Frontend (port 3000)
│   └── src/
│       ├── app/                # Pages & layouts (App Router)
│       ├── components/         # Reusable UI components
│       ├── context/            # Auth, Theme & global state
│       ├── hooks/              # Custom React hooks
│       ├── services/           # API client configuration
│       └── lib/                # Tokens, cookies, utilities
│
├── backend/                    # Express API Server (port 5000)
│   └── src/
│       ├── api/                # Route handlers (auth, gifts, users...)
│       ├── server/             # Services, cron jobs, audit logging
│       ├── lib/                # DB setup, validation, token signing
│       ├── adapter.ts          # Express ↔ Next.js request adapter
│       ├── routes.ts           # Express route mapping
│       └── server.ts           # Server entry point
│
├── drizzle/                    # Drizzle Kit schema snapshots
└── migrations/                 # Raw SQL migration files
```

> The frontend proxies all `/api/*` requests to the backend via Next.js rewrites — one origin, two services.

---

## 🚀 Quick Start

This is an **NPM Workspaces monorepo**. Both `web` and `backend` are managed from the root.

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** 9+

### 1. Clone the repo

```bash
git clone https://github.com/codeze-us/giftly.git
cd giftly
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

```env
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/giftly
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up the database

```bash
# Create the database first
psql -U postgres -c "CREATE DATABASE giftly;"

# Push the schema
npm run db:push
```

### 5. Run in development

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |

---

## 🎯 Use Cases

**🎂 Surprise Birthdays** — Send a gift weeks early that unlocks at exactly midnight on their birthday.

**🎓 Graduation Gifts** — Lock funds until graduation day. It arrives the moment they need it most.

**🌍 Cross-Border Gifting** — Send USDC from anywhere to Nigerian recipients with local bank payout.

**🏆 Office Rewards** — Bulk-send gifts to your team with a shared reveal date for maximum impact.

**💰 Goal Savings** — Set a target, earn yield passively, withdraw when you're ready.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 🔒 Security

If you discover a security vulnerability, please **do not** open a public issue. Email us directly at **security@giftly.com**. We take security seriously and will respond promptly.

---

## 📄 License

```
MIT License

Copyright (c) 2026 Giftly

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Maintainers

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/Emrys02.png" width="100" style="border-radius:50%" /><br />
      <strong>Emrys02</strong><br />
      <a href="https://github.com/Emrys02">@Emrys02</a>
    </td>
    <td align="center">
      <img src="https://github.com/codeze-us.png" width="100" style="border-radius:50%" /><br />
      <strong>codeZe-us</strong><br />
      <a href="https://github.com/codeze-us">@codeze-us</a>
    </td>
  </tr>
</table>

---

<div align="center">

**[⬆ Back to top](#-giftly)**

Made with ❤️ on the Stellar blockchain

*© 2026 Giftly. All rights reserved.*

</div>
