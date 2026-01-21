# SwishAI

AI-powered analysis platform for Polymarket basketball prediction markets.

## Overview

SwishAI is a specialized analytics platform that combines AI-driven insights with real-time market data from Polymarket. The system analyzes basketball prediction markets (NBA) to provide professional-grade probability assessments, edge detection, and market intelligence.

## Features

- **AI Analysis**: Deep learning models analyze NBA data and market conditions in real-time
- **Edge Detection**: Identify value by comparing market odds against AI-calculated probabilities
- **Market Intelligence**: Professional-grade reports with confidence scores and recommendations
- **Market Explorer**: Browse and filter basketball prediction markets (Games & Props)
- **Real-time Data**: Integration with Polymarket Gamma API for live market data

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Caching**: Redis
- **AI**: OpenAI / Google Gemini
- **Animations**: GSAP, Framer Motion, Three.js
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (latest)
- PostgreSQL database
- Redis instance
- API keys for OpenAI/Gemini and Polymarket

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Project Structure

```
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utilities and services
│   ├── ai/          # AI analysis logic
│   ├── data/        # Data fetching (Polymarket, Sports API)
│   └── services/    # Business logic services
├── prisma/          # Database schema
└── types/           # TypeScript type definitions
```

## License

Private - All rights reserved
