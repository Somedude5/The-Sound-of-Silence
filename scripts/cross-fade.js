// cross-fade.js

// -----------------------------------------------------------------------------
//  The Sound of Silence — Auto‑Crossfade Helper
// -----------------------------------------------------------------------------
//  Purpose
//  -------
//  • Detect when the currently‑playing track has reached the point where its
//    fade‑out begins, then queue `playNext()` so the following track starts
//    exactly at that moment.
//  • Works in Sequential and Shuffle modes. (Simultaneous / Soundboard are
//    skipped because cross‑fading there makes little sense.)
// -----------------------------------------------------------------------------
//  Public API
//  ----------
//  • cancelCrossfade(playlist)    → void
//      Clears any pending cross‑fade timeout for the given playlist.
//  • scheduleCrossfade(playlist, ps)   → void
//      Arms a timeout that will trigger `playlist.playNext()` at the right time.
//      `ps` is the *PlaylistSound* that was just started.
// -----------------------------------------------------------------------------

import { MODULE_ID, debug } from "./main.js";
import { waitForMedia } from "./fade-in.js"; // Import the performant helper

// Map<Playlist, TimeoutID> — tracks the active cross‑fade timer per playlist
const CROSS_TIMERS = new WeakMap();

// Shorthand for Foundry's numeric enum
const PM = CONST.PLAYLIST_MODES;

/* -------------------------------------------------------------------------- */
/*  Public helpers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Cancel any pending cross‑fade timer on this playlist.
 */
export function cancelCrossfade(playlist) {
  const id = CROSS_TIMERS.get(playlist);
  if (id !== undefined) clearTimeout(id);
  CROSS_TIMERS.delete(playlist);
}

/**
 * Schedule `playlist.playNext()` so it fires exactly when the current track
 * reaches its fade‑out point.
 *
 * @param {Playlist} playlist  – The parent playlist (must be owned by user).
 * @param {PlaylistSound} ps  – The sound that just began playing.
 */
export async function scheduleCrossfade(playlist, ps) {
  debug(`[CF] 🔍 scheduleCrossfade("${playlist?.name}", "${ps?.name}")`);

  /* ------------------------------------------------------------------------ */
  /*  Guard clauses – bail fast when unsupported                              */
  /* ------------------------------------------------------------------------ */
  if (!playlist?.isOwner) {
    debug(`[CF] ⛔ Not owner of playlist: ${playlist?.name}`);
    return;
  }

  if (![PM.SEQUENTIAL, PM.SHUFFLE].includes(playlist.mode)) {
    debug(`[CF] ⏭ Playlist mode ${playlist.mode} unsupported`);
    return;
  }

  if (!playlist.getFlag(MODULE_ID, "crossfade")) {
    debug(`[CF] ⛔ crossfade flag not enabled`);
    return;
  }

  const fadeMs = Number(playlist.fade) || 0;
  if (fadeMs <= 0) {
    debug(`[CF] ⛔ fade duration is zero`);
    return;
  }

  /* ------------------------------------------------------------------------ */
  /*  Wait for the sound object to be ready using a performant helper         */
  /*  This replaces the old inefficient setInterval polling loop.             */
  /* ------------------------------------------------------------------------ */
  const sound = await waitForMedia(ps);

  // If the sound object never became available (e.g., audio file failed to load),
  // we can't get its duration, so we must abort.
  if (!sound) {
    debug(`[CF] ❌ Sound for "${ps.name}" never became available. Aborting crossfade.`);
    return;
  }

  /* ------------------------------------------------------------------------ */
  /*  Main helper that arms the cross‑fade timer                               */
  /* ------------------------------------------------------------------------ */
  function armTimer() {
    const dur = sound.duration;                   // total length (s)
    const elapsed = sound.currentTime || 0;       // how far in (s)
    const fireIn = Math.max(0, dur - elapsed - fadeMs / 1000);

    debug(`[CF] 🕒 Scheduling crossfade in ${fireIn.toFixed(2)} s (dur: ${dur}, fade: ${fadeMs})`);

    cancelCrossfade(playlist); // clear any stale timer first

    const handle = setTimeout(() => {
      debug(`[CF] 🔀 playNext("${playlist.name}")`);
      if (playlist.playing) playlist.playNext(undefined, { direction: 1 });
    }, fireIn * 1000); // convert seconds → ms for setTimeout

    CROSS_TIMERS.set(playlist, handle);
  }

  /* ------------------------------------------------------------------------ */
  /*  Arm immediately if already playing, otherwise wait for the "play" event */
  /* ------------------------------------------------------------------------ */
  if (sound.playing) {
    debug(`[CF] ▶️ Sound is already playing — arm now`);
    armTimer();
  } else {
    debug(`[CF] ⏳ Waiting for "play" event`);
    sound.addEventListener("play", armTimer, { once: true });
  }
}