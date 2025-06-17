// fade-in.js

import { MODULE_ID, debug } from "./main.js";
import { Silence } from "./silence.js";

// =========================================================================
// Fade-In Logic
// =========================================================================

/**
 * A robust, non-polling utility to get the Howler.js Sound object
 * from a PlaylistSound, which may not be immediately available.
 * @param {PlaylistSound} ps The playlist sound.
 * @returns {Promise<Sound|null>} A promise that resolves with the Sound object or null if it times out.
 */
export function waitForMedia(ps) {
    // If media is already available, return it immediately.
    if (ps?.sound) return Promise.resolve(ps.sound);

    // Otherwise, wait for it with a timeout.
    return new Promise(resolve => {
        if (!ps) return resolve(null);

        let checkCount = 0;
        const interval = 50;   // Check every 50ms
        const maxChecks = 100; // For a total timeout of ~5 seconds

        const check = () => {
            if (ps.sound) {
                debug(`[waitForMedia] ✅ Media found for "${ps.name}"`);
                return resolve(ps.sound);
            }
            if (++checkCount > maxChecks) {
                debug(`[waitForMedia] ❌ Timed out waiting for media for "${ps.name}"`);
                return resolve(null);
            }
            // Schedule the next check
            setTimeout(check, interval);
        };

        debug(`[waitForMedia] ⏳ Waiting for media on "${ps.name}"...`);
        check();
    });
}


// Keep a WeakMap so each PlaylistSound remembers remaining fade time
const FADE_STATE = new WeakMap();

/**
 * Fade a PlaylistSound from 0 → targetVol.
 * Pausing during the fade stores remaining time; resuming continues it.
 */
export async function applyFadeIn(playlist, ps) {
    const fadeTotal = Number(playlist.getFlag(MODULE_ID, "fadeIn") ?? 0);
    if (fadeTotal <= 0) return;
    if (!ps || ps.getFlag(MODULE_ID, Silence.FLAG_KEY)) return;

    const media = await waitForMedia(ps);
    if (!media) return;

    const targetVol = ps.volume ?? 1;

    /* ── Local state for this sound ─────────────────────────── */
    let remaining = fadeTotal;                   // ms left to fade
    let startT = 0;                           // epoch when fade started

    /** (re)start the fade from current vol → target over “remaining”. */
    function resumeFade() {
        if (remaining <= 0) return;               // nothing left to fade
        startT = performance.now();
        media.fade(targetVol, { duration: remaining, from: media.volume });
        debug(`[${MODULE_ID}] 🎚️ Resuming fade of "${ps.name}" over ${remaining} ms`);
    }

    /** pause handler – capture how much is left */
    function onPause() {
        if (remaining <= 0) return;
        const elapsed = performance.now() - startT;
        remaining = Math.max(0, remaining - elapsed);
        debug(`[${MODULE_ID}] ⏸️ Fade paused on "${ps.name}". ${remaining} ms left`);
    }

    /** play handler – continue fade if needed, once */
    function onPlay() {
        if (remaining > 0) resumeFade();
    }

    /* ── Attach once per PlaylistSound ──────────────────────── */
    if (!FADE_STATE.has(ps)) {
        media.addEventListener("pause", onPause);
        media.addEventListener("play", onPlay);
        FADE_STATE.set(ps, true);                // mark as listeners-attached
    }

    /* ── Kick off initial fade (if not already playing) ─────── */
    if (media.playing) {
        media.volume = 0;
        resumeFade();
    } else {
        media.volume = 0;
        media.addEventListener("play", () => resumeFade(), { once: true });
    }
}