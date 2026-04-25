import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const traders = [
    { userId: 'trader_01', name: 'Alex Mercer', pathology: 'Revenge Trading', description: 'Aggressive post-loss behavior.' },
    { userId: 'trader_02', name: 'Jordan Lee', pathology: 'Overtrading', description: 'High frequency, low quality trades.' },
    { userId: 'trader_03', name: 'Sam Rivera', pathology: 'Healthy', description: 'Disciplined and calm.' },
    // ... adding more traders to match the 10 mentioned
  ];

  for (const trader of traders) {
    await prisma.trader.upsert({
      where: { userId: trader.userId },
      update: {},
      create: trader,
    });

    // Create some mock trades for the first trader to demonstrate the metrics
    if (trader.userId === 'trader_01') {
      const now = new Date();
      for (let i = 0; i < 15; i++) {
        await prisma.trade.create({
          data: {
            tradeId: `t_${i}`,
            userId: trader.userId,
            sessionId: 's_01',
            asset: 'BTC/USD',
            assetClass: 'Crypto',
            direction: i % 2 === 0 ? 'LONG' : 'SHORT',
            entryPrice: 60000 + i * 100,
            quantity: 1.0,
            entryAt: new Date(now.getTime() - (15 - i) * 60 * 1000), // 1 min apart
            status: 'CLOSED',
            outcome: i % 3 === 0 ? 'LOSS' : 'WIN',
            planAdherence: i % 4 === 0 ? 1 : 5,
            emotionalState: i % 3 === 0 ? 'anxious' : 'calm',
            entryRationale: 'Technical analysis',
            revengeFlag: i > 0 && (i % 3 === 1), // revenge if following a loss
          }
        });
      }
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
