#!/usr/bin/env bash
# macOS에서 Cursor 사용자 설정·MCP·zsh PATH를 한 번에 적용합니다.
# 기존 파일은 덮어쓰지 않고 JSON은 병합하고, 백업 폴더에 사본을 둡니다.
set -euo pipefail

BACKUP_DIR="${HOME}/Desktop/cursor-setup-backup-$(date +%Y%m%d-%H%M%S)"
CURSOR_USER="${HOME}/Library/Application Support/Cursor/User"
CURSOR_DIR="${HOME}/.cursor"
MARKER_BEGIN="# >>> CURSOR_ENV_SYNC (apply-cursor-macos.sh)"
MARKER_END="# <<< CURSOR_ENV_SYNC"

mkdir -p "${BACKUP_DIR}" "${CURSOR_USER}" "${CURSOR_DIR}"

backup_if_exists() {
  local f="$1"
  if [[ -f "$f" ]]; then
    mkdir -p "${BACKUP_DIR}/$(dirname "${f#$HOME/}")"
    cp -a "$f" "${BACKUP_DIR}/${f#$HOME/}"
    echo "백업: $f -> ${BACKUP_DIR}/${f#$HOME/}"
  fi
}

SETTINGS_PATCH=$(cat <<'JSON'
{
  "window.commandCenter": true,
  "workbench.editor.enablePreview": false,
  "explorer.confirmDelete": false,
  "workbench.panel.defaultLocation": "right",
  "workbench.panel.opensMaximized": false
}
JSON
)

KEYBINDINGS_PATCH=$(cat <<'JSON'
[
  {
    "key": "cmd+i",
    "command": "composerMode.agent"
  },
  {
    "key": "alt+cmd+s",
    "command": "workbench.action.toggleUnifiedSidebarFromKeyboard",
    "when": "cursor.agentIdeUnification.enabled == true && !isAuxiliaryWindowFocusedContext"
  }
]
JSON
)

MCP_PATCH=$(cat <<'JSON'
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bunx",
      "args": ["cursor-talk-to-figma-mcp@latest"]
    },
    "Figma": {
      "url": "https://mcp.figma.com/mcp",
      "headers": {}
    }
  }
}
JSON
)

merge_json_objects() {
  local base_file="$1"
  local patch_json="$2"
  python3 - "$base_file" "$patch_json" <<'PY'
import json, sys, pathlib

path, patch_s = sys.argv[1], sys.argv[2]
patch = json.loads(patch_s)
p = pathlib.Path(path)
base = {}
if p.exists():
    try:
        base = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print("JSON 오류:", path, e, file=sys.stderr)
        sys.exit(1)
if not isinstance(base, dict):
    print("병합 대상이 객체가 아닙니다:", path, file=sys.stderr)
    sys.exit(1)
base.update(patch)
p.write_text(json.dumps(base, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
PY
}

merge_keybindings() {
  local base_file="$1"
  local patch_json="$2"
  python3 - "$base_file" "$patch_json" <<'PY'
import json, sys, pathlib

path, patch_s = sys.argv[1], sys.argv[2]
new_items = json.loads(patch_s)
if not isinstance(new_items, list):
    sys.exit("keybindings 패치는 배열이어야 합니다")
p = pathlib.Path(path)
existing = []
if p.exists():
    try:
        existing = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print("JSON 오류:", path, e, file=sys.stderr)
        sys.exit(1)
if not isinstance(existing, list):
    existing = []

def sig(item):
    return (item.get("key"), item.get("command"), item.get("when"))

existing_sigs = {sig(x) for x in existing}
for item in new_items:
    if sig(item) not in existing_sigs:
        existing.append(item)
        existing_sigs.add(sig(item))
p.write_text(json.dumps(existing, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
PY
}

merge_mcp_json() {
  local base_file="$1"
  local patch_json="$2"
  python3 - "$base_file" "$patch_json" <<'PY'
import json, sys, pathlib

path, patch_s = sys.argv[1], sys.argv[2]
patch = json.loads(patch_s)
p = pathlib.Path(path)
base = {}
if p.exists():
    try:
        base = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print("JSON 오류:", path, e, file=sys.stderr)
        sys.exit(1)
servers = base.get("mcpServers")
if servers is None:
    servers = {}
if not isinstance(servers, dict):
    print("mcpServers가 객체가 아닙니다", file=sys.stderr)
    sys.exit(1)
patch_servers = patch.get("mcpServers", {})
for k, v in patch_servers.items():
    servers[k] = v
base["mcpServers"] = servers
p.write_text(json.dumps(base, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
PY
}

append_zshrc_block() {
  local zshrc="${HOME}/.zshrc"
  backup_if_exists "${zshrc}"
  if [[ -f "${zshrc}" ]] && grep -qF "${MARKER_BEGIN}" "${zshrc}"; then
    echo ".zshrc에 동기화 블록이 이미 있습니다. 건너뜁니다."
    return 0
  fi
  {
    echo ""
    echo "${MARKER_BEGIN}"
    echo 'export BUN_INSTALL="$HOME/.bun"'
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"'
    echo 'export PATH="$HOME/.npm-global/bin:$PATH"'
    echo "${MARKER_END}"
  } >> "${zshrc}"
  echo ".zshrc에 PATH 블록을 추가했습니다."
}

# --- 실행 ---
echo "백업 폴더: ${BACKUP_DIR}"

backup_if_exists "${CURSOR_USER}/settings.json"
merge_json_objects "${CURSOR_USER}/settings.json" "${SETTINGS_PATCH}"

backup_if_exists "${CURSOR_USER}/keybindings.json"
merge_keybindings "${CURSOR_USER}/keybindings.json" "${KEYBINDINGS_PATCH}"

backup_if_exists "${CURSOR_DIR}/mcp.json"
merge_mcp_json "${CURSOR_DIR}/mcp.json" "${MCP_PATCH}"

append_zshrc_block

echo ""
echo "완료. Cursor를 완전히 종료한 뒤 다시 실행하세요."
echo "TalkToFigma는 bun/bunx가 필요합니다: curl -fsSL https://bun.sh/install | bash"
echo "npm 전역 바이너리: mkdir -p ~/.npm-global && npm config set prefix ~/.npm-global"
