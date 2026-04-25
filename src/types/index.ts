export type EmotionalState = 'calm' | 'anxious' | 'greedy' | 'fearful' | 'angry' | 'hopeful';
export type AssetClass = 'Crypto' | 'Equity' | 'Forex';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';
export type TradeOutcome = 'WIN' | 'LOSS' | 'BREAKEVEN';

export interface Trade {
  tradeId: string;
  userId: string;
  sessionId: string;
  asset: string;
  assetClass: AssetClass;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  entryAt: Date;
  exitAt: Date | null;
  status: TradeStatus;
  outcome: TradeOutcome | null;
  pnl: number | null;
  planAdherence: number; // 1-5
  emotionalState: EmotionalState;
  entryRationale: string;
  revengeFlag: boolean;
}

export interface UserMetrics {
  planAdherenceScore: number;
  revengeTradeCount: number;
  sessionTiltIndex: number;
  emotionalWinRates: Record<EmotionalState, number>;
  isOvertrading: boolean;
}

export interface JWTHeader {
  alg: 'HS256';
  typ: 'JWT';
}

export interface JWTPayload {
  sub: string; // userId
  iat: number;
  exp: number;
  role: 'trader';
  name?: string;
}
