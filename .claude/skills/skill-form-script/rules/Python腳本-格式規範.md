# Rule 1 - 執行邏輯必須保留在單檔 Python 腳本

- 目標 Skill 的腳本必須是 `scripts/` 目錄中的單一 `.py` 檔案。
- 腳本必須能依自身的第三方依賴宣告執行，不得依賴另一個未宣告的本地 Python 專案。

## Good Example

- 索引腳本的執行邏輯與依賴宣告都在同一檔案。

```text
my-skill/
  SKILL.md
  scripts/
    build_index.py
```

## Bad Example

- 同一個索引腳本依賴未宣告的本地套件，無法單獨執行。

```text
my-skill/
  SKILL.md
  scripts/
    build_index.py
    local_helpers.py  # build_index.py 必須匯入此檔才能啟動
```

# Rule 2 - Python 版本與依賴必須使用 PEP 723 宣告

- 腳本必須包含一個 `# /// script` 區塊，並在區塊內宣告符合實際程式需求的 `requires-python` 與 `dependencies`。
- 沒有第三方依賴時，`dependencies` 必須寫為 `[]`。
- 第三方依賴必須使用有效的 Python 套件版本規格；腳本執行期間不得自行呼叫 `pip install`。

## Good Example

- 同一個使用 `rich` 的腳本在檔首完整宣告執行需求。

```python
# /// script
# requires-python = ">=3.11"
# dependencies = ["rich>=13,<15"]
# ///

from rich import print
```

## Bad Example

- 同一個腳本缺少依賴宣告，改在執行期間安裝套件。

```python
import subprocess

subprocess.run(["python", "-m", "pip", "install", "rich"], check=True)
from rich import print
```

# Rule 3 - 命令列介面必須明確處理路徑

- 腳本必須以 `argparse` 宣告必要的輸入與輸出參數，使 `--help` 可列出使用方式。
- 檔案路徑必須使用 `pathlib.Path` 處理；腳本不得將資料檔案固定寫成特定平台的路徑字串。

## Good Example

- 索引腳本從參數取得檔案路徑，並使用 `Path`。

```python
from argparse import ArgumentParser
from pathlib import Path

parser = ArgumentParser()
parser.add_argument("--input", type=Path, required=True)
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
source = args.input
destination = args.output
```

## Bad Example

- 同一個腳本將輸入與輸出固定為 Windows 路徑，無法從 SOP 傳入。

```python
source = "C:\\data\\records.csv"
destination = "C:\\data\\index.json"
```

# Rule 4 - 成功與失敗狀態必須可由執行者檢查

- 成功時，腳本必須產生已約定的輸出，並以狀態碼零結束。
- 輸入無效或處理失敗時，腳本必須以非零狀態碼結束，並在標準錯誤輸出指出失敗原因。

## Good Example

- 索引腳本成功產生檔案；來源不存在時回報原因與非零狀態碼。

```text
$ uv run --script scripts/build_index.py --input records.csv --output index.json
exit status: 0
index.json: 已產生

$ uv run --script scripts/build_index.py --input missing.csv --output index.json
stderr: missing.csv: file not found
exit status: 1
```

## Bad Example

- 同一個腳本在來源不存在時沒有產生索引，卻仍回報成功。

```text
$ uv run --script scripts/build_index.py --input missing.csv --output index.json
stdout: failed
exit status: 0
index.json: 未產生
```

# Rule 5 - 腳本與依賴必須符合目標平台

- 腳本必須使用 Python 可跨平台使用的路徑與檔案操作方式，不得把特定 shell 命令當成必要執行步驟。
- 使用第三方套件時，必須確認套件可在目標 macOS、Windows 與 Linux 環境中安裝；無法支援的平台必須在腳本設計時明示。

## Good Example

- 索引腳本直接以 Python API 建立輸出目錄，且依賴可在三種目標平台安裝。

```python
from pathlib import Path

output = Path("index.json")
output.parent.mkdir(parents=True, exist_ok=True)
```

## Bad Example

- 同一個腳本以 Unix shell 命令建立輸出目錄，Windows 執行環境無法保證支援。

```python
import subprocess

subprocess.run(["mkdir", "-p", "output"], check=True)
```

# Rule 6 - Lockfile 只用於需要固定依賴解析的腳本

- 未要求固定第三方套件解析結果時，應只維護腳本內的 PEP 723 宣告。
- 已確認需要固定解析結果時，可以使用 `uv lock --script` 建立與腳本相鄰的 `.py.lock` 檔案。

## Good Example

- 一般索引腳本只維護內嵌依賴宣告，沒有額外的依賴檔案。

```text
scripts/
  build_index.py
```

## Bad Example

- 同一個沒有固定解析要求的腳本額外建立多種依賴檔案，增加維護工作。

```text
scripts/
  build_index.py
  build_index.py.lock
  requirements-build-index.txt
  pyproject.toml
```
