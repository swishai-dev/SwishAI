# Data Model: Basketball AI Prediction Agent

## Database Schema (Prisma)

```prisma
// Core entities for the Basketball AI system

model Team {
  id          String   @id @default(cuid())
  name        String
  league      String   // NBA, EuroLeague, NCAA
  externalId  String   @unique // ID from external stats API
  logoUrl     String?
  wins        Int      @default(0)
  losses      Int      @default(0)
  matchups    Matchup[] @relation("HomeTeam")
  awayMatchups Matchup[] @relation("AwayTeam")
}

model Matchup {
  id            String   @id @default(cuid())
  marketId      String   @unique // Polymarket ID (for Games, this is the main ML market)
  league        String
  type          String   @default("game") // "game" or "prop"
  homeTeamId    String?
  awayTeamId    String?
  startTime     DateTime
  volume        Float    @default(0)
  commentCount  Int      @default(0)
  question      String?  // For props: the specific question
  
  homeTeam      Team?    @relation("HomeTeam", fields: [homeTeamId], references: [id])
  awayTeam      Team?    @relation("AwayTeam", fields: [awayTeamId], references: [id])
  analyses      Analysis[]
}

model Analysis {
  id                String   @id @default(cuid())
  matchupId         String
  createdAt         DateTime @default(now())
  marketOddsAtTime  Float    // Snapshot of Polymarket odds
  predictedProb     Float    // AI's prediction
  edge              Float    // Difference between prediction and market
  confidence        Int      // 0-100
  analystReport     String   @db.Text
  modelId           String   // e.g., "gpt-4o-v1"
  stateHash         String   // Unique hash of odds + state for cache lookup
  
  matchup           Matchup  @relation(fields: [matchupId], references: [id])

  @@index([stateHash])
  @@index([matchupId])
}
```

## Relationships

- **Team to Matchup**: 1:N. Optional for Props if not tied to teams directly.
- **Matchup to Analysis**: 1:N.
- **State Hash**: Used for the cache replay logic.

## External Data Mapping

- **Polymarket**: `marketId` -> `Matchup.marketId`.
- **Basketball API**: `externalId` -> `Team.externalId`.
