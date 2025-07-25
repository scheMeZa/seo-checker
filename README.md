# SEO Checker

## What does this app do?
SEO Checker is an open-source tool that audits your website for SEO best practices. It crawls your site, analyzes each page, and provides actionable recommendations to help you improve your search engine ranking. You can track your progress over time and see how your changes impact your SEO score.

## Why is this data interesting or valuable?
SEO data is crucial for understanding how your website performs in search engines. By identifying technical issues, content gaps, and optimization opportunities, you can make informed decisions that drive more organic traffic to your site. The insights provided help you prioritize fixes that have the biggest impact on your visibility and growth.

## Who might find this useful?
- Website owners and bloggers who want to improve their site's search ranking
- Digital marketers and SEO professionals seeking actionable audit reports
- Developers and agencies building or maintaining client websites
- Anyone interested in learning about and improving website SEO

## Features
- 🚀 **Real-time progress updates**: Watch your SEO audit and crawl progress live, thanks to instant socket-powered updates.
- 🌐 **Full-site crawling**: Optionally crawl and audit every internal link for a comprehensive SEO overview.
- 🧠 **Actionable, prioritized recommendations**: Get clear, ranked suggestions to boost your site's search performance.
- 📈 **Track improvements and regressions**: See how your SEO score changes over time with each scan.
- 🎨 **Beautiful, modern UI**: Enjoy a clean, responsive interface built with Tailwind CSS and Framer Motion animations.
- ⚡ **Blazing fast, concurrent crawling**: Audits and crawls run in parallel for maximum speed, even on large sites.
- 🔒 **Secure, privacy-first**: Your data is never shared or stored beyond your own server.
- 🖥️ **Cross-platform**: Works on Windows, macOS, and Linux.
- 🛠️ **Open source & extensible**: Easily customize or extend for your own needs.

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- Puppeteer
- Lighthouse
- BullMQ (queue management for concurrent audits)
- Redis (required for BullMQ)
- ioredis
- socket.io
- dotenv
- cors
- nodemon (dev)

### Frontend
- React
- React DOM
- React Router DOM
- Framer Motion
- Recharts
- Tailwind CSS
- Vite
- socket.io-client
- react-transition-group
- TypeScript
- ESLint, PostCSS, Autoprefixer (dev)

## Requirements
- **Node.js**: v18+ (recommended for Puppeteer and Vite compatibility)
- **npm**: v9+ (comes with Node.js)
- **MongoDB**: v6+ (tested with latest, but v4+ should work)
- **Redis**: v6+ (for BullMQ queue)
- **Git**: for cloning the repo
- **(Optional) pnpm/yarn**: if you prefer over npm

## Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/scheMeZa/seo-checker.git
cd seo-checker
```

### 2. Backend Setup
```sh
cp .env.example .env
# Edit .env with your MongoDB and Redis credentials

npm install
npm run dev
# or: npm start (for production)
```

### 3. Frontend Setup
```sh
cd client
cp .env.example .env
npm install
npm run dev
# The frontend will be available at http://localhost:5173 (default Vite port)
```

### 4. Environment Variables
- See `.env.example` for all required variables (MongoDB, Redis, etc).

## License
MIT 