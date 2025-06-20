import { Ticker } from '../types/ticker.js';
import { MinuteCandleStick, DailyCandleStick, WeeklyCandleStick } from '../types/candle.js';
import { getCurrentTicker, getCandlesForMinutes, getCandlesForDaily, getCandlesForWeekly } from './market.js';

// 분석 설정 인터페이스
export interface AnalysisConfig {
  // 데이터 수집 설정
  dailyCount: number;
  minuteCount: number;
  minuteInterval: number;
  weeklyCount: number;
  
  // 이동평균 설정
  maShort: number;
  maMedium: number;
  maLong: number;
  
  // 모멘텀 지표 설정
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  
  stochKPeriod: number;
  stochDPeriod: number;
  stochOverbought: number;
  stochOversold: number;
  
  // 변동성 지표 설정
  bbPeriod: number;
  bbStd: number;
  atrPeriod: number;
  
  // 거래량 지표 설정
  volumeEmaPeriod: number;
  volumeTrendPeriod: number;
}

// 기본 설정
export const DEFAULT_CONFIG: AnalysisConfig = {
  dailyCount: 200,
  minuteCount: 48,
  minuteInterval: 30,
  weeklyCount: 8,
  
  maShort: 20,
  maMedium: 50,
  maLong: 200,
  
  rsiPeriod: 14,
  rsiOverbought: 70.0,
  rsiOversold: 30.0,
  
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  
  stochKPeriod: 14,
  stochDPeriod: 3,
  stochOverbought: 80.0,
  stochOversold: 20.0,
  
  bbPeriod: 20,
  bbStd: 2.0,
  atrPeriod: 14,
  
  volumeEmaPeriod: 20,
  volumeTrendPeriod: 5
};

// 시장 데이터 컨테이너
export interface MarketData {
  marketCode: string;
  dailyData: DailyCandleStick[];
  minuteData: MinuteCandleStick[];
  weeklyData: WeeklyCandleStick[];
  ticker: Ticker;
}

// 추세 분석 결과
export interface TrendAnalysis {
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
}

// 시장 정보 인터페이스
export interface MarketInfo {
  symbol: string;
  currentPrice: number;
  dayChangePct: number;
  timestamp: string;
  volume24h: number;
  volumeChange24hPct: number;
  volatility30dAnnualized: number;
}

// 추세 분석 인터페이스
export interface TrendAnalysisResult {
  shortTerm: string;
  mediumTerm: string;
  longTerm: string;
  trendStrength: number;
  trendDurationDays: number;
}

// 가격 레벨 인터페이스
export interface PriceLevels {
  keyResistance: number[];
  keySupport: number[];
  lastTested: string;
  distanceToResistancePct: number;
  distanceToSupportPct: number;
}

// 이동평균 교차 인터페이스
export interface MACrossover {
  type: 'golden_cross' | 'death_cross';
  fastMa: string;
  slowMa: string;
  daysAgo: number;
}

// 이동평균 결과 인터페이스
export interface MovingAveragesResult {
  maCrossovers: MACrossover[];
  [key: string]: any;
}

// 기술적 신호 인터페이스
export interface TechnicalSignals {
  movingAverages: MovingAveragesResult;
  momentum: {
    rsi14d: {
      value: number | null;
      zone: 'overbought' | 'oversold' | 'neutral';
      trend: 'rising' | 'falling' | 'neutral';
    };
    macd: {
      line: number;
      signal: number;
      histogram: number;
      trend: 'converging' | 'diverging' | 'crossover' | 'neutral';
    };
    stochastic: {
      k: number | null;
      d: number | null;
      trend: 'bullish' | 'bearish' | 'bullish_crossover' | 'bearish_crossover' | 'neutral';
      zone: 'overbought' | 'oversold' | 'neutral';
    };
  };
  volatility: {
    bollingerBands: {
      widthPercentile: number;
      position: number;
      signal: 'overbought' | 'oversold' | 'neutral';
    };
    atr14d: number | null;
    atrPercentile: number;
  };
  volume: {
    obvTrend: 'rising' | 'falling' | 'neutral';
    volumeEmaRatio: number;
    volumePriceTrend: 'confirming' | 'diverging' | 'neutral';
  };
}

// 최종 분석 결과 인터페이스
export interface AnalysisResult {
  marketInfo: MarketInfo;
  trendAnalysis: TrendAnalysisResult;
  priceLevels: PriceLevels;
  technicalSignals: TechnicalSignals;
}

// 유틸리티 함수들
export class TechnicalIndicators {
  // 이동평균 계산
  static simpleMovingAverage(prices: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }

  // 지수이동평균 계산
  static exponentialMovingAverage(prices: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    for (let i = 0; i < prices.length; i++) {
      if (i === 0) {
        result.push(prices[i]);
      } else {
        const ema = (prices[i] * multiplier) + (result[i - 1] * (1 - multiplier));
        result.push(ema);
      }
    }
    return result;
  }

  // RSI 계산
  static rsi(prices: number[], period: number): number[] {
    const result: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    for (let i = 0; i < gains.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
        
        if (avgLoss === 0) {
          result.push(100);
        } else {
          const rs = avgGain / avgLoss;
          const rsi = 100 - (100 / (1 + rs));
          result.push(rsi);
        }
      }
    }
    
    // 첫 번째 가격에 대한 NaN 추가
    result.unshift(NaN);
    return result;
  }

  // MACD 계산
  static macd(prices: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number): {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  } {
    const emaFast = this.exponentialMovingAverage(prices, fastPeriod);
    const emaSlow = this.exponentialMovingAverage(prices, slowPeriod);
    
    const macdLine = emaFast.map((fast, i) => fast - emaSlow[i]);
    const signalLine = this.exponentialMovingAverage(macdLine, signalPeriod);
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);
    
    return { macdLine, signalLine, histogram };
  }

  // 스토캐스틱 계산
  static stochastic(highs: number[], lows: number[], closes: number[], kPeriod: number, dPeriod: number): {
    k: number[];
    d: number[];
  } {
    const k: number[] = [];
    
    for (let i = 0; i < closes.length; i++) {
      if (i < kPeriod - 1) {
        k.push(NaN);
      } else {
        const highestHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
        const lowestLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
        
        if (highestHigh === lowestLow) {
          k.push(50);
        } else {
          const stochK = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
          k.push(stochK);
        }
      }
    }
    
    const d = this.simpleMovingAverage(k, dPeriod);
    
    return { k, d };
  }

  // 볼린저 밴드 계산
  static bollingerBands(prices: number[], period: number, stdDev: number): {
    upper: number[];
    middle: number[];
    lower: number[];
    width: number[];
  } {
    const middle = this.simpleMovingAverage(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];
    const width: number[] = [];
    
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
        width.push(NaN);
      } else {
        const slice = prices.slice(i - period + 1, i + 1);
        const mean = middle[i];
        const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
        const standardDeviation = Math.sqrt(variance);
        
        const upperBand = mean + (standardDeviation * stdDev);
        const lowerBand = mean - (standardDeviation * stdDev);
        
        upper.push(upperBand);
        lower.push(lowerBand);
        width.push(((upperBand - lowerBand) / mean) * 100);
      }
    }
    
    return { upper, middle, lower, width };
  }

  // ATR 계산
  static atr(highs: number[], lows: number[], closes: number[], period: number): number[] {
    const trueRanges: number[] = [];
    
    for (let i = 1; i < highs.length; i++) {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    const atr = this.simpleMovingAverage(trueRanges, period);
    atr.unshift(NaN); // 첫 번째 값에 NaN 추가
    
    return atr;
  }

  // OBV 계산
  static obv(prices: number[], volumes: number[]): number[] {
    const result: number[] = [0];
    
    for (let i = 1; i < prices.length; i++) {
      const priceChange = prices[i] - prices[i - 1];
      if (priceChange > 0) {
        result.push(result[i - 1] + volumes[i]);
      } else if (priceChange < 0) {
        result.push(result[i - 1] - volumes[i]);
      } else {
        result.push(result[i - 1]);
      }
    }
    
    return result;
  }

  // 백분위 계산
  static percentile(values: number[], targetValue: number): number {
    const cleanValues = values.filter(v => !isNaN(v));
    if (cleanValues.length === 0 || isNaN(targetValue)) return 50;
    
    const count = cleanValues.filter(v => v <= targetValue).length;
    return Math.round((count / cleanValues.length) * 100);
  }

  // 추세선 기울기 계산
  static trendSlope(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }
}

// 데이터 로드 함수
export async function loadMarketData(config: AnalysisConfig = DEFAULT_CONFIG, marketCode: string): Promise<MarketData> {
  console.log('시장 데이터 로드 시작 (병렬 처리)');
  const startTime = Date.now();
  
  // 병렬로 모든 데이터 로드
  const [dailyData, minuteData, weeklyData, ticker] = await Promise.all([
    getCandlesForDaily(config.dailyCount),
    getCandlesForMinutes(config.minuteInterval, config.minuteCount),
    getCandlesForWeekly(config.weeklyCount),
    getCurrentTicker()
  ]);
  
  // 시간순 정렬 (과거 → 현재)
  dailyData.sort((a, b) => new Date(a.candle_date_time_utc).getTime() - new Date(b.candle_date_time_utc).getTime());
  minuteData.sort((a, b) => new Date(a.candle_date_time_utc).getTime() - new Date(b.candle_date_time_utc).getTime());
  weeklyData.sort((a, b) => new Date(a.candle_date_time_utc).getTime() - new Date(b.candle_date_time_utc).getTime());
  
  const loadTime = (Date.now() - startTime) / 1000;
  console.log(`데이터 로드 완료: ${loadTime.toFixed(2)}초`);
  
  return {
    marketCode,
    dailyData,
    minuteData,
    weeklyData,
    ticker
  };
}

// 시장 정보 계산
export function calculateMarketInfo(data: MarketData, config: AnalysisConfig): MarketInfo {
  try {
    const ticker = data.ticker;
    
    // 24시간 거래량 변화율 계산
    const volumeChangePct = calculateVolumeChange(data.minuteData);
    
    // 30일 변동성 계산
    const volatility = calculateDailyVolatility(data.dailyData);
    
    return {
      symbol: data.marketCode,
      currentPrice: ticker.trade_price,
      dayChangePct: Math.round(ticker.signed_change_rate * 100 * 100) / 100,
      timestamp: new Date(ticker.timestamp).toISOString(),
      volume24h: Math.round(ticker.acc_trade_volume_24h * 100) / 100,
      volumeChange24hPct: volumeChangePct,
      volatility30dAnnualized: volatility
    };
  } catch (error) {
    console.error('시장 정보 계산 실패:', error);
    return {
      symbol: data.marketCode,
      currentPrice: 0,
      dayChangePct: 0.0,
      timestamp: new Date().toISOString(),
      volume24h: 0.0,
      volumeChange24hPct: 0.0,
      volatility30dAnnualized: 0.0
    };
  }
}

// 24시간 거래량 변화율 계산
function calculateVolumeChange(minuteData: MinuteCandleStick[]): number {
  if (minuteData.length < 48) return 0.0;
  
  try {
    // 최근 24개와 이전 24개 비교
    const recentVolume = minuteData.slice(-24).reduce((sum, candle) => sum + candle.candle_acc_trade_volume, 0);
    const previousVolume = minuteData.slice(-48, -24).reduce((sum, candle) => sum + candle.candle_acc_trade_volume, 0);
    
    if (previousVolume > 0) {
      return Math.round(((recentVolume - previousVolume) / previousVolume) * 100 * 100) / 100;
    }
    return 0.0;
  } catch {
    return 0.0;
  }
}

// 30일 연간화 변동성 계산
function calculateDailyVolatility(dailyData: DailyCandleStick[]): number {
  if (dailyData.length < 30) return 0.0;
  
  try {
    const returns: number[] = [];
    const recent30Days = dailyData.slice(-30);
    
    for (let i = 1; i < recent30Days.length; i++) {
      const yesterdayPrice = recent30Days[i - 1].trade_price;
      const todayPrice = recent30Days[i].trade_price;
      if (yesterdayPrice > 0) {
        const dailyReturn = Math.log(todayPrice / yesterdayPrice);
        returns.push(dailyReturn);
      }
    }
    
    if (returns.length > 0) {
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      const annualizedVolatility = stdDev * Math.sqrt(252) * 100;
      return Math.round(annualizedVolatility * 10) / 10;
    }
    return 0.0;
  } catch {
    return 0.0;
  }
}

// 추세 분석 계산
export function calculateTrendAnalysis(data: MarketData, config: AnalysisConfig): TrendAnalysisResult {
  try {
    // 각 시간대별 추세 분석
    const shortTerm = analyzeShortTermTrend(data.minuteData.slice(-4));
    const mediumTerm = analyzeMediumTermTrend(data.dailyData.slice(-7));
    const longTerm = analyzeLongTermTrend(data.weeklyData.slice(-8));
    
    // 추세 강도 및 지속 기간
    const trendStrength = calculateTrendStrength(shortTerm, mediumTerm, longTerm);
    const trendDuration = calculateTrendDuration(data.dailyData);
    
    return {
      shortTerm: shortTerm.trend,
      mediumTerm: mediumTerm.trend,
      longTerm: longTerm.trend,
      trendStrength: Math.round(trendStrength),
      trendDurationDays: trendDuration
    };
  } catch (error) {
    console.error('추세 분석 실패:', error);
    return {
      shortTerm: 'neutral',
      mediumTerm: 'neutral',
      longTerm: 'neutral',
      trendStrength: 50,
      trendDurationDays: 1
    };
  }
}

// 단기 추세 분석 (1-4시간)
function analyzeShortTermTrend(hourlyData: MinuteCandleStick[]): TrendAnalysis {
  if (hourlyData.length < 2) {
    return { trend: 'neutral', strength: 50 };
  }
  
  const upCount = hourlyData.filter(candle => candle.trade_price > candle.opening_price).length;
  const downCount = hourlyData.length - upCount;
  
  const startPrice = hourlyData[0].opening_price;
  const endPrice = hourlyData[hourlyData.length - 1].trade_price;
  const priceChange = ((endPrice - startPrice) / startPrice) * 100;
  
  if (priceChange > 1.0 || (upCount >= 3 && priceChange > 0)) {
    return {
      trend: 'bullish',
      strength: Math.min(100, Math.abs(priceChange) * 15 + upCount * 10)
    };
  } else if (priceChange < -1.0 || (downCount >= 3 && priceChange < 0)) {
    return {
      trend: 'bearish',
      strength: Math.min(100, Math.abs(priceChange) * 15 + downCount * 10)
    };
  } else {
    return {
      trend: 'neutral',
      strength: 50 - Math.abs(priceChange * 10)
    };
  }
}

// 중기 추세 분석 (1일-1주)
function analyzeMediumTermTrend(dailyData: DailyCandleStick[]): TrendAnalysis {
  if (dailyData.length < 2) {
    return { trend: 'neutral', strength: 50 };
  }
  
  const upDays = dailyData.filter(candle => candle.change_rate > 0).length;
  const downDays = dailyData.length - upDays;
  
  const startPrice = dailyData[0].trade_price;
  const endPrice = dailyData[dailyData.length - 1].trade_price;
  const priceChange = ((endPrice - startPrice) / startPrice) * 100;
  
  if (priceChange > 4 || (upDays >= 4 && priceChange > 0)) {
    return {
      trend: 'bullish',
      strength: Math.min(100, Math.abs(priceChange) * 5 + upDays * 5)
    };
  } else if (priceChange < -4 || (downDays >= 4 && priceChange < 0)) {
    return {
      trend: 'bearish',
      strength: Math.min(100, Math.abs(priceChange) * 5 + downDays * 5)
    };
  } else {
    return {
      trend: 'neutral',
      strength: 50 - Math.abs(priceChange * 3)
    };
  }
}

// 장기 추세 분석 (1주-1개월)
function analyzeLongTermTrend(weeklyData: WeeklyCandleStick[]): TrendAnalysis {
  if (weeklyData.length < 2) {
    return { trend: 'neutral', strength: 50 };
  }
  
  let upWeeks = 0;
  for (let i = 1; i < weeklyData.length; i++) {
    if (weeklyData[i].trade_price > weeklyData[i - 1].trade_price) {
      upWeeks++;
    }
  }
  
  const downWeeks = weeklyData.length - 1 - upWeeks;
  
  const startPrice = weeklyData[0].trade_price;
  const endPrice = weeklyData[weeklyData.length - 1].trade_price;
  const priceChange = ((endPrice - startPrice) / startPrice) * 100;
  
  if (priceChange > 8 || (upWeeks >= 3 && priceChange > 0)) {
    return {
      trend: 'bullish',
      strength: Math.min(100, Math.abs(priceChange) * 2 + upWeeks * 10)
    };
  } else if (priceChange < -8 || (downWeeks >= 3 && priceChange < 0)) {
    return {
      trend: 'bearish',
      strength: Math.min(100, Math.abs(priceChange) * 2 + downWeeks * 10)
    };
  } else {
    return {
      trend: 'neutral',
      strength: 50 - Math.abs(priceChange)
    };
  }
}

// 추세 강도 계산
function calculateTrendStrength(shortTerm: TrendAnalysis, mediumTerm: TrendAnalysis, longTerm: TrendAnalysis): number {
  const weightedStrength = (
    (shortTerm.strength * 0.2) + 
    (mediumTerm.strength * 0.3) + 
    (longTerm.strength * 0.5)
  );
  
  const trends = [shortTerm.trend, mediumTerm.trend, longTerm.trend];
  const uniqueTrends = new Set(trends);
  
  if (uniqueTrends.size === 1 && !trends.includes('neutral')) {
    return Math.min(100, weightedStrength + 15);
  } else if (mediumTerm.trend === longTerm.trend && mediumTerm.trend !== 'neutral') {
    return Math.min(100, weightedStrength + 8);
  }
  
  return weightedStrength;
}

// 추세 지속 기간 계산
function calculateTrendDuration(dailyData: DailyCandleStick[]): number {
  if (dailyData.length < 2) return 1;
  
  const recent2Days = dailyData.slice(-2);
  let currentDirection: 'up' | 'down' | null = null;
  
  if (recent2Days[1].trade_price > recent2Days[0].trade_price) {
    currentDirection = 'up';
  } else if (recent2Days[1].trade_price < recent2Days[0].trade_price) {
    currentDirection = 'down';
  }
  
  if (!currentDirection) return 1;
  
  let duration = 1;
  for (let i = dailyData.length - 2; i > 0; i--) {
    if (currentDirection === 'up') {
      if (dailyData[i].trade_price > dailyData[i - 1].trade_price) {
        duration++;
      } else {
        break;
      }
    } else {
      if (dailyData[i].trade_price < dailyData[i - 1].trade_price) {
        duration++;
      } else {
        break;
      }
    }
  }
  
  return duration;
}

// 가격 레벨 계산
export function calculatePriceLevels(data: MarketData, config: AnalysisConfig): PriceLevels {
  try {
    const currentPrice = data.ticker.trade_price;
    const dailyData = data.dailyData.slice(-30); // 최근 30일
    
    // 지지선과 저항선 계산
    const supportResistance = calculateSupportResistance(dailyData, currentPrice);
    
    // 최근 테스트된 레벨
    const lastTested = identifyLastTestedLevel(
      data.dailyData.slice(-5),
      supportResistance.support,
      supportResistance.resistance
    );
    
    // 거리 계산
    const distanceToResistance = ((supportResistance.resistance[0] - currentPrice) / currentPrice) * 100;
    const distanceToSupport = ((currentPrice - supportResistance.support[0]) / currentPrice) * 100;
    
    return {
      keyResistance: supportResistance.resistance,
      keySupport: supportResistance.support,
      lastTested,
      distanceToResistancePct: Math.round(distanceToResistance * 100) / 100,
      distanceToSupportPct: Math.round(distanceToSupport * 100) / 100
    };
  } catch (error) {
    console.error('가격 레벨 계산 실패:', error);
    return {
      keyResistance: [0, 0],
      keySupport: [0, 0],
      lastTested: 'resistance',
      distanceToResistancePct: 0.0,
      distanceToSupportPct: 0.0
    };
  }
}

// 지지선/저항선 계산
function calculateSupportResistance(data: DailyCandleStick[], currentPrice: number): {
  resistance: number[];
  support: number[];
} {
  if (data.length === 0) {
    return {
      resistance: [Math.round(currentPrice * 1.02), Math.round(currentPrice * 1.04)],
      support: [Math.round(currentPrice * 0.98), Math.round(currentPrice * 0.96)]
    };
  }
  
  const highs = data.map(candle => candle.high_price);
  const lows = data.map(candle => candle.low_price);
  
  let resistanceLevels = highs.filter(h => h > currentPrice);
  let supportLevels = lows.filter(l => l < currentPrice);
  
  resistanceLevels.sort((a, b) => a - b);
  supportLevels.sort((a, b) => b - a);
  
  // 최소 2개 보장
  if (resistanceLevels.length < 2) {
    resistanceLevels = resistanceLevels.concat([currentPrice * 1.02, currentPrice * 1.04]);
  }
  if (supportLevels.length < 2) {
    supportLevels = supportLevels.concat([currentPrice * 0.98, currentPrice * 0.96]);
  }
  
  return {
    resistance: resistanceLevels.slice(0, 2).map(x => Math.round(x)),
    support: supportLevels.slice(0, 2).map(x => Math.round(x))
  };
}

// 최근 테스트된 레벨 식별
function identifyLastTestedLevel(
  recentData: DailyCandleStick[],
  supportLevels: number[],
  resistanceLevels: number[]
): string {
  if (recentData.length === 0) return 'resistance';
  
  const tolerance = 0.005; // 0.5% 허용 오차
  
  for (const candle of recentData) {
    for (const resistance of resistanceLevels) {
      if (Math.abs(resistance - candle.high_price) / resistance < tolerance) {
        return 'resistance';
      }
    }
    for (const support of supportLevels) {
      if (Math.abs(support - candle.low_price) / support < tolerance) {
        return 'support';
      }
    }
  }
  
  // 최근 가격 움직임으로 결정
  if (recentData.length >= 2) {
    const lastIndex = recentData.length - 1;
    return recentData[lastIndex].trade_price > recentData[lastIndex - 1].trade_price
      ? 'resistance'
      : 'support';
  }
  
  return 'resistance';
}

// 기술적 신호 계산
export function calculateTechnicalSignals(data: MarketData, config: AnalysisConfig): TechnicalSignals {
  try {
    const dailyData = data.dailyData;
    
    if (dailyData.length < config.maLong) {
      console.warn(`데이터 부족: ${dailyData.length}개, 필요: ${config.maLong}개`);
      return emptyTechnicalSignals();
    }
    
    console.log(`기술적 지표 계산 시작: ${dailyData.length}개 데이터`);
    
    // 모든 기술적 지표를 계산
    const movingAverages = calculateMovingAverages(dailyData, config);
    const momentum = calculateMomentum(dailyData, config);
    const volatility = calculateVolatility(dailyData, config);
    const volume = calculateVolumeIndicators(dailyData, config);
    
    return {
      movingAverages,
      momentum,
      volatility,
      volume
    };
  } catch (error) {
    console.error('기술적 신호 계산 실패:', error);
    return emptyTechnicalSignals();
  }
}

// 이동평균 계산
function calculateMovingAverages(data: DailyCandleStick[], config: AnalysisConfig): MovingAveragesResult {
  try {
    if (data.length < config.maLong) {
      return {
        maCrossovers: [],
        [`ma_${config.maLong}d`]: { value: null, position: 'below', signal: 'bearish' },
        [`ma_${config.maMedium}d`]: { value: null, position: 'below', signal: 'bearish' },
        [`ma_${config.maShort}d`]: { value: null, position: 'below', signal: 'bearish' }
      };
    }
    
    const prices = data.map(candle => candle.trade_price);
    const currentPrice = prices[prices.length - 1];
    
    const maShort = TechnicalIndicators.simpleMovingAverage(prices, config.maShort);
    const maMedium = TechnicalIndicators.simpleMovingAverage(prices, config.maMedium);
    const maLong = TechnicalIndicators.simpleMovingAverage(prices, config.maLong);
    
    const currentMaShort = maShort[maShort.length - 1];
    const currentMaMedium = maMedium[maMedium.length - 1];
    const currentMaLong = maLong[maLong.length - 1];
    
    console.log(`이동평균 계산 완료: MA${config.maShort}=${currentMaShort?.toFixed(0)}, MA${config.maMedium}=${currentMaMedium?.toFixed(0)}, MA${config.maLong}=${currentMaLong?.toFixed(0)}`);
    
    // 교차 신호 분석
    const crossovers = analyzeMACrossovers(maShort, maMedium, config);
    
    return {
      maCrossovers: crossovers,
      [`ma_${config.maLong}d`]: {
        value: !isNaN(currentMaLong) ? Math.round(currentMaLong) : null,
        position: currentPrice > currentMaLong ? 'above' : 'below',
        signal: currentPrice > currentMaLong ? 'bullish' : 'bearish'
      },
      [`ma_${config.maMedium}d`]: {
        value: !isNaN(currentMaMedium) ? Math.round(currentMaMedium) : null,
        position: currentPrice > currentMaMedium ? 'above' : 'below',
        signal: currentPrice > currentMaMedium ? 'bullish' : 'bearish'
      },
      [`ma_${config.maShort}d`]: {
        value: !isNaN(currentMaShort) ? Math.round(currentMaShort) : null,
        position: currentPrice > currentMaShort ? 'above' : 'below',
        signal: currentPrice > currentMaShort ? 'bullish' : 'bearish'
      }
    };
  } catch (error) {
    console.error('이동평균 계산 실패:', error);
    return {
      maCrossovers: [],
      [`ma_${config.maLong}d`]: { value: null, position: 'below', signal: 'bearish' },
      [`ma_${config.maMedium}d`]: { value: null, position: 'below', signal: 'bearish' },
      [`ma_${config.maShort}d`]: { value: null, position: 'below', signal: 'bearish' }
    };
  }
}

// 이동평균 교차 분석
function analyzeMACrossovers(maShort: number[], maMedium: number[], config: AnalysisConfig): MACrossover[] {
  const crossovers: MACrossover[] = [];
  const lookback = Math.min(30, maShort.length);
  
  if (lookback < 2) return crossovers;
  
  for (let i = lookback - 1; i > 0; i--) {
    try {
      const prevShort = maShort[maShort.length - i - 1];
      const prevMedium = maMedium[maMedium.length - i - 1];
      const currShort = maShort[maShort.length - i];
      const currMedium = maMedium[maMedium.length - i];
      
      if (isNaN(prevShort) || isNaN(prevMedium) || isNaN(currShort) || isNaN(currMedium)) {
        continue;
      }
      
      // 골든/데드 크로스 확인
      if (prevShort <= prevMedium && currShort > currMedium) {
        crossovers.push({
          type: 'golden_cross',
          fastMa: `${config.maShort}d`,
          slowMa: `${config.maMedium}d`,
          daysAgo: i
        });
      } else if (prevShort >= prevMedium && currShort < currMedium) {
        crossovers.push({
          type: 'death_cross',
          fastMa: `${config.maShort}d`,
          slowMa: `${config.maMedium}d`,
          daysAgo: i
        });
      }
    } catch {
      continue;
    }
  }
  
  return crossovers;
}

// 모멘텀 지표 계산
function calculateMomentum(data: DailyCandleStick[], config: AnalysisConfig): TechnicalSignals['momentum'] {
  try {
    if (data.length < config.rsiPeriod) {
      return {
        rsi14d: { value: null, zone: 'neutral', trend: 'neutral' },
        macd: { line: 0.0, signal: 0.0, histogram: 0.0, trend: 'converging' },
        stochastic: { k: null, d: null, trend: 'neutral', zone: 'neutral' }
      };
    }
    
    const prices = data.map(candle => candle.trade_price);
    const highs = data.map(candle => candle.high_price);
    const lows = data.map(candle => candle.low_price);
    
    // RSI 계산
    const rsi = TechnicalIndicators.rsi(prices, config.rsiPeriod);
    const currentRsi = rsi[rsi.length - 1];
    const previousRsi = rsi[rsi.length - 2];
    
    // MACD 계산
    const macd = TechnicalIndicators.macd(prices, config.macdFast, config.macdSlow, config.macdSignal);
    const currentMacdLine = macd.macdLine[macd.macdLine.length - 1];
    const currentSignalLine = macd.signalLine[macd.signalLine.length - 1];
    const currentHistogram = macd.histogram[macd.histogram.length - 1];
    
    // Stochastic 계산
    const stoch = TechnicalIndicators.stochastic(highs, lows, prices, config.stochKPeriod, config.stochDPeriod);
    const currentStochK = stoch.k[stoch.k.length - 1];
    const currentStochD = stoch.d[stoch.d.length - 1];
    
    console.log(`모멘텀 지표 계산 완료: RSI=${currentRsi?.toFixed(1)}, MACD=${(currentMacdLine / 1000000)?.toFixed(2)}`);
    
    return {
      rsi14d: {
        value: !isNaN(currentRsi) ? Math.round(currentRsi * 10) / 10 : null,
        zone: currentRsi >= config.rsiOverbought ? 'overbought' : 
              currentRsi <= config.rsiOversold ? 'oversold' : 'neutral',
        trend: currentRsi > previousRsi ? 'rising' : 
               currentRsi < previousRsi ? 'falling' : 'neutral'
      },
      macd: {
        line: !isNaN(currentMacdLine) ? Math.round(currentMacdLine / 1000000 * 100) / 100 : 0.0,
        signal: !isNaN(currentSignalLine) ? Math.round(currentSignalLine / 1000000 * 100) / 100 : 0.0,
        histogram: !isNaN(currentHistogram) ? Math.round(currentHistogram / 1000000 * 100) / 100 : 0.0,
        trend: getMacdTrend(macd.histogram)
      },
      stochastic: {
        k: !isNaN(currentStochK) ? Math.round(currentStochK * 10) / 10 : null,
        d: !isNaN(currentStochD) ? Math.round(currentStochD * 10) / 10 : null,
        trend: getStochTrend(stoch.k, stoch.d),
        zone: getStochZone(currentStochK, currentStochD, config)
      }
    };
  } catch (error) {
    console.error('모멘텀 지표 계산 실패:', error);
    return {
      rsi14d: { value: null, zone: 'neutral', trend: 'neutral' },
      macd: { line: 0.0, signal: 0.0, histogram: 0.0, trend: 'converging' },
      stochastic: { k: null, d: null, trend: 'neutral', zone: 'neutral' }
    };
  }
}

// MACD 추세 결정
function getMacdTrend(histogram: number[]): 'converging' | 'diverging' | 'crossover' | 'neutral' {
  if (histogram.length < 2) return 'neutral';
  
  const current = histogram[histogram.length - 1];
  const previous = histogram[histogram.length - 2];
  
  if (isNaN(current) || isNaN(previous)) return 'neutral';
  
  if (Math.abs(current) < Math.abs(previous)) {
    return 'converging';
  } else if (Math.abs(current) > Math.abs(previous)) {
    return 'diverging';
  } else if ((current > 0 && previous <= 0) || (current < 0 && previous >= 0)) {
    return 'crossover';
  } else {
    return 'neutral';
  }
}

// Stochastic 추세 결정
function getStochTrend(kValues: number[], dValues: number[]): 'bullish' | 'bearish' | 'bullish_crossover' | 'bearish_crossover' | 'neutral' {
  if (kValues.length < 2 || dValues.length < 2) return 'neutral';
  
  const currentK = kValues[kValues.length - 1];
  const currentD = dValues[dValues.length - 1];
  const previousK = kValues[kValues.length - 2];
  const previousD = dValues[dValues.length - 2];
  
  if ([currentK, currentD, previousK, previousD].some(isNaN)) return 'neutral';
  
  if (currentK > previousK && currentD > previousD) {
    return 'bullish';
  } else if (currentK < previousK && currentD < previousD) {
    return 'bearish';
  } else if (currentK > currentD && previousK <= previousD) {
    return 'bullish_crossover';
  } else if (currentK < currentD && previousK >= previousD) {
    return 'bearish_crossover';
  } else {
    return 'neutral';
  }
}

// Stochastic 존 결정
function getStochZone(kValue: number, dValue: number, config: AnalysisConfig): 'overbought' | 'oversold' | 'neutral' {
  if (isNaN(kValue) || isNaN(dValue)) return 'neutral';
  
  if (kValue >= config.stochOverbought && dValue >= config.stochOverbought) {
    return 'overbought';
  } else if (kValue <= config.stochOversold && dValue <= config.stochOversold) {
    return 'oversold';
  } else {
    return 'neutral';
  }
}

// 변동성 지표 계산
function calculateVolatility(data: DailyCandleStick[], config: AnalysisConfig): TechnicalSignals['volatility'] {
  try {
    if (data.length < config.bbPeriod) {
      return {
        bollingerBands: { widthPercentile: 50, position: 50, signal: 'neutral' },
        atr14d: null,
        atrPercentile: 50
      };
    }
    
    const prices = data.map(candle => candle.trade_price);
    const highs = data.map(candle => candle.high_price);
    const lows = data.map(candle => candle.low_price);
    const currentPrice = prices[prices.length - 1];
    
    // Bollinger Bands
    const bb = TechnicalIndicators.bollingerBands(prices, config.bbPeriod, config.bbStd);
    const latestUpper = bb.upper[bb.upper.length - 1];
    const latestLower = bb.lower[bb.lower.length - 1];
    const latestWidth = bb.width[bb.width.length - 1];
    
    // 밴드 내 위치
    let position = 50;
    if (!isNaN(latestUpper) && !isNaN(latestLower) && latestUpper !== latestLower) {
      position = Math.min(100, Math.max(0, ((currentPrice - latestLower) / (latestUpper - latestLower)) * 100));
    }
    
    // ATR 계산
    const atr = TechnicalIndicators.atr(highs, lows, prices, config.atrPeriod);
    const currentAtr = atr[atr.length - 1];
    
    console.log(`변동성 지표 계산 완료: BB위치=${position.toFixed(0)}%, ATR=${currentAtr?.toFixed(0)}`);
    
    return {
      bollingerBands: {
        widthPercentile: TechnicalIndicators.percentile(bb.width, latestWidth),
        position: Math.round(position),
        signal: position > 80 ? 'overbought' : position < 20 ? 'oversold' : 'neutral'
      },
      atr14d: !isNaN(currentAtr) ? Math.round(currentAtr) : null,
      atrPercentile: TechnicalIndicators.percentile(atr, currentAtr)
    };
  } catch (error) {
    console.error('변동성 지표 계산 실패:', error);
    return {
      bollingerBands: { widthPercentile: 50, position: 50, signal: 'neutral' },
      atr14d: null,
      atrPercentile: 50
    };
  }
}

// 거래량 지표 계산
function calculateVolumeIndicators(data: DailyCandleStick[], config: AnalysisConfig): TechnicalSignals['volume'] {
  try {
    if (data.length < config.volumeEmaPeriod) {
      return {
        obvTrend: 'neutral',
        volumeEmaRatio: 1.0,
        volumePriceTrend: 'neutral'
      };
    }
    
    const prices = data.map(candle => candle.trade_price);
    const volumes = data.map(candle => candle.candle_acc_trade_volume);
    
    // OBV 계산
    const obv = TechnicalIndicators.obv(prices, volumes);
    
    // Volume EMA
    const volumeEma = TechnicalIndicators.exponentialMovingAverage(volumes, config.volumeEmaPeriod);
    const currentVolume = volumes[volumes.length - 1];
    const currentEma = volumeEma[volumeEma.length - 1];
    
    const volumeEmaRatio = currentEma > 0 ? Math.round(currentVolume / currentEma * 100) / 100 : 1.0;
    
    console.log(`거래량 지표 계산 완료: Volume EMA Ratio=${volumeEmaRatio}`);
    
    return {
      obvTrend: calculateObvTrend(obv),
      volumeEmaRatio,
      volumePriceTrend: calculateVolumePriceTrend(data, config)
    };
  } catch (error) {
    console.error('거래량 지표 계산 실패:', error);
    return {
      obvTrend: 'neutral',
      volumeEmaRatio: 1.0,
      volumePriceTrend: 'neutral'
    };
  }
}

// OBV 추세 계산
function calculateObvTrend(obv: number[]): 'rising' | 'falling' | 'neutral' {
  const recentObv = obv.slice(-5);
  if (recentObv.length < 2) return 'neutral';
  
  const slope = TechnicalIndicators.trendSlope(recentObv);
  
  if (slope > 0) {
    return 'rising';
  } else if (slope < 0) {
    return 'falling';
  } else {
    return 'neutral';
  }
}

// Volume-Price Trend 계산
function calculateVolumePriceTrend(data: DailyCandleStick[], config: AnalysisConfig): 'confirming' | 'diverging' | 'neutral' {
  const period = Math.min(config.volumeTrendPeriod, data.length);
  if (period < 2) return 'neutral';
  
  const recentData = data.slice(-period);
  
  const priceChange = recentData[recentData.length - 1].trade_price - recentData[0].trade_price;
  const volumeChange = recentData[recentData.length - 1].candle_acc_trade_volume - recentData[0].candle_acc_trade_volume;
  
  const priceDirection = priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'flat';
  const volumeDirection = volumeChange > 0 ? 'up' : volumeChange < 0 ? 'down' : 'flat';
  
  if ((priceDirection === 'up' && volumeDirection === 'up') ||
      (priceDirection === 'down' && volumeDirection === 'down')) {
    return 'confirming';
  } else if ((priceDirection === 'up' && volumeDirection === 'down') ||
             (priceDirection === 'down' && volumeDirection === 'up')) {
    return 'diverging';
  } else {
    return 'neutral';
  }
}

// 빈 기술적 신호
function emptyTechnicalSignals(): TechnicalSignals {
  return {
    movingAverages: {
      maCrossovers: [],
      ma_200d: { value: null, position: 'below', signal: 'bearish' },
      ma_50d: { value: null, position: 'below', signal: 'bearish' },
      ma_20d: { value: null, position: 'below', signal: 'bearish' }
    },
    momentum: {
      rsi14d: { value: null, zone: 'neutral', trend: 'neutral' },
      macd: { line: 0, signal: 0, histogram: 0, trend: 'neutral' },
      stochastic: { k: null, d: null, trend: 'neutral', zone: 'neutral' }
    },
    volatility: {
      bollingerBands: { widthPercentile: 50, position: 50, signal: 'neutral' },
      atr14d: null,
      atrPercentile: 50
    },
    volume: {
      obvTrend: 'neutral',
      volumeEmaRatio: 1.0,
      volumePriceTrend: 'neutral'
    }
  };
}

/**
 * 비트코인 시장 종합 분석 함수 (Bitcoin Market Comprehensive Analysis)
 * 
 * 이 함수는 업비트 API를 통해 실시간 비트코인 데이터를 수집하고,
 * 다양한 기술적 지표와 시장 분석을 수행하여 종합적인 투자 정보를 제공합니다.
 * 
 * @param config 분석 설정 파라미터 (선택사항)
 * @returns 종합 분석 결과
 */
export async function analyzeBlockChainMarket(marketCode: string = 'KRW-BTC'): Promise<AnalysisResult> {
  try {
    const startTime = Date.now();
    const config: AnalysisConfig = DEFAULT_CONFIG;
    
    // 1. 데이터 로드 (병렬 처리)
    const marketData = await loadMarketData(config, marketCode);
    
    console.log(`로드된 데이터: Daily=${marketData.dailyData.length}, Minute=${marketData.minuteData.length}, Weekly=${marketData.weeklyData.length}`);
    
    // 2. 모든 분석을 병렬로 실행
    const [marketInfo, trendAnalysis, priceLevels, technicalSignals] = await Promise.all([
      Promise.resolve(calculateMarketInfo(marketData, config)),
      Promise.resolve(calculateTrendAnalysis(marketData, config)),
      Promise.resolve(calculatePriceLevels(marketData, config)),
      Promise.resolve(calculateTechnicalSignals(marketData, config))
    ]);
    
    const analysisTime = (Date.now() - startTime) / 1000;
    console.log(`전체 분석 완료: ${analysisTime.toFixed(2)}초`);
    
    return {
      marketInfo,
      trendAnalysis,
      priceLevels,
      technicalSignals
    };
    
  } catch (error) {
    console.error('시장 분석 실패:', error);
    throw error;
  }
}