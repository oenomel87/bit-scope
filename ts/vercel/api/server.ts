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
  server.tool("get_now", "현재 날짜를 ISO 형식으로 전달합니다.", {}, async () => ({
    content: [{ type: "text", text: `Now: ${new Date().toISOString()}` }],
  }));

  server.tool("analyze_blockchain_market", "전달 받은 블록체인의 마켓 코드에 대해 다양한 기술적 지표와 시장 분석을 수행하여 종합적인 투자 정보를 제공합니다.", { marketCode: z.string().default('KRW-BTC') }, async ({ marketCode }) => {
    const result: AnalysisResult = await analyzeBlockChainMarket(marketCode);
    return {
      content: [
        { type: "text", text: JSON.stringify(result)}
      ]
    };
  });

  server.tool("get_current_ticker", "전달 받은 블록체인의 현재 시세를 조회힙니다.", { marketCode: z.string().default('KRW-BTC') }, async ({ marketCode }) => {
    const ticker = await getCurrentTicker(marketCode);
    return { content: [{ type: "text", text: JSON.stringify(ticker) }] }
  });

  server.tool("get_candles_for_minutes", "This function fetches the candlestick data for the specified minute interval and count.", { minutes: z.number().default(30), count: z.number().default(10), marketCode: z.string().default('KRW-BTC') }, async ({ minutes, count, marketCode }) => {
    const candles = await getCandlesForMinutes(minutes, count);
    return { content: [{ type: "text", text: JSON.stringify(candles) }] }
  });

  server.tool("get_candles_for_daily", "Get daily candlestick data until today.", { count: z.number().default(10), marketCode: z.string().default('KRW-BTC') }, async ({ count, marketCode }) => {
    const candles = await getCandlesForDaily(count, marketCode);
    return { content: [{ type: "text", text: JSON.stringify(candles) }] }
  });

  server.tool("get_candles_for_weekly", "Get weekly candlestick data until today.", { count: z.number().default(10), marketCode: z.string().default('KRW-BTC') }, async ({ count, marketCode }) => {
    const candles = await getCandlesForWeekly(count, marketCode);
    return { content: [{ type: "text", text: JSON.stringify(candles) }] }
  });

  server.tool("get_blockchain_markets", "Get a list of blockchain markets like KRW-BTC or KRW-ETH", {}, async () => {
    const markets = await getBlockChainMarkets();
    return { content: [{ type: "text", text: JSON.stringify(markets) }] }
  });
});

export { handler as GET, handler as POST, handler as DELETE };
