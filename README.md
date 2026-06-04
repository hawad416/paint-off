# paint-off 🎨

A multiplayer graffiti drawing game for two strangers. Built with p5.js + MediaPipe.

---

## Running the project

You need a local server — opening `index.html` directly in the browser won't work because MediaPipe, Web Speech API, and SVG loading all require a server context.

**Option A — Python (recommended, no install)**
```bash
cd paint-off
python3 -m http.server 5500
```
Then open `http://localhost:5500`

**Option B — VS Code Live Server**
Install the "Live Server" extension by Ritwick Dey, then right-click `index.html` → "Open with Live Server"

**Option C — Node**
```bash
npx serve .
```

> The browser will ask for camera permission on load — allow it for MediaPipe to work.

---

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
│   │                       # Rounds 2-3: auto-generates prompt with loading animation.
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
    └── promptGen.js        # Claude API calls. generateRound1Prompt(w1, w2) and generateAutoPrompt().
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
| Prompt input | Round 1: P1 + P2 speak a word → AI combines them. Rounds 2-3: auto-generated |
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
- [ ] Run on display machine, confirm `localhost:5500` works without internet (MediaPipe models cache after first load)
