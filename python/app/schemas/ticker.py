from dataclasses import dataclass
from datetime import datetime
from typing import Literal

@dataclass
class Ticker:
    market: str
    trade_date: str
    trade_time: str
    trade_date_kst: str
    trade_time_kst: str
    trade_timestamp: int
    opening_price: float
    high_price: float
    low_price: float
    trade_price: float
    prev_closing_price: float
    change: Literal["RISE", "FALL", "EVEN"]
    change_price: float
    change_rate: float
    signed_change_price: float
    signed_change_rate: float
    trade_volume: float
    acc_trade_price: float
    acc_trade_price_24h: float
    acc_trade_volume: float
    acc_trade_volume_24h: float
    highest_52_week_price: float
    highest_52_week_date: str
    lowest_52_week_price: float
    lowest_52_week_date: str
    timestamp: int
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Ticker':
        """딕셔너리에서 Ticker 객체 생성"""
        return cls(
            market=data.get('market', ''),
            trade_date=data.get('trade_date', ''),
            trade_time=data.get('trade_time', ''),
            trade_date_kst=data.get('trade_date_kst', ''),
            trade_time_kst=data.get('trade_time_kst', ''),
            trade_timestamp=int(data.get('trade_timestamp', 0)),
            opening_price=float(data.get('opening_price', 0)),
            high_price=float(data.get('high_price', 0)),
            low_price=float(data.get('low_price', 0)),
            trade_price=float(data.get('trade_price', 0)),
            prev_closing_price=float(data.get('prev_closing_price', 0)),
            change=data.get('change', 'EVEN'),
            change_price=float(data.get('change_price', 0)),
            change_rate=float(data.get('change_rate', 0)),
            signed_change_price=float(data.get('signed_change_price', 0)),
            signed_change_rate=float(data.get('signed_change_rate', 0)),
            trade_volume=float(data.get('trade_volume', 0)),
            acc_trade_price=float(data.get('acc_trade_price', 0)),
            acc_trade_price_24h=float(data.get('acc_trade_price_24h', 0)),
            acc_trade_volume=float(data.get('acc_trade_volume', 0)),
            acc_trade_volume_24h=float(data.get('acc_trade_volume_24h', 0)),
            highest_52_week_price=float(data.get('highest_52_week_price', 0)),
            highest_52_week_date=data.get('highest_52_week_date', ''),
            lowest_52_week_price=float(data.get('lowest_52_week_price', 0)),
            lowest_52_week_date=data.get('lowest_52_week_date', ''),
            timestamp=int(data.get('timestamp', 0))
        )
    
    def get_trade_datetime(self) -> datetime:
        """거래 시간을 datetime 객체로 반환"""
        date_str = f"{self.trade_date[:4]}-{self.trade_date[4:6]}-{self.trade_date[6:8]}"
        time_str = f"{self.trade_time[:2]}:{self.trade_time[2:4]}:{self.trade_time[4:6]}"
        return datetime.fromisoformat(f"{date_str}T{time_str}")
    
    def get_trade_datetime_kst(self) -> datetime:
        """한국 시간 거래 시간을 datetime 객체로 반환"""
        date_str = f"{self.trade_date_kst[:4]}-{self.trade_date_kst[4:6]}-{self.trade_date_kst[6:8]}"
        time_str = f"{self.trade_time_kst[:2]}:{self.trade_time_kst[2:4]}:{self.trade_time_kst[4:6]}"
        return datetime.fromisoformat(f"{date_str}T{time_str}+09:00")
    
    def get_highest_52_week_date(self) -> datetime:
        """52주 최고가 날짜를 datetime 객체로 반환"""
        return datetime.fromisoformat(self.highest_52_week_date)
    
    def get_lowest_52_week_date(self) -> datetime:
        """52주 최저가 날짜를 datetime 객체로 반환"""
        return datetime.fromisoformat(self.lowest_52_week_date)
