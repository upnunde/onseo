# Cursor 환경 동기화 가이드 (복사·붙여넣기용)

다른 PC에서 이 환경을 그대로 쓰려면 아래를 순서대로 적용하세요. **macOS** 기준이며, Windows 경로는 [§7](#7-windows용-경로)을 참고합니다.

---

## 1. 사전 설치 – Node, Bun, pnpm, Zsh

### macOS (Homebrew)

```bash
# Homebrew가 없다면
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Apple Silicon: 터미널에 brew PATH가 없으면 (~/.zprofile 등에 추가)
# eval "$(/opt/homebrew/bin/brew shellenv)"

# Node.js (LTS 권장)
brew install node

# Bun (TalkToFigma MCP의 bunx 사용)
curl -fsSL https://bun.sh/install | bash

# npm 전역 패키지 경로 (pnpm 등)
mkdir -p "$HOME/.npm-global"
npm config set prefix "$HOME/.npm-global"

# pnpm
npm install -g pnpm
```

### Zsh

macOS는 **Zsh가 기본 셸**입니다. 확인: `echo $SHELL` → 보통 `/bin/zsh`.

---

## 2. 셸 설정 (~/.zshrc) – Bun, npm-global PATH

아래를 `~/.zshrc`에 넣고 `source ~/.zshrc`로 반영합니다.

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
export PATH="$HOME/.npm-global/bin:$PATH"
```

> **자동 적용:** [§8](#8-한-번에-적용-스크립트-macos)의 스크립트는 위 블록을 **중복 없이** 마커로 감싸 추가합니다.

---

## 3. Cursor settings.json – 패널 위치, 에디터 미리보기 등

**경로 (macOS):** `~/Library/Application Support/Cursor/User/settings.json`

```json
{
  "window.commandCenter": true,
  "workbench.editor.enablePreview": false,
  "explorer.confirmDelete": false,
  "workbench.panel.defaultLocation": "right",
  "workbench.panel.opensMaximized": false
}
```

| 항목 | 의미 |
|------|------|
| `workbench.editor.enablePreview` | `false`면 탭을 한 번에 하나만 “미리보기”로 열지 않음(고정 탭 동작에 가깝게) |
| `workbench.panel.defaultLocation` | 터미널 등 패널 기본 위치 (`"right"` / `"bottom"`) |
| `workbench.panel.opensMaximized` | 패널을 최대화해 열지 여부 |

기존 설정이 있으면 **객체를 합쳐서** 넣으세요. 워크스페이스 전용은 `.vscode/settings.json`입니다.

---

## 4. Cursor keybindings.json – Cmd+I 에이전트, Alt+Cmd+S 사이드바

**경로 (macOS):** `~/Library/Application Support/Cursor/User/keybindings.json`

```json
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
```

Cursor 버전에 따라 명령 ID가 바뀔 수 있습니다. **Keyboard Shortcuts**에서 `Agent` / `Sidebar`로 검색해 충돌을 확인하세요.

---

## 5. MCP 설정 – TalkToFigma, Figma MCP

**경로:** `~/.cursor/mcp.json`

```json
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
```

- **TalkToFigma:** `bun`/`bunx`가 PATH에 있어야 합니다 ([§2](#2-셸-설정-zshrc--bun-npm-global-path)).
- **Figma (원격 MCP):** Cursor에서 MCP 목록의 **Authenticate / 로그인** 흐름으로 OAuth를 마치면, 클라이언트가 토큰을 처리하는 경우가 많습니다. `headers`는 비어 있어도 되고, 도구/버전에 따라 수동으로 Bearer를 넣는 예도 있습니다. [Figma MCP 원격 서버 문서](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)를 참고하세요.

---

## 6. 경로 참고 – Node, npm, pnpm, Python

아래는 **예시**입니다. 실제 값은 터미널에서 확인하세요.

```bash
which node npm pnpm bun python3
node -v && npm -v && pnpm -v 2>/dev/null; bun -v 2>/dev/null; python3 --version
npm config get prefix
```

| 항목 | 흔한 위치 (참고) |
|------|------------------|
| Node / npm | Homebrew: `/opt/homebrew/bin/node`, `/usr/local/bin/node` 등 |
| pnpm | `npm prefix`가 `~/.npm-global`이면 `~/.npm-global/bin/pnpm` |
| Bun | `~/.bun/bin/bun` |
| Python | macOS 시스템: `/usr/bin/python3`, pyenv/Homebrew 등은 별도 경로 |

---

## 7. Windows용 경로

| 항목 | 경로 |
|------|------|
| **settings.json** | `%APPDATA%\Cursor\User\settings.json` |
| **keybindings.json** | `%APPDATA%\Cursor\User\keybindings.json` |
| **mcp.json** | `%USERPROFILE%\.cursor\mcp.json` |
| **전역 npm 바이너리** | `npm config get prefix` 출력 아래의 `bin` (예: `%APPDATA%\npm`) |
| **셸** | PowerShell 프로필: `$PROFILE` / Git Bash: `~/.bashrc` 등 — `.zshrc`는 WSL/macOS용 |

`%APPDATA%`는 보통 `C:\Users\<사용자명>\AppData\Roaming`입니다.

---

## 8. 한 번에 적용 스크립트 (macOS)

프로젝트에 포함된 스크립트는 **기존 JSON을 덮어쓰지 않고 병합**하고, 변경 전 파일을 **바탕화면의 타임스탬프 폴더**에 백업합니다.

```bash
chmod +x ./apply-cursor-macos.sh
./apply-cursor-macos.sh
```

수동으로 전부 덮어쓰는 예전 한 덩어리 스크립트가 필요하면 Git 이력이나 이 문서의 JSON 블록을 그대로 쓰면 됩니다.

---

## 9. Skills / Plugins / 확장 프로그램 (선택)

### Skills · Plugins 폴더 복사

완전 동기화를 원하면 아래 폴더를 **통째로** 새 PC의 같은 위치(`~/.cursor/…`)로 복사하면 됩니다.

| 복사할 폴더 | 용도 |
|-------------|------|
| `~/.cursor/skills-cursor` | Cursor Skills (사용자·캐시된 스킬 등) |
| `~/.cursor/plugins` | 플러그인 관련 파일 |

> Windows에서는 `skills-cursor`·`plugins`를 `%USERPROFILE%\.cursor\` 아래에 두면 됩니다.

### 확장 프로그램 (Extensions)

Skills/Plugins 폴더만으로는 **VS Code/Cursor 확장**이 모두 따라오지 않을 수 있습니다.

- **수동:** **Cmd+Shift+X**(Windows/Linux: **Ctrl+Shift+X**)로 확장 뷰를 연 뒤, 필요한 항목을 검색해 **Install**합니다.
- **동기화:** Cursor 설정에서 **Settings Sync**(또는 계정 동기화)를 켜면 확장 목록·설정·키바인딩 등을 클라우드로 맞출 수 있습니다. (메뉴 버전에 따라 **Settings** → **Turn on Settings Sync** 등으로 표시됩니다.)

---

*갱신: 2026-03-20*
