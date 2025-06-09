export interface Ticker {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_date_kst: string;
  trade_time_kst: string;
  trade_timestamp: number;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: 'RISE' | 'FALL' | 'EVEN';
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  timestamp: number;
}

export function createTickerFromDict(data: any): Ticker {
  return {
    market: data.market || '',
    trade_date: data.trade_date || '',
    trade_time: data.trade_time || '',
    trade_date_kst: data.trade_date_kst || '',
    trade_time_kst: data.trade_time_kst || '',
    trade_timestamp: parseInt(data.trade_timestamp || '0'),
    opening_price: parseFloat(data.opening_price || '0'),
    high_price: parseFloat(data.high_price || '0'),
    low_price: parseFloat(data.low_price || '0'),
    trade_price: parseFloat(data.trade_price || '0'),
    prev_closing_price: parseFloat(data.prev_closing_price || '0'),
    change: data.change || 'EVEN',
    change_price: parseFloat(data.change_price || '0'),
    change_rate: parseFloat(data.change_rate || '0'),
    signed_change_price: parseFloat(data.signed_change_price || '0'),
    signed_change_rate: parseFloat(data.signed_change_rate || '0'),
    trade_volume: parseFloat(data.trade_volume || '0'),
    acc_trade_price: parseFloat(data.acc_trade_price || '0'),
    acc_trade_price_24h: parseFloat(data.acc_trade_price_24h || '0'),
    acc_trade_volume: parseFloat(data.acc_trade_volume || '0'),
    acc_trade_volume_24h: parseFloat(data.acc_trade_volume_24h || '0'),
    highest_52_week_price: parseFloat(data.highest_52_week_price || '0'),
    highest_52_week_date: data.highest_52_week_date || '',
    lowest_52_week_price: parseFloat(data.lowest_52_week_price || '0'),
    lowest_52_week_date: data.lowest_52_week_date || '',
    timestamp: parseInt(data.timestamp || '0')
  };
}

export function getTradeDateTime(ticker: Ticker): Date {
  const dateStr = `${ticker.trade_date.slice(0, 4)}-${ticker.trade_date.slice(4, 6)}-${ticker.trade_date.slice(6, 8)}`;
  const timeStr = `${ticker.trade_time.slice(0, 2)}:${ticker.trade_time.slice(2, 4)}:${ticker.trade_time.slice(4, 6)}`;
  return new Date(`${dateStr}T${timeStr}`);
}

export function getTradeDateTimeKst(ticker: Ticker): Date {
  const dateStr = `${ticker.trade_date_kst.slice(0, 4)}-${ticker.trade_date_kst.slice(4, 6)}-${ticker.trade_date_kst.slice(6, 8)}`;
  const timeStr = `${ticker.trade_time_kst.slice(0, 2)}:${ticker.trade_time_kst.slice(2, 4)}:${ticker.trade_time_kst.slice(4, 6)}`;
  return new Date(`${dateStr}T${timeStr}+09:00`);
}