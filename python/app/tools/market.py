from httpx import AsyncClient
from mcp.server.fastmcp import FastMCP
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

# from app.main import mcp
from app.schemas.candle import MinuteCandleStick, DailyCandleStick, WeeklyCandleStick
from app.schemas.ticker import Ticker

async def get_current_ticker() -> Ticker:
    """
    Get the current ticker of Bitcoin in KRW from Upbit API.
    """
    async with AsyncClient() as client:
        response = await client.get("https://api.upbit.com/v1/ticker?markets=KRW-BTC")
        data = response.json()
        if data and len(data) > 0:
            return Ticker.from_dict(data[0])
        raise ValueError("Bitcoin 티커 정보를 가져올 수 없습니다")

async def get_candles_for_minutes(minutes: int = 30, count: int = 10) -> List[MinuteCandleStick]:
    """
    Get a list of minute candlesticks for Bitcoin in KRW from Upbit API.
    This function fetches the candlestick data for the specified minute interval and count.
    
    Args:
        minutes: 캔들 단위(분) (1, 3, 5, 15, 10, 30, 60, 240)
        count: 가져올 캔들 개수 (최대 200)
        
    Returns:
        캔들스틱 데이터 리스트
    """
    async with AsyncClient() as client:
        url = f"https://api.upbit.com/v1/candles/minutes/{minutes}"
        params = {
            "market": "KRW-BTC",
            "count": min(count, 200)  # 최대 200개까지 가능
        }
        
        response = await client.get(url, params=params)
        data = response.json()
        
        return [MinuteCandleStick.from_dict(item) for item in data]

async def get_candles_for_daily(count: int = 10) -> List[DailyCandleStick]:
    """
    Get a list of daily candlesticks for Bitcoin in KRW from Upbit API.
    Get daily candlestick data until today.
    
    Args:
        count: 가져올 캔들 개수 (최대 200)
        
    Returns:
        캔들스틱 데이터 리스트
    """
    async with AsyncClient() as client:
        url = f"https://api.upbit.com/v1/candles/days"
        params = {
            "market": "KRW-BTC",
            "count": min(count, 200)  # 최대 200개까지 가능
        }
        
        response = await client.get(url, params=params)
        data = response.json()
        
        return [DailyCandleStick.from_dict(item) for item in data]

async def get_candles_for_weekly(count: int = 10) -> List[WeeklyCandleStick]:
    """
    Get a list of weekly candlesticks for Bitcoin in KRW from Upbit API.
    Get weekly candlestick data until today.
    
    Args:
        count: 가져올 캔들 개수 (최대 200)
        
    Returns:
        캔들스틱 데이터 리스트
    """
    async with AsyncClient() as client:
        url = f"https://api.upbit.com/v1/candles/weeks"
        params = {
            "market": "KRW-BTC",
            "count": min(count, 200)  # 최대 200개까지 가능
        }
        
        response = await client.get(url, params=params)
        data = response.json()
        
        return [WeeklyCandleStick.from_dict(item) for item in data]

def set_tools(mcp: FastMCP):
    """
    Set tools for FastMCP.
    
    Args:
        mcp: FastMCP instance
    """
    mcp.add_tool(get_current_ticker, "get_current_ticker")
    mcp.add_tool(get_candles_for_daily, "get_candles_for_daily")
    mcp.add_tool(get_candles_for_weekly, "get_candles_for_weekly")
    mcp.add_tool(get_candles_for_minutes, "get_candles_for_minutes")