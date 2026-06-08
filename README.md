# paint-off 🎨

A multiplayer graffiti drawing game for two strangers. Built with p5.js + MediaPipe.

---

## Setup (first time only)

**1. Install proxy dependencies**
```bash
cd paint-off
npm install express dotenv
```

**2. Add your Anthropic API key**

Create a `.env` file in the project root:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Get a key at https://console.anthropic.com. Never commit this file,  it's already in `.gitignore`. I TEXTED YALL THE API KEY LOL

---

## Running the project

You need **two terminals running at the same time** — one for the game, one for the Claude proxy.

**Terminal 1 — Game server**
```bash
cd paint-off
python3 -m http.server 5500
```
Then open `http://localhost:5500` in Chrome.

OR 
```bash
npx serve 
```
if you have node installed


**Alternative game server — VS Code Live Server**
Install the "Live Server" extension by Ritwick Dey, right-click `index.html` → "Open with Live Server". Still need Terminal 2 for the proxy.

> The browser will ask for camera permission on load — allow it for MediaPipe to work. Use Chrome — Web Bluetooth and Web Speech API are not supported in Firefox or Safari.

---



**Terminal 2 — Claude API proxy**
```bash
cd paint-off
node proxy.js
```
You should see: `Proxy running at http://localhost:3001`

> Both must be running for AI prompt generation to work. If only the game server is running, rounds 2 and 3 will still work (hardcoded prompts) but round 1 AI generation will fail.



## Keyboard shortcuts (DEV mode)

DEV mode is always on while `window.DEV_MODE = true` in `sketch.js`.

### Screen jumping
| Key | Goes to |
|-----|---------|
| `q` | START/Attract screen |
| `w` | Color setup |
| `e` | Prompt input |
| `r` | Drawing (also starts the round timer) |
| `t` | Voting |
| `y` | End screen |

### Start/Attract screen
| Key | Action |
|-----|--------|
| `1` | Simulate P1 spraying their can |
| `2` | Simulate P2 spraying their can |

### Color setup screen
| Key | Action |
|-----|--------|
| `z` | P1 shake (cycle color) |
| `x` | P1 confirm color |
| `c` | P2 shake (cycle color) |
| `v` | P2 confirm color |

### Prompt input screen
| Key | Action |
|-----|--------|
| `a` | Simulate P1 saying "cloud" |
| `s` | Simulate P2 saying "raccoon" → triggers AI generation |

### Drawing screen
| Key | Action |
|-----|--------|
| `Space` | Start the round timer |
| `Enter` | Skip timer, end round immediately |

### Voting screen
| Key | Action |
|-----|--------|
| `Space` | Advance state (showcase → vote P1 → vote P2 → winner) |
| `1` | Manually declare P1 winner |
| `2` | Manually declare P2 winner |

### End screen
| Key | Action |
|-----|--------|
| `Space` | Restart — resets all state and goes back to attract |

---

## File structure

```
paint-off/
│
├── index.html              # Entry point. Loads all scripts in order. Add new screens here.
├── constants.js            # Tunable values: timers, palette colors, spray settings
├── state.js                # Single global gameState object + helper functions (goToScreen, nextRound, etc.)
├── sketch.js               # p5.js entry point. Runs the state machine. Keep this file small.
├── proxy.js                # Local Express server — forwards Claude API calls, handles CORS + API key
├── .env                    # Your Anthropic API key — never commit this
├── .gitignore              # Ignores .env and node_modules
│
├── assets/
│   ├── gray-spray-can.svg  # Idle can (both players before pressing)
│   ├── red-spray-can.svg   # P1 can (after pressing)
│   └── blue-spray-can.svg  # P2 can (after pressing)
│
├── screens/                # One file per game screen. Each owns its own draw_ function.
│   ├── attract.js          # Start/idle screen. Waits for both players to spray.
│   ├── colorSetup.js       # Players shake to pick color, spray to confirm.
│   ├── promptInput.js      # Round 1: players speak words → AI generates prompt.
│   │                       # Rounds 2-3: picks randomly from hardcoded prompt list.
│   ├── drawing.js          # Split canvas drawing round. MediaPipe tracks hands.
│   ├── voting.js           # Shows all drawings, audience votes by raising hands.
│   └── endScreen.js        # Loneliness stat + call to action + restart.
│
├── controllers/            # Hardware + CV inputs. Each exposes a clean interface.
│   ├── mediapipe.js        # Webcam + hand tracking. Exposes window.handData.
│   │                       # Isaac owns this file.
│   ├── bluetooth.js        # ESP32 spray can inputs. Exposes spray state + shake events.
│   │                       # Amber owns this file.
│   └── speechInput.js      # Web Speech API. startListening(onResult) / stopListening().
│
├── drawing/                # Drawing engine (used by drawing.js)
│   ├── canvas.js           # Offscreen canvas management
│   └── spray.js            # Spray particle rendering
│
└── api/
    └── promptGen.js        # Claude API call for round 1. Hardcoded prompts for rounds 2-3.
```

---

## Game flow

```
ATTRACT → COLOR_SETUP → PROMPT_INPUT → DRAWING → (repeat x3) → VOTING → END → ATTRACT
```

| Screen | What happens |
|--------|-------------|
| Attract | Both players spray their can to start |
| Color setup | Shake can to cycle color, spray to lock in |
| Prompt input | Round 1: P1 + P2 speak a word → AI combines them via Claude. Rounds 2-3: random hardcoded prompt |
| Drawing | 60s split canvas, MediaPipe tracks index finger, open hand = paint, fist = reposition |
| Voting | All drawings shown, audience raises hands, MediaPipe counts (max 4), advance with button |
| End | Loneliness stat, call to action, press to restart |

---

## Who owns what

| Person | Files |
|--------|-------|
| **Hawa** | All `screens/` files, `sketch.js` |
| **Isaac** | `controllers/mediapipe.js` |
| **Amber** | `controllers/bluetooth.js`, spray can hardware |

---

## Tuning constants

Everything tunable lives in `constants.js`:

```js
DRAW_TIME: 60        // seconds per drawing round
TOTAL_ROUNDS: 3      // number of drawing rounds
PALETTE: [...]       // 8 colors players can pick from
SPRAY_RADIUS: 30     // spray spread size
SPRAY_DENSITY: 40    // particles per frame
```

---

## Integration checklist (for showcase week)

- [ ] Amber: `bluetooth.js` — call `attractCanPressed('p1'/'p2')`, `colorSetupShake`, `colorSetupPress`, `votingAdvance()` from can button events
- [ ] Isaac: `mediapipe.js` — confirm `window.handData` updates every frame with `{ landmarks, player, id }`
- [ ] Test MediaPipe under actual atrium lighting (bright = harder to detect)
- [ ] Test Web Speech API with actual microphone + arcade button trigger
- [ ] Calibrate spray can shake threshold so normal holding doesn't trigger color change
- [ ] Run on display machine, confirm both `localhost:5500` and `localhost:3001` are running before guests arrive
