import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";

import { getCurrentTicker, getCandlesForMinutes, getCandlesForDaily, getCandlesForWeekly } from './mcp/tools/market.js'
import { analyzeBtcMarket, AnalysisResult } from './mcp/tools/analyze.js';

const handler = createMcpHandler((server) => {
  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }],
  }));

  server.tool("analyze_btc_market", {}, async () => {
    const result: AnalysisResult = await analyzeBtcMarket();
    return {
      content: [
        { type: "text", text: JSON.stringify(result)}
      ]
    };
  });

  server.tool("get_current_ticker", {}, async () => {
    const ticker = await getCurrentTicker();
    return { content: [{ type: "text", text: JSON.stringify(ticker) }] }
  });

  server.tool("get_candles_for_minutes", { minutes: z.number().default(30), count: z.number().default(10) }, async ({ minutes, count }) => {
    const candles = await getCandlesForMinutes(minutes, count);
    return { content: [{ type: "text", text: JSON.stringify(candles) }] }
  });

  server.tool("get_candles_for_daily", { count: z.number().default(10) }, async ({ count }) => {
    const candles = await getCandlesForDaily(count);
    return { content: [{ type: "text", text: JSON.stringify(candles) }] }
  });

  server.tool("get_candles_for_weekly", { count: z.number().default(10) }, async ({ count }) => {
    const candles = await getCandlesForWeekly(count);
    return { content: [{ type: "text", text: JSON.stringify(candles) }] }
  });
});

export { handler as GET, handler as POST, handler as DELETE };
