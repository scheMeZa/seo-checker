# SEO Checker

A simple, open-source SEO checker for your website. Enter your site's URL and get actionable recommendations to improve your search engine ranking. Track your progress over time and see how your changes impact your SEO score.

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
npm install
npm run dev
# The frontend will be available at http://localhost:5173 (default Vite port)
```

### 4. Environment Variables
- See `.env.example` for all required variables (MongoDB, Redis, etc).

## License
MIT 