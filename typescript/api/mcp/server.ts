import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getCurrentTicker, getCandlesForMinutes, getCandlesForDaily, getCandlesForWeekly } from './tools/market';

const createServer = () => {
  const server = new Server(
    {
      name: 'bit-scope',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 도구 목록 제공
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_current_ticker',
          description: 'Get current Bitcoin ticker information from Upbit API',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_candles_for_minutes',
          description: 'Get minute candlestick data for Bitcoin from Upbit API',
          inputSchema: {
            type: 'object',
            properties: {
              minutes: {
                type: 'number',
                description: '캔들 단위(분) (1, 3, 5, 10, 15, 30, 60, 240)',
                default: 30
              },
              count: {
                type: 'number',
                description: '가져올 캔들 개수 (최대 200)',
                default: 10,
                maximum: 200
              }
            },
          },
        },
        {
          name: 'get_candles_for_daily',
          description: 'Get daily candlestick data for Bitcoin from Upbit API',
          inputSchema: {
            type: 'object',
            properties: {
              count: {
                type: 'number',
                description: '가져올 캔들 개수 (최대 200)',
                default: 10,
                maximum: 200
              }
            },
          },
        },
        {
          name: 'get_candles_for_weekly',
          description: 'Get weekly candlestick data for Bitcoin from Upbit API',
          inputSchema: {
            type: 'object',
            properties: {
              count: {
                type: 'number',
                description: '가져올 캔들 개수 (최대 200)',
                default: 10,
                maximum: 200
              }
            },
          },
        },
      ],
    };
  });

  // 도구 실행 핸들러
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    switch (name) {
      case 'get_current_ticker':
        try {
          const ticker = await getCurrentTicker();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(ticker, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to fetch current ticker: ${error}`);
        }
        
      case 'get_candles_for_minutes':
        try {
          const { minutes = 30, count = 10 } = (args as any) || {};
          const candles = await getCandlesForMinutes(minutes, count);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(candles, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to fetch minute candles: ${error}`);
        }
        
      case 'get_candles_for_daily':
        try {
          const { count = 10 } = (args as any) || {};
          const candles = await getCandlesForDaily(count);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(candles, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to fetch daily candles: ${error}`);
        }
        
      case 'get_candles_for_weekly':
        try {
          const { count = 10 } = (args as any) || {};
          const candles = await getCandlesForWeekly(count);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(candles, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to fetch weekly candles: ${error}`);
        }
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
  return server;
};

export default createServer;