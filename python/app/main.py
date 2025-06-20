import asyncio
import os
from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv

from app.tools.market import set_tools as set_upbit_tools
from app.tools.analyze import set_tools as set_analyze_tools, analyze_blockchain_mareket

# load .env file
load_dotenv()

mcp = FastMCP("Bit scope", stateless_http=True)
set_upbit_tools(mcp)
set_analyze_tools(mcp)

if __name__ == "__main__":
    asyncio.run(analyze_blockchain_mareket(market_code="KRW-ETH"))
    # mode = os.getenv("MODE", "stdio")

    # if mode == "stdio":
    #     mcp.run(transport="stdio")
    # else:
    #     mcp.run(transport="streamable-http")