import { Trade, UserMetrics, EmotionalState } from '../types';

export class BehavioralService {
  static calculateMetrics(trades: Trade[]): UserMetrics {
    if (trades.length === 0) {
      return {
        planAdherenceScore: 0,
        revengeTradeCount: 0,
        sessionTiltIndex: 0,
        emotionalWinRates: {} as Record<EmotionalState, number>,
        isOvertrading: false,
      };
    }

    const sortedTrades = [...trades].sort((a, b) => a.entryAt.getTime() - b.entryAt.getTime());

    // 1. Plan Adherence Score (Rolling 10-trade average)
    const last10 = sortedTrades.slice(-10);
    const planAdherenceScore = last10.reduce((acc, t) => acc + (typeof t.planAdherence === 'boolean' ? (t.planAdherence ? 5 : 1) : t.planAdherence), 0) / last10.length;

    // 2. Revenge Trade Count
    const revengeTradeCount = trades.filter(t => t.revengeFlag).length;

    // 3. Session Tilt Index
    // Defined as ratio of trades entered within a session after a loss
    const sessionGroups: Record<string, Trade[]> = {};
    trades.forEach(t => {
      if (!sessionGroups[t.sessionId]) sessionGroups[t.sessionId] = [];
      sessionGroups[t.sessionId].push(t);
    });

    let totalTradesAfterLoss = 0;
    let totalTrades = trades.length;

    Object.values(sessionGroups).forEach(sessionTrades => {
      const sortedSession = sessionTrades.sort((a, b) => a.entryAt.getTime() - b.entryAt.getTime());
      let hadLoss = false;
      sortedSession.forEach((t, index) => {
        if (hadLoss) totalTradesAfterLoss++;
        if (t.outcome === 'LOSS') hadLoss = true;
      });
    });

    const sessionTiltIndex = totalTrades === 0 ? 0 : totalTradesAfterLoss / totalTrades;

    // 4. Emotional Win Rates
    const emotionStats: Record<EmotionalState, { wins: number, total: number }> = {
      calm: { wins: 0, total: 0 },
      anxious: { wins: 0, total: 0 },
      greedy: { wins: 0, total: 0 },
      fearful: { wins: 0, total: 0 },
      angry: { wins: 0, total: 0 },
      hopeful: { wins: 0, total: 0 }
    };

    trades.forEach(t => {
      const state = t.emotionalState;
      if (state && emotionStats[state]) {
        emotionStats[state].total++;
        if (t.outcome === 'WIN') emotionStats[state].wins++;
      }
    });

    const emotionalWinRates = {} as Record<EmotionalState, number>;
    (Object.keys(emotionStats) as EmotionalState[]).forEach(state => {
      const stats = emotionStats[state];
      emotionalWinRates[state] = stats.total === 0 ? 0 : stats.wins / stats.total;
    });

    // 5. Overtrading Detector (>10 trades in 30 mins)
    let isOvertrading = false;
    for (let i = 0; i < sortedTrades.length; i++) {
      const windowStart = sortedTrades[i].entryAt.getTime();
      const windowEnd = windowStart + 30 * 60 * 1000; // 30 mins
      let count = 0;
      for (let j = i; j < sortedTrades.length; j++) {
        if (sortedTrades[j].entryAt.getTime() <= windowEnd) {
          count++;
        } else {
          break;
        }
      }
      if (count > 10) {
        isOvertrading = true;
        break;
      }
    }

    return {
      planAdherenceScore,
      revengeTradeCount,
      sessionTiltIndex,
      emotionalWinRates,
      isOvertrading
    };
  }
}
