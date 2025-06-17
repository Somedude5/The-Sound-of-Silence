// main.js

import { registerPlaylistSheetWrappers } from "./playlist-config.js";
import { Silence } from "./silence.js";
import { scheduleCrossfade, cancelCrossfade } from "./cross-fade.js";
import { applyFadeIn } from "./fade-in.js";

// ============================================
// Constants & State
// ============================================
export const MODULE_ID = "the-sound-of-silence";
const FLAG_ENABLED = "silenceEnabled";

export const SOS_STATE = new WeakMap();       // Playlist → { timer, gap, resolve, cancelled }
export const CANCELLED_GAPS = new WeakSet();  // PlaylistSound → was cancelled


// ============================================
// Helpers
// ============================================

/**
 * Log only if user enabled debug in settings.
 */
export function debug(...args) {
    if (game.settings.get(MODULE_ID, "debug")) {
        console.log(`%c[${MODULE_ID}]`, "color: orange; font-weight: bold", ...args);
    }
}

/**
 * Cancel any pending silent gap on this playlist.
 */
async function cancelSilentGap(playlist) {
    const state = SOS_STATE.get(playlist);
    if (!state) {
        debug(`No active silence state for "${playlist.name}".`);
        return;
    }
    state.cancelled = true;

    // Clear any pending timer
    if (state.timer) {
        clearTimeout(state.timer);
        debug(`Cleared timer for "${playlist.name}".`);
    }

    // Delete the gap document if it still exists
    const gap = state.gap;
    if (gap) {
        CANCELLED_GAPS.add(gap);
        if (gap.name) {
            debug(`Deleting gap "${gap.name}" for "${playlist.name}".`);
            try {
                // Only GMs can delete documents
                if (game.user.isGM) await gap.delete();
                debug(`Gap "${gap.name}" marked for deletion.`);
            } catch (err) {
                console.warn("Failed to delete gap:", err);
            }
        } else {
            debug("Gap deletion aborted — invalid or removed.");
        }
    }

    // Resolve the silence promise so playback can continue
    if (state.resolve) {
        state.resolve(true);
        SOS_STATE.delete(playlist);
        debug(`Resolved silence promise for "${playlist.name}".`);
    } else {
        debug(`No resolver found for "${playlist.name}".`);
    }
}

/**
 * Helper to check if silence is enabled.
 */
function silenceIsEnabled(playlist) {
    return playlist.getFlag(MODULE_ID, FLAG_ENABLED) ?? false;
}

// ============================================
// Hooks
// ============================================

Hooks.once("init", () => {
    // ... (rest of the init hook is unchanged)
    console.log(`[${MODULE_ID}] Initializing…`);
    game.settings.register(MODULE_ID, "debug", {
        name: "Enable Debug Logging",
        hint: "Log silence timing and playlist actions to the console.",
        scope: "client",
        config: true,
        type: Boolean,
        default: false
    });

    // Suppress that annoying unnamed-PlaylistSound error
    window.addEventListener("unhandledrejection", event => {
        const msg = event.reason?.message;
        if (msg?.includes("PlaylistSound") && msg.includes("name: may not be undefined")) {
            debug("Suppressed unhandled PlaylistSound validation error.");
            event.preventDefault();
        }
    });
});


Hooks.once("ready", () => {
    // ... (libWrapper check, error suppression, etc. are unchanged)
    if (!game.modules.get("lib-wrapper")?.active) {
        ui.notifications.error(`${MODULE_ID} requires the libWrapper module.`);
        return;
    }

    registerPlaylistSheetWrappers();

    const origError = ui.notifications.error;
    ui.notifications.error = function (message, ...args) {
        const suppress =
            typeof message === "string" &&
            ((message.includes("PlaylistSound") && message.includes("name: may not be undefined")) ||
                (message.includes("FILES_UPLOAD permission") && message.includes("base64")));

        if (suppress) {
            debug("🧯 Suppressed validation toast:", message);
            return;
        }
        return origError.call(this, message, ...args);
    };

    window.addEventListener("unhandledrejection", event => {
        const msg = event.reason?.message || "";
        if (msg.includes("FILES_UPLOAD permission") && msg.includes("base64")) {
            debug("🧯 Suppressed FILES_UPLOAD console error.");
            event.preventDefault();
        }
    });

    // 1) Intercept when any track ends
    libWrapper.register(
        MODULE_ID,
        "PlaylistSound.prototype._onEnd",
        function (wrapped, ...args) {
            const playlist = this.parent;
            const isGap = this.getFlag(MODULE_ID, Silence.FLAG_KEY);
            debug(`_onEnd: "${this.name}" (gap=${isGap})`);

            if (isGap) {
                if (CANCELLED_GAPS.has(this)) {
                    CANCELLED_GAPS.delete(this);
                    debug(`Silent gap "${this.name}" was cancelled.`);
                } else {
                    debug(`Silent gap "${this.name}" completed naturally.`);
                }
                return; // never advance on gap
            }

            if (!silenceIsEnabled(playlist)) {
                debug("Silence disabled—continuing normally.");
                return wrapped(...args);
            }

            if (!playlist.playing) {
                debug(`Playlist "${playlist.name}" already stopped—skip gap.`);
                return wrapped(...args);
            }

            debug(`Injecting silent gap after "${this.name}" in "${playlist.name}".`);
            Silence.playSilence(playlist).then(cancelled => {
                debug(`Gap promise resolved (cancelled=${cancelled}).`);

                // =================================================================
                //  CRITICAL FIX: Only the GM should ever advance the playlist.
                //  This prevents players from throwing permission errors.
                // =================================================================
                if (game.user.isGM) {
                    if (!cancelled) {
                        const order = playlist.playbackOrder;
                        const idx = order.indexOf(this.id) + 1;
                        const next = playlist.sounds.get(order[idx]);
                        if (next) {
                            debug(`Advancing to "${next.name}".`);
                            playlist.playSound(next);
                        } else {
                            debug("No next track—stopping playlist.");
                            playlist.stopAll();
                        }
                    }
                }
                // =================================================================

                SOS_STATE.delete(playlist);
            });
        },
        "MIXED"
    );

    // 2) Clear any gap when the playlist stops
    libWrapper.register(
        MODULE_ID,
        "Playlist.prototype.stopAll",
        function (wrapped, ...args) {
            cancelSilentGap(this);
            cancelCrossfade(this);
            debug(`Playlist "${this.name}" stopped—all gaps cleared.`);
            return wrapped(...args);
        },
        "WRAPPER"
    );

    // 3) Clear gaps if an individual sound is stopped
    libWrapper.register(
        MODULE_ID,
        "Playlist.prototype.stopSound",
        function (wrapped, sound, ...args) {
            if (SOS_STATE.has(this) && sound.getFlag(MODULE_ID, Silence.FLAG_KEY)) {
                cancelSilentGap(this);
            }
            const result = wrapped(sound, ...args);
            if (!this.playing && SOS_STATE.has(this)) {
                cancelSilentGap(this);
            }
            return result;
        },
        "WRAPPER"
    );


    // --- High-level wrappers for GM-only logic (like crossfade) ---

    libWrapper.register(MODULE_ID, "Playlist.prototype.playSound", async function (wrapped, sound, ...args) {
        const result = await wrapped.call(this, sound, ...args);
        // Fade-in is now handled by the global wrapper below
        cancelCrossfade(this);
        scheduleCrossfade(this, sound);
        debug(`▶️ playSound wrapper: "${sound.name}"`);
        return result;
    }, "WRAPPER");

    libWrapper.register(MODULE_ID, "Playlist.prototype.playNext", async function (wrapped, ...args) {
        const maybeSound = await wrapped.call(this, ...args);
        debug("▶️ playNext wrapper fired");
        setTimeout(() => {
            let next = this.sounds.find(s => s.playing);
            if (Array.isArray(next)) next = next.pop();
            if (next) {
                debug(`🎯 playNext located playing sound: ${next.name}`);
                cancelCrossfade(this);
                scheduleCrossfade(this, next);
            } else {
                debug("⚠️ playNext found no playing sound after tick");
            }
        }, 0);
        return maybeSound;
    }, "WRAPPER");

    libWrapper.register(MODULE_ID, "Playlist.prototype.playAll", async function (wrapped, ...args) {
        const result = await wrapped.call(this, ...args);
        debug("▶️ playAll wrapper fired");
        setTimeout(() => {
            let first = this.sounds.find(s => s.playing);
            if (Array.isArray(first)) first = first.pop();
            if (first) {
                debug(`🎯 playAll located first playing sound: ${first.name}`);
                scheduleCrossfade(this, first);
            } else {
                debug("⚠️ playAll found no playing sound after tick");
            }
        }, 0);
        return result;
    }, "WRAPPER");

    /* ─────────────────────────────────────────────────────────────
       Global wrapper to run fade-in on every client
       ───────────────────────────────────────────────────────────── */
    libWrapper.register(
        MODULE_ID,
        "foundry.audio.Sound.prototype.play",
        async function (wrapped, options = {}) {
            // 1️⃣  Let Foundry actually start (or resume) the audio
            const result = await wrapped.call(this, options);

            let ps = this._manager;
            if (!(ps instanceof PlaylistSound)) {
                ps = game.playlists.contents
                    .flatMap(p => p.sounds.contents)
                    .find(s => s.playing && s.path === this.src);
            }

            /* ── PRE-MUTE ONLY ON FIRST PLAY ── */
            if (ps && ps.pausedTime === 0) this.volume = 0;



            const playlist = ps?.parent;
            const fadeMs = Number(playlist?.getFlag(MODULE_ID, "fadeIn") ?? 0);
            if (fadeMs <= 0) return result; // No fade-in configured

            // Skip if silence-gap track
            if (ps?.getFlag(MODULE_ID, "isSilenceGap")) return result;

            applyFadeIn(playlist, ps);
            return result;
        },
        "WRAPPER"
    );


});

/* ------------------------------------------------------------ */
/*  Playlist Directory UI (Unchanged)                         */
/* ------------------------------------------------------------ */
Hooks.on("renderPlaylistDirectory", (app, html) => {
    debug("Rendering PlaylistDirectory…");

    html.find("li.playlist").each((_i, li) => {
        const $li = $(li);
        const pid = $li.data("documentId");
        const playlist = game.playlists.get(pid);
        if (!playlist) return;

        const silenceEnabled = playlist.getFlag(MODULE_ID, "silenceEnabled") ?? false;
        const crossfadeOn = playlist.getFlag(MODULE_ID, "crossfade") ?? false;
        const isOwner = playlist.isOwner;

        function upsertBtn(selector, opts) {
            let $btn = $li.find(selector);
            const exists = $btn.length > 0;

            if (!exists) {
                $btn = $(`<a class="${opts.class}" data-playlist-id="${pid}" data-tooltip="${opts.tip}">
                    <i class="fas ${opts.icon}"></i>
                  </a>`);
                $li.find(".playlist-header .sound-controls").prepend($btn);
            } else {
                $btn.attr("class", opts.class).attr("data-tooltip", opts.tip);
                $btn.find("i").attr("class", `fas ${opts.icon}`);
            }
        }

        const hgClasses = ["sound-control", "sos-toggle", silenceEnabled ? "active" : "", !isOwner ? "disabled" : ""].filter(Boolean).join(" ");
        upsertBtn("a.sos-toggle", {
            class: hgClasses,
            tip: silenceEnabled ? "Disable Sound of Silence" : "Enable Sound of Silence",
            icon: "fa-hourglass-half"
        });

        const xfClasses = ["sound-control", "xfade-toggle", crossfadeOn ? "active" : "", !isOwner ? "disabled" : ""].filter(Boolean).join(" ");
        upsertBtn("a.xfade-toggle", {
            class: xfClasses,
            tip: crossfadeOn ? "Disable Auto-Crossfade" : "Enable Auto-Crossfade",
            icon: "fa-exchange-alt"
        });
    });

    html.find("a.sos-toggle:not(.disabled)").off("click").on("click", async ev => {
        ev.preventDefault();
        const pid = $(ev.currentTarget).data("playlistId");
        const pl = game.playlists.get(pid);
        if (!pl) return;
        const enable = !(pl.getFlag(MODULE_ID, "silenceEnabled") ?? false);
        await pl.setFlag(MODULE_ID, "silenceEnabled", enable);
        if (enable) await pl.setFlag(MODULE_ID, "crossfade", false);
        ui.playlists.render();
    });

    html.find("a.xfade-toggle:not(.disabled)").off("click").on("click", async ev => {
        ev.preventDefault();
        const pid = $(ev.currentTarget).data("playlistId");
        const pl = game.playlists.get(pid);
        if (!pl) return;
        const enable = !(pl.getFlag(MODULE_ID, "crossfade") ?? false);
        await pl.setFlag(MODULE_ID, "crossfade", enable);
        if (enable) await pl.setFlag(MODULE_ID, "silenceEnabled", false);
        ui.playlists.render();
    });
});