# The Sound of Silence
[![Release](https://img.shields.io/github/v/release/Somedude5/The-Sound-of-Silence)](https://github.com/Somedude5/The-Sound-of-Silence/releases/latest) [![Downloads@latest](https://img.shields.io/github/downloads/Somedude5/The-Sound-of-Silence/latest/total)](https://github.com/Somedude5/The-Sound-of-Silence/releases/latest) [![Total Downloads](https://img.shields.io/github/downloads/Somedude5/The-Sound-of-Silence/total)](https://github.com/Somedude5/The-Sound-of-Silence/releases)

The **Sound of Silence** is a system-agnostic Foundry VTT module that overhauls how playlisted music plays, fades, and loops in your games.  
It adds cinematic audio transitions, realistic silence gaps, internal sound looping, and fully synchronized crossfades—without forcing you to manually babysit your playlists.

## Features

### 🎧 Smooth, Dynamic Playback
- **Per-playlist silence gaps** — insert configurable pauses between sounds to simulate natural music breaks. Supports:
  - Static silence (fixed length)
  - Random silence within a range
  - [![Watch the demo!](images/demo-thumbnail.png)](https://www.youtube.com/watch?v=geR8R4xoO3M)
- **Per-playlist automatic crossfade** — seamlessly fades between sounds based on the configured fade-out duration.
  - [![Watch the demo!](images/demo-thumbnail.png)](https://www.youtube.com/watch?v=Q0TLxQKOUdw)
- **Global fade-in for sound starts** — gently ramps up volume for a polished, professional feel.

### 🎚 Professional Audio Fades
- **Logarithmic fade curves** — all fade-ins and fade-outs use a logarithmic volume scale, mimicking professional audio mixing techniques.
- Avoids the abrupt volume jumps common with linear fades.
- Produces a smoother, more natural-sounding transition across all fade events — including playlist skips, auto-crossfades, and internal loops.

### 🔁 Advanced Looping
- **Internal Loop-Within-Sound** — choose a section of a sound (by start and end times) and loop it seamlessly with a crossfade between loops.
- Option to play an intro once before entering the loop.
- Fully synchronized across all players and GM.
- [![Watch the demo!](images/demo-thumbnail.png)](https://youtu.be/sQircI4j2LE)

### 🗂 Playlist & Sound Control
- Loop entire playlist in Sequential, Shuffle, or Simultaneous modes.
- GM-synchronized playback control — all fades, skips, and stops replicate to connected clients for perfect timing.
- Crossfade on manual skip — skip to the next sound without harsh cuts.
- Pause/resume awareness — loop timers pause correctly on sound pause and resume without desync.

### 🖥 Integrated UI
- **New toggle buttons** added directly to each playlist header:
  - Enable Silence
  - Auto-Crossfade
  - Enable a actively looping sound
  - Additionally if Loop Entire Playlist is set, an extra blue shuffle icon will be visible on currently plays and the playlist will be underlined with a green misty effect
    
    <img width="271" height="115" alt="playlist loop and internal loop" src="https://github.com/user-attachments/assets/f8f895d2-091a-4128-9531-539f7a7becdc" />

- **Extended Playlist Config**:
  - Fade-in duration
  - Silence mode & duration settings
  - Crossfade toggle
  - Loop Entire Playlist toggle
    
    <img width="281" height="357" alt="playlist UI" src="https://github.com/user-attachments/assets/005a5e91-faa2-470c-a287-a1ed4a362fb5" />

- **Extended Sound Config**:
  - Enable/disable Internal Loop
  - Start/end times
  - Crossfade duration between loops
    
    <img width="281" height="446" alt="Sound Config UI" src="https://github.com/user-attachments/assets/e4a19528-e0fe-4cda-be3e-9164515ae9f4" />

### 🔌 Compatibility
- Works with any game system.
- Compatible with most playlist/audio enhancement modules such as Monk’s Enhanced Audio and Playlist Enchantment.
- Foundry VTT v13+ ready (v2.0.0+), with limited legacy v12 support in older releases (v1.0.0)

## 📥 Installation

### From Foundry VTT
1. Open **Add-on Modules** → **Install Module**.
2. Search for *The Sound of Silence* or paste the Manifest URL.

### Manual
- Paste the Manifest URL into Foundry's Install Module dialog.

## Usage
1. Open the Playlist Directory.
2. Use the toggle buttons in each playlist header to enable:
   - Silent Gaps between sounds
   - Auto-Crossfade
   - Actively Loop a sound
     - If **Loop Entire Playlist** is enabled, a blue shuffle icon appears on currently playing tracks and the playlist header is underlined with a green misty effect.
3. Open **Playlist Config** to adjust:
   - Fade-in duration
   - Silence length or random delay range
   - Crossfade on/off
   - Loop Entire Playlist
4. Open **Sound Config** to:
   - Enable Internal Looping for individual sounds
   - Toggle internal loop mode via an orange circle icon (without opening the config UI)
   - Choose to loop from your chosen timestamps or play from the beginning before entering the loop
   - Set the crossfade duration for the loop (default: 1000 ms for fade-in/fade-out)

⚠ **Notes:** 
- You can enable either Auto-Crossfade or Enable Silence at one time (mutually exclusive by design).
- Due to technical constraints, the pause button is disabled between internal looping sounds while a fade-in/out is active to prevent double playback.

## Planned Features
- Crossfade between different playlists.
- Allow sounds to be set as intros and then connected to other playlists (e.g., play *Hard-Combat-Intro* from an Intro playlist, which then automatically switches to the *Hard-Combat* playlist when finished).
- More advanced shuffle/cycle patterns.
- UI refinements and code optimization.
- Fix edge-case bugs with pausing, skipping, and stopping playback.
  
 **Better user feedback** via the [GitHub Issues](https://github.com/Somedude5/The-Sound-of-Silence/issues) page.

## Known Issues
- Pausing during a fade-in may restart the fade from the beginning.
- In v1.x (Foundry v12 builds) long playlist names may push toggle buttons out of view.  
  Also, features like playlist looping and true internal sound looping are not functional in that version.
- Sounds may occasionally fail to fade out properly when stopped for the GM or player clients.

## 📜 License
© 2025 Somedude5.  
Free for personal, non-commercial use.  
Modification, redistribution, or commercial use requires written permission.

For questions, bug reports, or feature requests:  
[GitHub Issues](https://github.com/Somedude5/The-Sound-of-Silence/issues)
