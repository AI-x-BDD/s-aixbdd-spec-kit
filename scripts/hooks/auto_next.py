#!/usr/bin/env python3
"""Stop hook：自動模式的 next 開關打開時，把回覆結尾的「下一步提示詞」交給 Herdr 開新對話。

開關關閉（預設）時立刻結束，不做任何事。
開關：scripts/auto-mode.sh on next／off next。狀態檔：.auto/mode。紀錄：.auto/next.log。

動作（只在 HERDR_ENV=1 的 pane 內）：
  1. 讀這一輪最後的回覆，找「下一步提示詞（複製下方整個區塊）：」後面、位於回覆最後的程式碼區塊。
  2. 找不到，或剩餘步數為 0，就結束。
  3. 找到時，在背景執行：herdr tab create → herdr agent start（claude）→ herdr agent prompt。
     新對話沿用本對話的模型與權限模式；.auto/mode 有指定 model、effort 時用指定的值。
  4. 下一步送出成功後，關掉上一步的分頁（只關標籤以 auto- 開頭的分頁）。

只使用 Python 標準函式庫。不修改專案檔案；只寫 .auto/ 下的狀態檔、紀錄與暫存提示詞。
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
AUTO_DIR = ROOT / ".auto"
STATE = AUTO_DIR / "mode"
LOG = AUTO_DIR / "next.log"
MARK = "下一步提示詞（複製下方整個區塊）："
BLOCK_RE = re.compile(r"\s*(`{3,})[^\n]*\n(.*?)\n\1\s*$", re.S)


def read_state() -> dict[str, str]:
    state: dict[str, str] = {}
    if STATE.is_file():
        for line in STATE.read_text(encoding="utf-8").splitlines():
            if "=" in line:
                key, value = line.split("=", 1)
                state[key] = value
    return state


def write_state(state: dict[str, str]) -> None:
    AUTO_DIR.mkdir(exist_ok=True)
    STATE.write_text("".join(f"{k}={v}\n" for k, v in state.items() if v != ""), encoding="utf-8")


def log(message: str) -> None:
    AUTO_DIR.mkdir(exist_ok=True)
    with LOG.open("a", encoding="utf-8") as fh:
        fh.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} {message}\n")


def extract_prompt(text: str) -> str | None:
    index = text.rfind(MARK)
    if index < 0:
        return None
    match = BLOCK_RE.match(text[index + len(MARK):])
    if not match:
        return None
    prompt = match.group(2).strip()
    return prompt or None


def last_reply(transcript: str | None) -> tuple[str, str]:
    """Return (text of the assistant turn after the last real user prompt, model)."""
    if not transcript or not Path(transcript).is_file():
        return "", ""
    texts: list[str] = []
    model = ""
    with open(transcript, encoding="utf-8") as fh:
        for line in fh:
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if entry.get("isSidechain"):
                continue
            message = entry.get("message") or {}
            content = message.get("content")
            if entry.get("type") == "user":
                is_tool_result = isinstance(content, list) and any(
                    isinstance(b, dict) and b.get("type") == "tool_result" for b in content
                )
                if not is_tool_result:
                    texts = []
            elif entry.get("type") == "assistant":
                model = message.get("model") or model
                if isinstance(content, list):
                    texts.extend(
                        b.get("text", "") for b in content if isinstance(b, dict) and b.get("type") == "text"
                    )
                elif isinstance(content, str):
                    texts.append(content)
    return "\n".join(texts), model


def herdr(*args: str, timeout: int = 90) -> subprocess.CompletedProcess:
    return subprocess.run(["herdr", *args], capture_output=True, text=True, timeout=timeout)


def launch(job_file: str) -> int:
    job = json.loads(Path(job_file).read_text(encoding="utf-8"))
    prompt = Path(job["prompt_file"]).read_text(encoding="utf-8")
    name = job["name"]
    created = herdr(
        "tab", "create", "--workspace", job["workspace"], "--cwd", job["cwd"], "--label", name, "--no-focus"
    )
    if created.returncode != 0:
        log(f"[{name}] tab create 失敗：{created.stderr.strip() or created.stdout.strip()}")
        return 1
    try:
        root = json.loads(created.stdout)["result"]["root_pane"]
        pane = root["pane_id"] if isinstance(root, dict) else root
    except (json.JSONDecodeError, KeyError, TypeError):
        log(f"[{name}] 讀不到新分頁的 pane：{created.stdout.strip()[:300]}")
        return 1
    started = None
    for _ in range(5):
        started = herdr(
            "agent", "start", name, "--kind", "claude", "--pane", pane, "--timeout", "60000", "--", *job["agent_args"]
        )
        if started.returncode == 0:
            break
        time.sleep(1.5)
    if started is None or started.returncode != 0:
        detail = (started.stderr.strip() or started.stdout.strip()) if started else ""
        log(f"[{name}] agent start 失敗（pane {pane}）：{detail[:300]}")
        return 1
    sent = herdr("agent", "prompt", name, prompt)
    if sent.returncode != 0:
        log(f"[{name}] agent prompt 失敗：{(sent.stderr.strip() or sent.stdout.strip())[:300]}")
        return 1
    log(f"[{name}] 已在 pane {pane} 送出下一步提示詞（{len(prompt)} 字）")
    for leftover in (job["prompt_file"], job_file):
        Path(leftover).unlink(missing_ok=True)
    close_previous_tab(name, job.get("previous_tab", ""))
    return 0


def close_previous_tab(name: str, tab_id: str) -> None:
    """下一步已成功送出後，關掉上一步的分頁。只關自動模式開的分頁（標籤以 auto- 開頭），不關使用者自己開的分頁。"""
    if not tab_id:
        return
    got = herdr("tab", "get", tab_id)
    try:
        label = json.loads(got.stdout)["result"]["tab"]["label"]
    except (json.JSONDecodeError, KeyError, TypeError):
        return
    if not str(label).startswith("auto-"):
        return
    closed = herdr("tab", "close", tab_id)
    if closed.returncode == 0:
        log(f"[{name}] 已關閉上一步的分頁 {tab_id}（{label}）")
    else:
        log(f"[{name}] 關閉上一步的分頁 {tab_id} 失敗：{(closed.stderr.strip() or closed.stdout.strip())[:200]}")


def main() -> int:
    if len(sys.argv) == 3 and sys.argv[1] == "--launch":
        return launch(sys.argv[2])

    state = read_state()
    if state.get("next") != "on":
        return 0
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        data = {}
    if os.environ.get("HERDR_ENV") != "1":
        log("next 已開啟，但不在 Herdr 的 pane 內，沒有動作")
        return 0

    text = data.get("last_assistant_message") or ""
    prompt = extract_prompt(text) if text else None
    model = ""
    transcript = data.get("transcript_path")
    for _ in range(6):
        reply, model = last_reply(transcript)
        if prompt is None:
            prompt = extract_prompt(reply)
        if prompt is not None or text:
            break
        time.sleep(0.5)
    if prompt is None:
        log("回覆結尾沒有下一步提示詞，自動接續停止")
        return 0

    session = data.get("session_id", "")
    key = hashlib.sha256(f"{session}\n{prompt}".encode()).hexdigest()[:16]
    if state.get("last_key") == key:
        return 0
    try:
        steps = int(state.get("steps_left", "0") or 0)
    except ValueError:
        steps = 0
    if steps <= 0:
        log("回覆有下一步提示詞，但剩餘步數為 0，沒有接續；要繼續請重新執行 scripts/auto-mode.sh on next")
        return 0

    AUTO_DIR.mkdir(exist_ok=True)
    name = f"auto-{time.strftime('%H%M%S')}"
    prompt_file = AUTO_DIR / f"{name}.prompt.txt"
    prompt_file.write_text(prompt, encoding="utf-8")
    agent_args: list[str] = []
    chosen_model = state.get("model") or model
    if chosen_model and not chosen_model.startswith("<"):
        agent_args += ["--model", chosen_model]
    if state.get("effort"):
        agent_args += ["--effort", state["effort"]]
    mode = data.get("permission_mode")
    if mode and mode != "default":
        agent_args += ["--permission-mode", mode]
    job = {
        "name": name,
        "prompt_file": str(prompt_file),
        "workspace": os.environ.get("HERDR_WORKSPACE_ID", ""),
        # 一律在專案根目錄啟動：從子目錄啟動時不會載入 .claude/settings.json 的 hook，自動接續會斷掉。
        "cwd": str(ROOT),
        "agent_args": agent_args,
        "previous_tab": os.environ.get("HERDR_TAB_ID", ""),
    }
    job_file = AUTO_DIR / f"{name}.job.json"
    job_file.write_text(json.dumps(job, ensure_ascii=False), encoding="utf-8")

    state["steps_left"] = str(steps - 1)
    state["last_key"] = key
    write_state(state)
    log(f"[{name}] 接續下一步（剩餘 {steps - 1} 步，參數 {' '.join(agent_args) or '無'}）")

    with LOG.open("a", encoding="utf-8") as fh:
        subprocess.Popen(
            [sys.executable, str(Path(__file__).resolve()), "--launch", str(job_file)],
            stdin=subprocess.DEVNULL,
            stdout=fh,
            stderr=fh,
            start_new_session=True,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
