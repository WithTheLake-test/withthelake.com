#!/bin/bash
set -o pipefail
cd -- "$(dirname "$0")" || exit 1
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin:/usr/sbin"

ready() {
  curl --noproxy '*' -fsS --max-time 3 "$1/assets/logo/with-the-lake.png" 2>/dev/null |
    cmp -s - public/assets/logo/with-the-lake.png &&
    curl --noproxy '*' -fs --max-time 15 "$1/" -o /dev/null
}

available_port=""
for port in {3000..3009}; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    url="http://127.0.0.1:$port"
    if ready "$url"; then
      echo "실행 중인 위드더레이크 홈페이지를 엽니다. $url"
      open "$url/"
      exit $?
    fi
  elif [[ -z "$available_port" ]]; then
    available_port="$port"
  fi
done

if [[ -z "$available_port" ]]; then
  echo "포트 3000~3009가 모두 사용 중입니다." >&2
  exit 1
fi
if [[ ! -x node_modules/.bin/next ]] || ! command -v node >/dev/null; then
  echo "Node.js와 프로젝트 의존성이 필요합니다. README.md의 설치 방법을 확인해 주세요." >&2
  exit 1
fi

url="http://127.0.0.1:$available_port"
echo "위드더레이크 개발 서버를 시작합니다. $url"
echo "브라우저가 열리면 이 창을 그대로 두세요. 종료하려면 Control+C를 누르세요."
(
  for ((i=0; i<60; i++)); do
    if ready "$url"; then
      open "$url/"
      exit
    fi
    sleep 1
  done
  echo "브라우저에서 $url/ 주소를 열어 확인해 주세요." >&2
) &
watcher=$!
trap 'kill "$watcher" 2>/dev/null || true' EXIT
node_modules/.bin/next dev --webpack --hostname 127.0.0.1 --port "$available_port"
