import os
import httpx
import asyncio
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
key = os.getenv("GEMINI_API_KEY")
print(f"Key found: {bool(key)}")
if key:
    print(f"Key prefix: {key[:15]}...")

async def test():
    if not key:
        print("No key set")
        return
    r = await httpx.AsyncClient().post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}",
        json={"contents": [{"parts": [{"text": "Say hello in 5 words"}]}]},
        timeout=15
    )
    print(f"Status: {r.status_code}")
    print(r.text[:500])

asyncio.run(test())
