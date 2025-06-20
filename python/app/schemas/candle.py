from dataclasses import dataclass
from datetime import datetime
from typing import Any, Union

def safe_float(value: Any, default: float = 0.0) -> float:
    """None이나 빈 값을 안전하게 float로 변환"""
    if value is None or value == '':
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def safe_int(value: Any, default: int = 0) -> int:
    """None이나 빈 값을 안전하게 int로 변환"""
    if value is None or value == '':
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

@dataclass
class MinuteCandleStick:
    market: str
    candle_date_time_utc: str
    candle_date_time_kst: str
    opening_price: float
    high_price: float
    low_price: float
    trade_price: float
    timestamp: int
    candle_acc_trade_price: float
    candle_acc_trade_volume: float
    unit: int
    
    @classmethod
    def from_dict(cls, data: dict) -> 'MinuteCandleStick':
        return cls(
            market=data.get('market', ''),
            candle_date_time_utc=data.get('candle_date_time_utc', ''),
            candle_date_time_kst=data.get('candle_date_time_kst', ''),
            opening_price=safe_float(data.get('opening_price')),
            high_price=safe_float(data.get('high_price')),
            low_price=safe_float(data.get('low_price')),
            trade_price=safe_float(data.get('trade_price')),
            timestamp=safe_int(data.get('timestamp')),
            candle_acc_trade_price=safe_float(data.get('candle_acc_trade_price')),
            candle_acc_trade_volume=safe_float(data.get('candle_acc_trade_volume')),
            unit=safe_int(data.get('unit'), 1)
        )

    def get_utc_datetime(self) -> datetime:
        """UTC 시간을 datetime 객체로 반환"""
        return datetime.fromisoformat(self.candle_date_time_utc.replace('Z', '+00:00'))
    
    def get_kst_datetime(self) -> datetime:
        """KST 시간을 datetime 객체로 반환"""
        return datetime.fromisoformat(self.candle_date_time_kst.replace('Z', '+00:00'))

@dataclass
class DailyCandleStick:
    market: str
    candle_date_time_utc: str
    candle_date_time_kst: str
    opening_price: float
    high_price: float
    low_price: float
    trade_price: float
    timestamp: int
    candle_acc_trade_price: float
    candle_acc_trade_volume: float
    prev_closing_price: float
    change_price: float
    change_rate: float
    
    @classmethod
    def from_dict(cls, data: dict) -> 'DailyCandleStick':
        return cls(
            market=data.get('market', ''),
            candle_date_time_utc=data.get('candle_date_time_utc', ''),
            candle_date_time_kst=data.get('candle_date_time_kst', ''),
            opening_price=safe_float(data.get('opening_price')),
            high_price=safe_float(data.get('high_price')),
            low_price=safe_float(data.get('low_price')),
            trade_price=safe_float(data.get('trade_price')),
            timestamp=safe_int(data.get('timestamp')),
            candle_acc_trade_price=safe_float(data.get('candle_acc_trade_price')),
            candle_acc_trade_volume=safe_float(data.get('candle_acc_trade_volume')),
            prev_closing_price=safe_float(data.get('prev_closing_price')),
            change_price=safe_float(data.get('change_price')),
            change_rate=safe_float(data.get('change_rate'))
        )

    def get_utc_datetime(self) -> datetime:
        """UTC 시간을 datetime 객체로 반환"""
        return datetime.fromisoformat(self.candle_date_time_utc.replace('Z', '+00:00'))
    
    def get_kst_datetime(self) -> datetime:
        """KST 시간을 datetime 객체로 반환"""
        return datetime.fromisoformat(self.candle_date_time_kst.replace('Z', '+00:00'))

@dataclass
class WeeklyCandleStick:
    market: str
    candle_date_time_utc: str
    candle_date_time_kst: str
    opening_price: float
    high_price: float
    low_price: float
    trade_price: float
    timestamp: int
    candle_acc_trade_price: float
    candle_acc_trade_volume: float
    first_day_of_period: str
    
    @classmethod
    def from_dict(cls, data: dict) -> 'WeeklyCandleStick':
        return cls(
            market=data.get('market', ''),
            candle_date_time_utc=data.get('candle_date_time_utc', ''),
            candle_date_time_kst=data.get('candle_date_time_kst', ''),
            opening_price=safe_float(data.get('opening_price')),
            high_price=safe_float(data.get('high_price')),
            low_price=safe_float(data.get('low_price')),
            trade_price=safe_float(data.get('trade_price')),
            timestamp=safe_int(data.get('timestamp')),
            candle_acc_trade_price=safe_float(data.get('candle_acc_trade_price')),
            candle_acc_trade_volume=safe_float(data.get('candle_acc_trade_volume')),
            first_day_of_period=data.get('first_day_of_period', '')
        )

    def get_utc_datetime(self) -> datetime:
        """UTC 시간을 datetime 객체로 반환"""
        return datetime.fromisoformat(self.candle_date_time_utc.replace('Z', '+00:00'))
    
    def get_kst_datetime(self) -> datetime:
        """KST 시간을 datetime 객체로 반환"""
        return datetime.fromisoformat(self.candle_date_time_kst.replace('Z', '+00:00'))
    
    def get_first_day_datetime(self) -> datetime:
        """주 시작일을 datetime 객체로 반환"""
        return datetime.fromisoformat(self.first_day_of_period)