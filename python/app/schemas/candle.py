from dataclasses import dataclass
from datetime import datetime

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
            opening_price=float(data.get('opening_price', 0)),
            high_price=float(data.get('high_price', 0)),
            low_price=float(data.get('low_price', 0)),
            trade_price=float(data.get('trade_price', 0)),
            timestamp=int(data.get('timestamp', 0)),
            candle_acc_trade_price=float(data.get('candle_acc_trade_price', 0)),
            candle_acc_trade_volume=float(data.get('candle_acc_trade_volume', 0)),
            unit=int(data.get('unit', 1))
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
            opening_price=float(data.get('opening_price', 0)),
            high_price=float(data.get('high_price', 0)),
            low_price=float(data.get('low_price', 0)),
            trade_price=float(data.get('trade_price', 0)),
            timestamp=int(data.get('timestamp', 0)),
            candle_acc_trade_price=float(data.get('candle_acc_trade_price', 0)),
            candle_acc_trade_volume=float(data.get('candle_acc_trade_volume', 0)),
            prev_closing_price=float(data.get('prev_closing_price', 0)),
            change_price=float(data.get('change_price', 0)),
            change_rate=float(data.get('change_rate', 0))
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
            opening_price=float(data.get('opening_price', 0)),
            high_price=float(data.get('high_price', 0)),
            low_price=float(data.get('low_price', 0)),
            trade_price=float(data.get('trade_price', 0)),
            timestamp=int(data.get('timestamp', 0)),
            candle_acc_trade_price=float(data.get('candle_acc_trade_price', 0)),
            candle_acc_trade_volume=float(data.get('candle_acc_trade_volume', 0)),
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