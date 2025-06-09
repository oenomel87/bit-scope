# Bit Scope MCP Server

Bit Scope MCP 서버는 [Model Context Protocol](https://github.com/microsoft/modelcontext) 기반의 서버로, 업비트 API를 통해 비트코인 가격 정보와 다양한 시간대별 캔들스틱 데이터를 제공합니다.

## 개요

이 서버는 다음과 같은 기능을 제공합니다:
- 현재 비트코인 가격 정보 조회
- 일별 비트코인 캔들스틱 데이터 조회
- 주별 비트코인 캔들스틱 데이터 조회
- 분 단위 비트코인 캔들스틱 데이터 조회

## 설치 방법

### 필수 요구사항
- Python 3.13 이상
- [uv](https://github.com/astral-sh/uv) 패키지 매니저 (권장)

### 설치 단계

1. 저장소 클론
```bash
git clone https://github.com/oenomel87/bit-scope.git
cd bit-scope/python
```

2. 의존성 설치
```bash
uv pip install -e .
```

## 실행 방법

환경 변수를 설정하여 서버의 실행 모드를 지정할 수 있습니다. 기본 모드는 `stdio`입니다.

### 표준 입출력 모드 (stdio)
```bash
python -m app.main
```

### HTTP 서버 모드
```bash
MODE=http python -m app.main
```

## API 기능

### 1. 현재 비트코인 가격 정보 조회

```python
get_current_ticker() -> Ticker
```

현재 비트코인(KRW-BTC)의 가격 정보를 조회합니다. 반환되는 `Ticker` 객체는 다음과 같은 정보를 포함합니다:
- 시장 정보 (market)
- 거래 시간 정보 (UTC/KST)
- 현재가 (trade_price)
- 시가, 고가, 저가 (opening_price, high_price, low_price)
- 전일 종가 (prev_closing_price)
- 가격 변동 정보 (change, change_price, change_rate)
- 거래량 정보 (trade_volume, acc_trade_volume)
- 52주 최고/최저가 정보

### 2. 일별 캔들스틱 데이터 조회

```python
get_candles_for_daily(count: int = 10) -> List[DailyCandleStick]
```

최근 일별 비트코인 캔들스틱 데이터를 조회합니다.

- **매개변수**:
  - `count`: 조회할 캔들 개수 (최대 200개, 기본값 10)

### 3. 주별 캔들스틱 데이터 조회

```python
get_candles_for_weekly(count: int = 10) -> List[WeeklyCandleStick]
```

최근 주별 비트코인 캔들스틱 데이터를 조회합니다.

- **매개변수**:
  - `count`: 조회할 캔들 개수 (최대 200개, 기본값 10)

### 4. 분 단위 캔들스틱 데이터 조회

```python
get_candles_for_minutes(minutes: int = 30, count: int = 10) -> List[MinuteCandleStick]
```

분 단위 비트코인 캔들스틱 데이터를 조회합니다.

- **매개변수**:
  - `minutes`: 캔들 단위(분) (1, 3, 5, 10, 15, 30, 60, 240 중 선택, 기본값 30)
  - `count`: 조회할 캔들 개수 (최대 200개, 기본값 10)

## 데이터 구조

### Ticker

비트코인의 현재 가격 정보를 나타내는 데이터 클래스입니다.

```python
@dataclass
class Ticker:
    market: str               # 시장 코드
    trade_price: float        # 현재가
    opening_price: float      # 시가
    high_price: float         # 고가
    low_price: float          # 저가
    prev_closing_price: float # 전일 종가
    change: str               # 변화 상태 (RISE, FALL, EVEN)
    change_price: float       # 변화액
    change_rate: float        # 변화율
    # ... 기타 속성 ...
```

### MinuteCandleStick

분 단위 캔들스틱 데이터를 나타내는 데이터 클래스입니다.

```python
@dataclass
class MinuteCandleStick:
    market: str               # 시장 코드
    candle_date_time_utc: str # UTC 기준 시간
    candle_date_time_kst: str # KST 기준 시간
    opening_price: float      # 시가
    high_price: float         # 고가
    low_price: float          # 저가
    trade_price: float        # 종가
    timestamp: int            # 타임스탬프
    unit: int                 # 분 단위
    # ... 기타 속성 ...
```

### DailyCandleStick

일별 캔들스틱 데이터를 나타내는 데이터 클래스입니다.

```python
@dataclass
class DailyCandleStick:
    market: str               # 시장 코드
    candle_date_time_utc: str # UTC 기준 시간
    candle_date_time_kst: str # KST 기준 시간
    opening_price: float      # 시가
    high_price: float         # 고가
    low_price: float          # 저가
    trade_price: float        # 종가
    timestamp: int            # 타임스탬프
    prev_closing_price: float # 전일 종가
    change_price: float       # 변화액
    change_rate: float        # 변화율
    # ... 기타 속성 ...
```

### WeeklyCandleStick

주별 캔들스틱 데이터를 나타내는 데이터 클래스입니다.

```python
@dataclass
class WeeklyCandleStick:
    market: str               # 시장 코드
    candle_date_time_utc: str # UTC 기준 시간
    candle_date_time_kst: str # KST 기준 시간
    opening_price: float      # 시가
    high_price: float         # 고가
    low_price: float          # 저가
    trade_price: float        # 종가
    timestamp: int            # 타임스탬프
    first_day_of_period: str  # 주의 첫 날
    # ... 기타 속성 ...
```

## MCP 서버 활용 방법

Model Context Protocol(MCP)은 모델이 외부 도구나 데이터에 접근할 수 있도록 하는 표준 프로토콜입니다. Bit Scope MCP 서버는 이 프로토콜을 통해 업비트 API 기능을 제공합니다.
