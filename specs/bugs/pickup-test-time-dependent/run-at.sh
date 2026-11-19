#!/usr/bin/env bash
# 在指定的模擬時刻執行命令。
# 用法：run-at.sh <應用程式目錄> <HH:MM|real> <命令...>
# 例：run-at.sh apps/equipment-loan 08:00 npx playwright test e2e/equipment-loan.spec.ts
# 用 real 時不平移時鐘，直接執行命令。
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "用法：run-at.sh <應用程式目錄> <HH:MM|real> <命令...>" >&2
  exit 2
fi

app_dir=$1
sim_time=$2
shift 2

script_dir=$(cd "$(dirname "$0")" && pwd)
cd "$app_dir"

if [ "$sim_time" != "real" ]; then
  export SIM_TAIPEI_TIME=$sim_time
  export SIM_ANCHOR_MS=$(( $(date +%s) * 1000 ))
  export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--import file://$script_dir/sim-clock.mjs"
fi

echo "[run-at] app=$(pwd) time=$sim_time cmd=$*"
exec "$@"
