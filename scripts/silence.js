// silence.js

import { MODULE_ID, debug, SOS_STATE } from "./main.js";
import { waitForMedia } from "./fade-in.js"; // NEW: Import the helper

const FLAG_KEY = "isSilenceGap";
const BASE64_AUDIO = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
const GAP_VOLUME = 0.01;
const GAP_NAME = "Silent Gap";

// ============================================
// Helper Functions
// ============================================

/**
 * Create and play a zero-volume audio document for the silence gap.
 * This version is more robust, ensuring the sound object exists before patching it.
 * @returns {Promise<PlaylistSound>} The created gap sound.
 */
async function createAndPlayGap(playlist, durationMs) {
  const now = Date.now();
  const [gap] = await playlist.createEmbeddedDocuments("PlaylistSound", [{
    name: GAP_NAME,
    path: BASE64_AUDIO,
    volume: GAP_VOLUME,
    repeat: false,
    flags: {
      [MODULE_ID]: {
        [FLAG_KEY]: true,
        gapDuration: durationMs,
        gapStarted: now
      }
    }
  }]);

  await playlist.playSound(gap);

  // NEW: Wait for the sound object to be available before we try to patch it.
  const sound = await waitForMedia(gap);

  // NEW: If the sound failed to load, we can't patch it, so we abort here.
  if (!sound) {
    debug(`[${MODULE_ID}] ❌ Failed to get sound object for silent gap. Cannot patch UI timer.`);
    return gap; // Still return the created document
  }

  // ── Patch the media object so the UI timer counts down ─────────────
  const durSec = durationMs / 1000;
  // CHANGED: Use the guaranteed 'sound' object, not 'gap.sound'.
  Object.defineProperty(sound, "duration", {
    configurable: true,
    get: () => durSec
  });

  // CHANGED: Use the guaranteed 'sound' object.
  Object.defineProperty(sound, "currentTime", {
    configurable: true,
    get: () => (Date.now() - now) / 1000
  });

  /* Force a quick UI refresh so our label-patch hook (main.js) runs */
  ui.playlists?.render(true);

  debug(`[${MODULE_ID}] 🎧 Playing silence for ${durationMs} ms as "${gap.name}" in "${playlist.name}"`);
  return gap;
}

/**
 * Tear down a gap: clear timer, delete document, and clean state.
 */
async function teardownGap(playlist, state) {
  clearTimeout(state.timer);
  SOS_STATE.delete(playlist);

  if (state.gap && playlist.sounds.has(state.gap.id)) {
    try {
      await state.gap.delete();
      debug(`[${MODULE_ID}] 🧹 Deleted silent gap "${state.gap.name}"`);
    } catch (err) {
      console.warn(`[${MODULE_ID}] ❌ Failed to delete gap:`, err);
    }
  }
}

/**
 * Compute a random gap duration between min and max, with validation and debug logs.
 */
function getRandomGapMs(playlist, fallbackDuration = 0) {
  const rawMin = Number(playlist.getFlag(MODULE_ID, "minDelay")) || 0;
  const rawMax = Number(playlist.getFlag(MODULE_ID, "maxDelay")) || fallbackDuration;

  const step = 100; // This must match the slider UI step

  const min = Math.max(0, rawMin);
  const max = Math.max(min, rawMax); // Ensure max >= min

  const minStep = Math.ceil(min / step);
  const maxStep = Math.floor(max / step);

  const numSteps = maxStep - minStep + 1;

  if (numSteps <= 0) {
    debug(`[${MODULE_ID}] Random gap range invalid or collapsed (min = ${min}, max = ${max}) — using static gap.`);
    return min;
  }

  const stepIndex = Math.floor(Math.random() * numSteps);
  const chosenGap = (minStep + stepIndex) * step;

  debug(`[${MODULE_ID}] 🎲 Random gap selected: ${chosenGap} ms (range: ${min}–${max}, step = ${step} ms)`);

  if (max > 10000) {
    console.warn(`[${MODULE_ID}] ⚠️ Unusually high delay range: ${min}–${max} ms`);
  }

  return chosenGap;
}


// ============================================
// API
// ============================================

export const Silence = {
  FLAG_KEY,

  /**
   * Injects a silent track in the given playlist,
   * returning a Promise that resolves to true if cancelled or false if it naturally expired.
   */
  async playSilence(playlist) {
    // Non-GMs should never create the silent gap document.
    if (!game.user.isGM) return Promise.resolve(false);

    const silenceMode = playlist.getFlag(MODULE_ID, "silenceMode") ?? "static";
    const silenceDuration = Number(playlist.getFlag(MODULE_ID, "silenceDuration")) || 0;
    let gapMs = silenceDuration;
    let logMsg = `[${MODULE_ID}] Silence Mode: ${silenceMode}. `;

    // Skip for simultaneous mode
    if (playlist.mode === CONST.PLAYLIST_MODES.SIMULTANEOUS) {
      debug(`[${MODULE_ID}] ⏭ Simultaneous mode — skipping silence.`);
      return Promise.resolve(false);
    }

    if (silenceMode === "random") {
      gapMs = getRandomGapMs(playlist, silenceDuration);
      logMsg += `Random mode selected. `;
    } else {
      logMsg += `Using static gap: ${gapMs} ms. `;
    }

    if (gapMs <= 0) {
      debug(logMsg + "Gap skipped (duration is zero).");
      return Promise.resolve(false);
    } else {
      debug(logMsg + "Gap will be created.");
    }

    const gap = await createAndPlayGap(playlist, gapMs);

    return new Promise(resolve => {
      const state = {
        gap,
        cancelled: false,
        timer: setTimeout(async () => {
          debug(`[${MODULE_ID}] ⏱ Silent gap of ${gapMs} ms expired for "${playlist.name}"`);
          await teardownGap(playlist, state);
          resolve(false);
        }, gapMs),
        resolve
      };
      SOS_STATE.set(playlist, state);
    });
  }
};