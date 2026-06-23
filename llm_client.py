"""
llm_client.py — Centralised NVIDIA NIM client.

All modules that need LLM calls import from here.
This means if the model or API changes, you update ONE file.

Supports:
  - Sync calls  (for jd_parser)
  - Async calls (for explainer / outreach batch generation)
  - Retry logic with exponential backoff
  - Token usage logging
"""

import asyncio
import time
from typing import List, Dict, Optional

from openai import OpenAI, AsyncOpenAI
from config import NVIDIA_API_KEY, NVIDIA_BASE_URL, NVIDIA_MODEL

# ── Shared clients (initialised once) ─────────────────────────────────────────
_sync_client  = OpenAI(base_url=NVIDIA_BASE_URL, api_key=NVIDIA_API_KEY)
_async_client = AsyncOpenAI(base_url=NVIDIA_BASE_URL, api_key=NVIDIA_API_KEY)


# ── Sync call ──────────────────────────────────────────────────────────────────
def chat(
    messages:    List[Dict[str, str]],
    temperature: float = 0.2,
    max_tokens:  int   = 1000,
    retries:     int   = 3,
) -> str:
    """
    Synchronous LLM call with retry logic.

    Args:
        messages:    OpenAI-format message list [{"role": ..., "content": ...}]
        temperature: 0.1 for structured output, 0.4-0.7 for creative text
        max_tokens:  cap on response length
        retries:     number of retry attempts on failure

    Returns:
        Response text as string
    """
    last_err = None
    for attempt in range(retries):
        try:
            response = _sync_client.chat.completions.create(
                model=NVIDIA_MODEL,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            text = response.choices[0].message.content.strip()
            _log_usage(response, sync=True)
            return text

        except Exception as e:
            last_err = e
            wait = 2 ** attempt   # exponential backoff: 1s, 2s, 4s
            print(f"[LLM] Attempt {attempt+1}/{retries} failed: {e}. Retrying in {wait}s…")
            time.sleep(wait)

    print(f"[LLM] All {retries} attempts failed. Last error: {last_err}")
    return ""


# ── Async call ─────────────────────────────────────────────────────────────────
async def achat(
    messages:    List[Dict[str, str]],
    temperature: float = 0.2,
    max_tokens:  int   = 1000,
    retries:     int   = 3,
) -> str:
    """
    Async LLM call with retry logic.
    Use this inside async functions (explainer, outreach batch).
    """
    last_err = None
    for attempt in range(retries):
        try:
            response = await _async_client.chat.completions.create(
                model=NVIDIA_MODEL,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            text = response.choices[0].message.content.strip()
            _log_usage(response, sync=False)
            return text

        except Exception as e:
            last_err = e
            wait = 2 ** attempt
            print(f"[LLM-async] Attempt {attempt+1}/{retries} failed: {e}. Retrying in {wait}s…")
            await asyncio.sleep(wait)

    print(f"[LLM-async] All {retries} attempts failed. Last: {last_err}")
    return ""


# ── Convenience builders ───────────────────────────────────────────────────────
def system_user(system: str, user: str) -> List[Dict[str, str]]:
    """Build standard [system, user] message list."""
    return [
        {"role": "system", "content": system},
        {"role": "user",   "content": user},
    ]


# ── Token usage logger ─────────────────────────────────────────────────────────
_total_prompt_tokens:     int = 0
_total_completion_tokens: int = 0

def _log_usage(response, sync: bool = True):
    global _total_prompt_tokens, _total_completion_tokens
    try:
        usage = response.usage
        if usage:
            _total_prompt_tokens     += usage.prompt_tokens
            _total_completion_tokens += usage.completion_tokens
    except Exception:
        pass


def get_token_usage() -> Dict[str, int]:
    """Return cumulative token usage for this server session."""
    return {
        "prompt_tokens":     _total_prompt_tokens,
        "completion_tokens": _total_completion_tokens,
        "total_tokens":      _total_prompt_tokens + _total_completion_tokens,
    }
