# Quickstart: Basketball Prediction Agent

## Prerequisites
- Node.js 20+
- PostgreSQL database
- OpenAI/Anthropic API Key (for analysis)

## Setup Steps

1. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/swish_ai"
   OPENAI_API_KEY="your_key_here"
   NEXT_PUBLIC_POLYMARKET_GAMMA_API="https://gamma-api.polymarket.com"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Migration**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Dashboard**
   Open [http://localhost:3000/explorer](http://localhost:3000/explorer) to view the basketball markets.

## Key Scripts
- `npm run dev`: Starts the Next.js development server.
- `npm test`: Runs unit and integration tests.
- `npx prisma studio`: Visual interface for the database.
