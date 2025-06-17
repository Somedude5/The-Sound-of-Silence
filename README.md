# Sound of Silence

**Sound of Silence** is a system-agnostic Foundry VTT module that improves the way ambient music is played and transitioned during your games. It introduces realistic silence gaps, smooth fade-ins, and automatic crossfades between tracks without requiring manual playlist management.

## Features

- Per-playlist silence gap toggle
- Per-playlist automatic crossfade toggle that skips to the next track based on the fade out of the playlist
- Global fade-in setting for track starts
- Fully synchronized playback across GM and players
- UI buttons embedded directly into the playlist header
- ![image](https://github.com/user-attachments/assets/e316f207-8f0f-410f-87fc-3eb044409b93)


## Installation

1. Download the module using the Foundry VTT module installer.
2. Or manually add the manifest URL to your Foundry setup.

## Usage

- Open the Playlist directory tab.
- Click the toggle buttons on each playlist header to enable:
  - Silent gaps between sounds
  - Automatic crossfading
- Set fade-in, auto crossfade, or the silence between tracks through the playlist menu per soundtrack
- ![image](https://github.com/user-attachments/assets/33633878-b342-45b4-bc92-d601526de749)

- You may only have either Auto Crossfade or Enable Silence activated at a time due to playback issues
- The module works immediately with existing playlists—no track configuration required.

## Compatibility

- Works with all game systems (system-agnostic).
- Requires Foundry VTT v11 or later.
- Compatible with core audio features and most other playlist-enhancing modules.

## Planned Features

- Crossfade between different playlists
- Allowing Silent Gaps and Crossfade to work together
- Advanced shuffle/cycle behavior
- UI changes
- Code simplification and standardization/performance fixes

## Known Issues

- Pausing during a fade-in may restart the fade from the beginning
- native Foundry playlist button overflow issue which pushes the buttons off the UI if the name is too long

## License

This software is copyrighted © 2025 Somedude5.

You are free to use and share this module for personal, non-commercial use. Modification, redistribution, or commercial use is not permitted without written permission.

For questions or licensing inquiries, please contact me at https://github.com/Somedude5/The-Sound-of-Silence/issues

See the full license terms in the `LICENSE.txt` file.
