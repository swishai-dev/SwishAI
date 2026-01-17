import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface AnalysisInput {
  matchup: string;
  marketOdds: number;
  stats: any;
}

export interface AnalysisOutput {
  predictedProbability: number;
  confidence: number;
  edge: number;
  report: string;
  dimensions: {
    form: string;
    injuries: string;
    schedule: string;
  };
}

export const generateAnalysis = async (input: AnalysisInput): Promise<AnalysisOutput> => {
  const prompt = `
    You are a professional basketball analyst specializing in prediction markets.
    Analyze the following matchup: ${input.matchup}
    Current Market Odds: ${input.marketOdds}
    
    Technical Context:
    ${JSON.stringify(input.stats, null, 2)}
    
    Provide your analysis including:
    1. Predicted true probability of the home team winning (0-1).
    2. Confidence score (0-100).
    3. Detailed natural language explanation.
    4. Categorical assessment of Form, Injuries, and Schedule.
    
    Return the response in strict JSON format.
  `;

  // Simulate AI call for now to avoid actual API costs/keys issues during dev
  // In production, this would use OpenAI or Anthropic SDK
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate thinking

  const predictedProb = 0.58;
  const edge = predictedProb - input.marketOdds;

  return {
    predictedProbability: predictedProb,
    confidence: 85,
    edge: parseFloat(edge.toFixed(4)),
    report: `The Lakers show strong momentum with 4 wins in their last 5 games. Despite AD being listed as probable, their offensive rating of 115.5 against the Celtics' defense suggests a slight edge. The market is currently undervalued on the Lakers' home court advantage.`,
    dimensions: {
      form: "High",
      injuries: "Minor",
      schedule: "Neutral"
    }
  };
};
