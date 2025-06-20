import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";

import {
  getCurrentTicker,
  getCandlesForMinutes,
  getCandlesForDaily,
  getCandlesForWeekly,
  getBlockChainMarkets
} from './mcp/tools/market.js'
import { analyzeBlockChainMarket, AnalysisResult } from './mcp/tools/analyze.js';

const handler = createMcpHandler((server) => {
  server.tool("get_now", {}, async () => ({
    content: [{ type: "text", text: `Now: ${new Date().toISOString()}` }],
  }));

  server.tool("analyze_blockchain_market", {}, async () => {
    const result: AnalysisResult = await analyzeBlockChainMarket();
    return {
      content: [
        { type: "text", text: JSON.stringify(result)}
      ]
    };
  });

  server.tool("get_current_ticker", { marketCode: z.string().default('KRW-BTC') }, async ({ marketCode }) => {
    const ticker = await getCurrentTicker(marketCode);
    return { content: [{ type: "text", text: JSON.stringify(ticker) }] }
  });

  server.tool("get_candles_for_minutes", { minutes: z.number().default(30), count: z.number().default(10), marketCode: z.string().default('KRW-BTC') }, async ({ minutes, count, marketCode }) => {
    const candles = await getCandlesForMinutes(minutes, count);
    return { content: [{ type: "text", text: JSON.stringify(candles) }] }
  });

  server.tool("get_candles_for_daily", { count: z.number().default(10), marketCode: z.string().default('KRW-BTC') }, async ({ count, marketCode }) => {
    const candles = await getCandlesForDaily(count, marketCode);
    return { content: [{ type: "text", text: JSON.stringify(candles) }] }
  });

  server.tool("get_candles_for_weekly", { count: z.number().default(10), marketCode: z.string().default('KRW-BTC') }, async ({ count, marketCode }) => {
    const candles = await getCandlesForWeekly(count, marketCode);
    return { content: [{ type: "text", text: JSON.stringify(candles) }] }
  });

  server.tool("get_blockchain_markets", {}, async () => {
    const markets = await getBlockChainMarkets();
    return { content: [{ type: "text", text: JSON.stringify(markets) }] }
  });
});

export { handler as GET, handler as POST, handler as DELETE };
