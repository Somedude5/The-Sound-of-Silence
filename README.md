

# The Sound of Silence
**Transform Foundry VTT's playlists into a professional sound design studio**

[![Release](https://img.shields.io/github/v/release/Somedude5/The-Sound-of-Silence)](https://github.com/Somedude5/The-Sound-of-Silence/releases/latest) 
[![Downloads](https://img.shields.io/github/downloads/Somedude5/The-Sound-of-Silence/total)](https://github.com/Somedude5/The-Sound-of-Silence/releases) 
![Downloads@latest](https://img.shields.io/github/downloads/Somedude5/The-Sound-of-Silence/latest/total)
[![Foundry VTT](https://img.shields.io/badge/Foundry-v13-informational)](https://foundryvtt.com)
[![GitHub Repo stars](https://img.shields.io/github/stars/Somedude5/The-Sound-of-Silence?style=social)](https://github.com/Somedude5/The-Sound-of-Silence)

> Professional audio engineering for your tabletop RPG. Create complex musical narratives with seamless loops, cinematic crossfades, and dynamic silence—without touching a single audio file.

---

## Quick Start

**Get started in 30 seconds:**

1. **Install** from Foundry's Add-on Modules browser (search "Sound of Silence")
2. **Open any playlist** → Click the toggle buttons in the header (🎵 🔀 🔁)
3. **Configure** individual sounds with the orange loop icon or playlist settings

## Why The Sound of Silence?

| Feature | Demo Video | What You'll See |
|---------|------------|-----------------|
| **Silence Gaps** | [▶️ 1 min](https://www.youtube.com/watch?v=geR8R4xoO3M) | Add natural pauses between tracks, static or random |
| **Crossfading** | [▶️ 1 min](https://www.youtube.com/watch?v=Q0TLxQKOUdw) | Seamless transitions without harsh cuts |
| **Internal Loops** | [▶️ 2 min](https://youtu.be/sQircI4j2LE) | Create intro → loop → outro structures, True Crossfade! |

---

## What This Module Adds

### 🎬 **Cinema-Quality Audio**
- **Equal-power crossfades** — The same technology used in professional DAWs like Logic Pro and Ableton
- **Exponential fade curves** — Perceptually linear fading that sounds natural to human hearing (no more abrupt volume jumps!)
- **Glitch-free transitions** — Dual-buffer architecture ensures seamless playback without audio pops or stutters

### 🎮 **Game Audio Features**
- **Multi-segment sequencer** — Design complex tracks: Intro → Loop A → Loop B → Outro, each with configurable repeat counts
- **Dynamic silence gaps** — Add breathing room between tracks with static or randomized durations
- **Skip-to-loop** — Jump directly to your loop point for instant atmosphere building

### ⚡ **Zero Workflow Disruption**
- **One-click toggles** — Enable features directly from playlist headers, no digging through menus
- **Real-time sync** — All crossfades, loops, and transitions perfectly synchronized across GM and players
- **Works with existing files** — No need to pre-edit your audio, configure everything in Foundry

### 🛠️ **Professional Engineering**
- Built on Web Audio API for sample-accurate timing
- Audio-thread scheduling eliminates main-thread performance issues
- Automatic memory management prevents leaks during long sessions

---

<details>
<summary>📸 <strong>UI Screenshots</strong></summary>

### Playlist Header Controls
<img width="271" alt="Toggle buttons for silence, crossfade, and loop" src="https://github.com/user-attachments/assets/f8f895d2-091a-4128-9531-539f7a7becdc" />

### Playlist Configuration
<img width="281" alt="Extended playlist settings" src="https://github.com/user-attachments/assets/005a5e91-faa2-470c-a287-a1ed4a362fb5" />

### Sound Configuration
<img width="281" alt="Internal loop settings with multi-segment editor" src="https://github.com/user-attachments/assets/e4a19528-e0fe-4cda-be3e-9164515ae9f4" />

</details>

---

## 💡 Perfect For

**Combat Encounters**  
Design dynamic battle music: *Tension intro* → *combat loop* → *victory fanfare*

**Any Music Track**  
Ever find music you love but with annoying parts? Create segment loops to play only the sections you enjoy.

**Taverns & Social Hubs**  
Layer ambient loops: *Base ambience* → *crowd chatter* → *bardic performance*

**Exploration & Dungeons**  
Create evolving atmospheres that never feel repetitive with randomized silence and multi-segment loops

**Boss Battles**  
Build multi-phase soundscapes: *Phase 1 theme* → *Enraged phase 2* → *Defeat/victory*

**Narrative Moments**  
Fade between emotional beats with professional crossfades

---

## 📦 Feature Overview

### 🔁 **Advanced Looping**

#### Internal Loop-Within-Sound
Create professional game audio structures:
- Define **start and end timestamps** for seamless loop segments
- Set **loop counts** (play 3 times, then continue) or loop infinitely
- Configure **crossfade duration** between loop iterations (default: 1000ms)
- **Multi-segment support:** Chain multiple loop regions in a single track
- Uses **equal-power crossfades** to avoid jarring loop transitions
- **Preview your segments** and fades between audio loops quickly and easily with a built-in audio previewer and **seek bar**

#### Skip Intro Feature
- Start playback directly at your first loop segment
- Perfect for ambient tracks where you want instant atmosphere
- Applies configurable fade-in at the loop point

#### Flexible Segment Behavior
- **Skip to Next:** Jump to the next segment after completing loops
- **Play Through:** Let audio continue naturally after the loop
- **Graceful Retirement:** Automatically fades out at track end when loops complete

---

### 🎧 **Dynamic Playback**

#### Configurable Silence Gaps
- Insert pauses between tracks to simulate natural music flow
- **Static mode:** Fixed duration (e.g., always 5 seconds)
- **Random mode:** Randomize within a range (e.g., 3-10 seconds)
- Perfect for preventing listener fatigue

#### Automatic Crossfading
- Seamlessly blend between tracks using equal-power crossfades
- Respects your playlist's fade duration settings or use your own
- Works with manual skips and automatic progression
- Synchronized perfectly across all connected clients

#### Intelligent Fade-In
- Smoothly ramps up volume when tracks start as part of a logarithmic fade.
- Configurable per-playlist
- Uses exponential curves for natural-sounding volume changes

---

### 🗂️ **Playlist Management**

- **Loop Entire Playlist** — Automatically restart in Sequential, Shuffle, or Simultaneous modes
- **Volume Normalization** — Set a target volume for all tracks with per-sound overrides
- **GM Authority System** — Prevents conflicts when multiple GMs are online
- **Mode Coordination** — Smart behavior: Crossfade mode automatically overrides Silence mode

---

### 🖥️ **Integrated UI**

#### Playlist Header Toggles
-  **Enable Silence** — Quick toggle for gap injection
-  **Auto-Crossfade** — One-click seamless transitions
-  **Loop Entire Playlist** — Shows as green underline + shuffle icon when active

#### Per-Sound Controls
- 🟠 **Orange circle icon** — Toggle internal looping without opening config
- 🎵 **Active loop indicator** — Visual feedback when a sound is looping

#### Configuration Dialogs
- **Playlist Config:** Fade-in, silence settings, crossfade toggle, volume normalization
- **Sound Config:** Multi-segment loop editor with visual timeline, crossfade settings, intro skip option

---

## 📥 Installation

### Method 1: From Foundry VTT (Recommended)
1. In Foundry, go to **Add-on Modules** → **Install Module**
2. Search for **"The Sound of Silence"**
3. Click **Install**

### Method 2: Manual Installation
1. Copy this manifest URL:
   ```
   https://github.com/Somedude5/The-Sound-of-Silence/releases/latest/download/module.json
   ```
2. In Foundry, go to **Add-on Modules** → **Install Module**
3. Paste the URL in the **Manifest URL** field
4. Click **Install**

### Requirements
- **Foundry VTT v13+**
- **[lib-wrapper module](https://github.com/ruipin/fvtt-lib-wrapper)**

---

## 🎯 Usage Guide

### Basic Setup

1. **Configure Playlist Settings**
   - Right-click playlist → **Configure**
   - Set **Fade-In Duration** (global for all sounds in this playlist)
   - Choose **Silence Mode** (static or random) and duration
   - Enable **Loop Entire Playlist** if desired
  
2. **You can turn these On or Off at will**
   - Open the **Playlist Directory**
   - Click the toggle buttons in any playlist header:
     - 🤫 = Silence Gaps
     - 🔀 = Auto-Crossfade
     - 🔁 = Loop Playlist

3. **Set Up Internal Loops** (Optional)
   - Right-click any sound → **Configure**
   - Enable **Internal Looping**
   - Add segments with start/end times
   - Set crossfade duration and loop counts

### Advanced: Multi-Segment Loops

**Example: Boss Battle Music**
```
Segment 1: 00:00 - 01:30 (Intro, loop 1x, skip to next)
Segment 2: 01:30 - 03:00 (Phase 1, loop infinitely)
Segment 3: 03:00 - 04:45 (Phase 2, loop infinitely) 
Segment 4: 04:45 - 06:00 (Victory, loop 1x, play through)
```

**How it works:**
1. Track plays intro once
2. Automatically jumps to Phase 1 loop
3. Manually break loop when boss enters Phase 2 by clicking the white icon in the UI
4. Track jumps to Phase 2 loop
5. Break loop again when boss defeated → victory music plays once → track ends

---

## 🔒 Important Notes

### Feature Interactions
- ⚠️ **Crossfade and Silence are mutually exclusive** — Enabling crossfade automatically disables silence (by design for clean transitions)
- ⚠️ **Pause disabled during crossfades** — Prevents audio glitches during internal loop transitions (technical limitation)

### Performance Considerations
- **Memory efficient:** Module uses dual-buffer architecture — only 2 sound instances loaded regardless of segment count
- **Long audio files (15+ minutes):** May cause 1-2 second delays during initial loop setup due to audio decoding
  - The module reuses buffers efficiently, so subsequent loops are instant
  - Consider using shorter files or Opus/OGG format for faster decoding
- **WeakMap state storage:** Automatically garbage collected, prevents memory leaks during long sessions
- **Audio-thread scheduling:** All fades run on Foundry's dedicated audio context, zero main-thread impact

---

## 🌟 Community

- **⭐ Star this repo** if you find it useful!

- **🐛 [Report Bugs](https://github.com/Somedude5/The-Sound-of-Silence/issues)** — Help improve the module with detailed reproduction steps
- **💡 [Request Features](https://github.com/Somedude5/The-Sound-of-Silence/issues)** — Shape the roadmap with your ideas, If its within the scope of the module and relatively easy to create there is high chance Ill do it!

---

## 🔧 Compatibility

### Tested & Compatible With:
- ✅ **Monk's Enhanced Audio** — Fully compatible
- ✅ **Playlist Enhancements** — Works seamlessly
- ✅ **All game systems** — System-agnostic design
- ✅ **Foundry VTT v13+** — Native compatibility

### Known Conflicts:
- None reported! If you find a compatibility issue, please [open an issue](https://github.com/Somedude5/The-Sound-of-Silence/issues).

---

## ⚠️ Known Issues

Currently tracking [open issues on GitHub](https://github.com/Somedude5/The-Sound-of-Silence/issues):

**Active Issues:**
- Pausing during fade-in may restart the fade from the beginning
- Sounds may occasionally fail to fade out properly when stopped, particularly when stopped during an active fade

---

## 🗺️ Roadmap

### 🎯 Next Release (v3.0)
- [ ] Advanced shuffle patterns, weighted random, round-robin with memory
- [ ] Change over repository to new dev account
- [ ] Ability to Play Loop Segments in any Order, so go from segment one from 1:00-1:45 to a segment at 00:20-00:40
- [ ] Redesigned Audio Player Menu, More UI buttons specific to Loop Segments like skipping/Breaking Loops



### 🔮 Future Considerations
- [ ] Cross-playlist crossfading, fade from Exploration → Combat playlists
- [ ] Intro → Playlist linking, play intro track, then auto-switch to looping playlist
- [ ] Preset system (save/load/share loop configurations)
- [ ] Playlist automation triggers (conditions: "on combat start", "on scene change")
- [ ] API expansion for macro/module integration
- [ ] Building out the Performance profiler and diagnostics dashboard more

---

## 🏗️ For Developers

### Architecture Highlights
This module implements professional game audio patterns:

- **Web Audio API** for sample-accurate timing
- **Dual-buffer crossfading** system (soundA/soundB architecture)
- **WeakMap-based state management** for automatic garbage collection
- **Audio-thread scheduling** via AudioContext.currentTime
- **Exponential curves** for perceptually-linear volume changes
- **Equal-power crossfades** (sin²θ + cos²θ = 1 for constant perceived power)

### Public API

The module exposes a public API for advanced users:

```javascript
// Access via game.modules.get("the-sound-of-silence").api

// Inspect current state
const state = game.modules.get("the-sound-of-silence").api.inspectAll();
console.log(state); // Shows active loopers, crossfades, silence gaps

// Open diagnostics window
game.modules.get("the-sound-of-silence").api.openDiagnostics();

// Get performance metrics
const metrics = game.modules.get("the-sound-of-silence").api.getMetrics();
console.log(metrics.crossfades.total); // Total crossfades since module load
```

---

## 🤝 Support Development

This module represents **hundreds of hours** of research, development, testing, and refinement. It implements professional audio engineering techniques that are typically only found in commercial game engines.

### Ways You Can Help:
- ⭐ **Star this repository** if you find it useful
- 🐛 **Report bugs** with detailed reproduction steps
- 📝 **Share your use cases** in GitHub Discussions or on reddit
- 🎥 **Create tutorial videos** or write guides

---

## 📜 License

© 2025 **GnollStack** (formerly Somedude5)

This module is licensed under a **custom non-commercial license**.  
✅ Free for personal use • ✅ Modifications allowed • ❌ Commercial use requires permission

For commercial licensing inquiries, contact me directly on Discord or Reddit.  
📧 [Open an issue](https://github.com/Somedude5/The-Sound-of-Silence/issues)

---

## 🙏 Credits

**Created by:** GnollStack (Somedude5)
**Special Thanks to:** The Foundry VTT community, early testers, and everyone who provided feedback

**Inspired by:** The many awesome free modules folks have built over the years like MIDI-QOL or FXMaster and years of frustration with basic playlist systems 😄

---

<div align="center">

[⬆ Back to Top](#the-sound-of-silence)

</div>
