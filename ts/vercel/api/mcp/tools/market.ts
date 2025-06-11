import { Ticker, createTickerFromDict } from '../types/ticker.js';
import { 
  MinuteCandleStick, 
  DailyCandleStick, 
  WeeklyCandleStick,
  createMinuteCandleFromDict,
  createDailyCandleFromDict,
  createWeeklyCandleFromDict
} from '../types/candle.js';

/**
 * Get the current ticker of Bitcoin in KRW from Upbit API.
 */
export async function getCurrentTicker(): Promise<Ticker> {
  try {
    const response = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as any[];
    
    if (data && data.length > 0) {
      return createTickerFromDict(data[0]);
    }
    
    throw new Error('Bitcoin 티커 정보를 가져올 수 없습니다');
  } catch (error) {
    throw new Error(`Failed to fetch ticker: ${error}`);
  }
}

/**
 * Get a list of minute candlesticks for Bitcoin in KRW from Upbit API.
 * This function fetches the candlestick data for the specified minute interval and count.
 * 
 * @param minutes 캔들 단위(분) (1, 3, 5, 15, 10, 30, 60, 240)
 * @param count 가져올 캔들 개수 (최대 200)
 * @returns 캔들스틱 데이터 리스트
 */
export async function getCandlesForMinutes(
  minutes: number = 30, 
  count: number = 10
): Promise<MinuteCandleStick[]> {
  try {
    const url = `https://api.upbit.com/v1/candles/minutes/${minutes}`;
    const params = new URLSearchParams({
      market: 'KRW-BTC',
      count: Math.min(count, 200).toString() // 최대 200개까지 가능
    });
    
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as any[];
    
    return data.map(item => createMinuteCandleFromDict(item));
  } catch (error) {
    throw new Error(`Failed to fetch minute candles: ${error}`);
  }
}

/**
 * Get a list of daily candlesticks for Bitcoin in KRW from Upbit API.
 * Get daily candlestick data until today.
 * 
 * @param count 가져올 캔들 개수 (최대 200)
 * @returns 캔들스틱 데이터 리스트
 */
export async function getCandlesForDaily(count: number = 10): Promise<DailyCandleStick[]> {
  try {
    const url = 'https://api.upbit.com/v1/candles/days';
    const params = new URLSearchParams({
      market: 'KRW-BTC',
      count: Math.min(count, 200).toString() // 최대 200개까지 가능
    });
    
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as any[];
    
    return data.map(item => createDailyCandleFromDict(item));
  } catch (error) {
    throw new Error(`Failed to fetch daily candles: ${error}`);
  }
}

/**
 * Get a list of weekly candlesticks for Bitcoin in KRW from Upbit API.
 * Get weekly candlestick data until today.
 * 
 * @param count 가져올 캔들 개수 (최대 200)
 * @returns 캔들스틱 데이터 리스트
 */
export async function getCandlesForWeekly(count: number = 10): Promise<WeeklyCandleStick[]> {
  try {
    const url = 'https://api.upbit.com/v1/candles/weeks';
    const params = new URLSearchParams({
      market: 'KRW-BTC',
      count: Math.min(count, 200).toString() // 최대 200개까지 가능
    });
    
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as any[];
    
    return data.map(item => createWeeklyCandleFromDict(item));
  } catch (error) {
    throw new Error(`Failed to fetch weekly candles: ${error}`);
  }
}