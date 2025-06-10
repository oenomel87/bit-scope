export interface MinuteCandleStick {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
  unit: number;
}

export interface DailyCandleStick {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
  prev_closing_price: number;
  change_price: number;
  change_rate: number;
}

export interface WeeklyCandleStick {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
  first_day_of_period: string;
}

// 타입별 생성 함수들
export function createMinuteCandleFromDict(data: any): MinuteCandleStick {
  return {
    market: data.market || '',
    candle_date_time_utc: data.candle_date_time_utc || '',
    candle_date_time_kst: data.candle_date_time_kst || '',
    opening_price: parseFloat(data.opening_price || '0'),
    high_price: parseFloat(data.high_price || '0'),
    low_price: parseFloat(data.low_price || '0'),
    trade_price: parseFloat(data.trade_price || '0'),
    timestamp: parseInt(data.timestamp || '0'),
    candle_acc_trade_price: parseFloat(data.candle_acc_trade_price || '0'),
    candle_acc_trade_volume: parseFloat(data.candle_acc_trade_volume || '0'),
    unit: parseInt(data.unit || '1')
  };
}

export function createDailyCandleFromDict(data: any): DailyCandleStick {
  return {
    market: data.market || '',
    candle_date_time_utc: data.candle_date_time_utc || '',
    candle_date_time_kst: data.candle_date_time_kst || '',
    opening_price: parseFloat(data.opening_price || '0'),
    high_price: parseFloat(data.high_price || '0'),
    low_price: parseFloat(data.low_price || '0'),
    trade_price: parseFloat(data.trade_price || '0'),
    timestamp: parseInt(data.timestamp || '0'),
    candle_acc_trade_price: parseFloat(data.candle_acc_trade_price || '0'),
    candle_acc_trade_volume: parseFloat(data.candle_acc_trade_volume || '0'),
    prev_closing_price: parseFloat(data.prev_closing_price || '0'),
    change_price: parseFloat(data.change_price || '0'),
    change_rate: parseFloat(data.change_rate || '0')
  };
}

export function createWeeklyCandleFromDict(data: any): WeeklyCandleStick {
  return {
    market: data.market || '',
    candle_date_time_utc: data.candle_date_time_utc || '',
    candle_date_time_kst: data.candle_date_time_kst || '',
    opening_price: parseFloat(data.opening_price || '0'),
    high_price: parseFloat(data.high_price || '0'),
    low_price: parseFloat(data.low_price || '0'),
    trade_price: parseFloat(data.trade_price || '0'),
    timestamp: parseInt(data.timestamp || '0'),
    candle_acc_trade_price: parseFloat(data.candle_acc_trade_price || '0'),
    candle_acc_trade_volume: parseFloat(data.candle_acc_trade_volume || '0'),
    first_day_of_period: data.first_day_of_period || ''
  };
}