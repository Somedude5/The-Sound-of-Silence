// playlist-congif.js

import { MODULE_ID, debug } from "./main.js";

// ============================================
// Flags & Defaults
// ============================================
const FLAG_FADE_IN = "fadeIn";        // Number (ms)
const FLAG_MODE = "silenceMode";   // "static" | "random"
const FLAG_SILENCE_MS = "silenceDuration"; // Number (ms) - the *total* silence between tracks
const FLAG_MIN_DELAY = "minDelay";
const FLAG_MAX_DELAY = "maxDelay";
const FLAG_CROSSFADE = "crossfade";


const DEFAULTS = {
  fadeIn: 0,
  silenceDuration: 0,
  silenceMode: "static",
  minDelay: 0,
  maxDelay: 0,
  crossfade: false
}
// ============================================
// Helpers
// ============================================
/**
 * Read our SOS flags from a Playlist document.
 */
function getSosFlags(doc) {
  return {
    silenceEnabled: doc.getFlag(MODULE_ID, "silenceEnabled") ?? false,
    fadeIn: doc.getFlag(MODULE_ID, FLAG_FADE_IN) ?? DEFAULTS.fadeIn,
    silenceDuration: doc.getFlag(MODULE_ID, FLAG_SILENCE_MS) ?? DEFAULTS.silenceDuration,
    silenceMode: doc.getFlag(MODULE_ID, FLAG_MODE) ?? DEFAULTS.silenceMode,
    minDelay: doc.getFlag(MODULE_ID, FLAG_MIN_DELAY) ?? DEFAULTS.minDelay,
    maxDelay: doc.getFlag(MODULE_ID, FLAG_MAX_DELAY) ?? DEFAULTS.maxDelay,
    crossfade: doc.getFlag(MODULE_ID, FLAG_CROSSFADE) ?? DEFAULTS.crossfade,
  };
}


/**
 * Persist our SOS flags on a Playlist document.
 */
async function saveSosFlags(doc, fadeIn, silenceDuration, silenceMode, minDelay, maxDelay, crossfade) {
  await doc.setFlag(MODULE_ID, FLAG_FADE_IN, fadeIn);
  await doc.setFlag(MODULE_ID, FLAG_SILENCE_MS, silenceDuration);
  await doc.setFlag(MODULE_ID, FLAG_MODE, silenceMode);
  await doc.setFlag(MODULE_ID, FLAG_MIN_DELAY, minDelay);
  await doc.setFlag(MODULE_ID, FLAG_MAX_DELAY, maxDelay);
  await doc.setFlag(MODULE_ID, FLAG_CROSSFADE, crossfade);
}

// ============================================
// Wrapper Registration
// ============================================
export function registerPlaylistSheetWrappers() {
  // 1) Expose our flags to the PlaylistConfig sheet data
  libWrapper.register(
    MODULE_ID,
    "PlaylistConfig.prototype.getData",
    function (wrapped, ...args) {
      const data = wrapped.apply(this, args);
      data.sos = getSosFlags(this.object);
      return data;
    },
    "WRAPPER"
  );

  // 2) Capture our custom fields, strip them out, then save as flags
  libWrapper.register(
    MODULE_ID,
    "PlaylistConfig.prototype._updateObject",
    async function (wrapped, event, formData) {
      debug(`[${MODULE_ID}] _updateObject called with formData:`, formData);

      // Parse all custom fields
      const fadeInRaw = formData["sos.fadeIn"];
      const silenceDurRaw = formData["sos.silenceDuration"];
      const silenceModeRaw = formData["sos.silenceMode"];
      const minDelayRaw = formData["sos.minDelay"];
      const maxDelayRaw = formData["sos.maxDelay"];
      const crossfadeRaw = formData["sos.crossfade"];
      const silenceEnabledRaw = formData["sos.silenceEnabled"];

      const fadeIn = Number(fadeInRaw ?? 0);
      const silenceDur = Number(silenceDurRaw ?? 0);
      const mode = silenceModeRaw ?? "static";
      const minDelay = Number(minDelayRaw ?? 0);
      const maxDelay = Number(maxDelayRaw ?? 0);
      const crossfade = Boolean(crossfadeRaw);
      const silenceEnabled = Boolean(silenceEnabledRaw);

      // Remove from core form data
      delete formData["sos.fadeIn"];
      delete formData["sos.silenceDuration"];
      delete formData["sos.silenceMode"];
      delete formData["sos.minDelay"];
      delete formData["sos.maxDelay"];
      delete formData["sos.crossfade"];

      // Apply core update first
      await wrapped.call(this, event, formData);

      // Enforce mutual exclusivity
      const finalSilence = silenceEnabled && !crossfade;
      const finalCrossfade = crossfade && !silenceEnabled;

      await saveSosFlags(this.object, fadeIn, silenceDur, mode, minDelay, maxDelay, finalCrossfade);
      await this.object.setFlag(MODULE_ID, "silenceEnabled", finalSilence);

      ui.playlists?.render();
    },
    "WRAPPER"
  );
}

// ============================================
// UI Hook: inject our form controls
// ============================================
Hooks.on("renderPlaylistConfig", (app, html, data) => {
  debug("Rendering PlaylistConfig with SOS fields");

  const fadeRow = html.find('input[name="fade"]').closest(".form-group");
  const sos = data.sos ?? { ...DEFAULTS };

  // If maxDelay is not yet set, default it to the current Silence Duration
  if (!Number.isFinite(sos.maxDelay) || sos.maxDelay === 0) {
    sos.maxDelay = sos.silenceDuration;
  }

  // --- Build the extra UI fields ---
  const $fields = $(`
  <div class="form-group sos-fadein-group">
    <label>Fade-In Duration (ms)</label>
    <input type="number"
           name="sos.fadeIn"
           class="sos-fadeIn"
           value="${sos.fadeIn}"
           step="1" min="0">
  </div>

  <div class="sos-silence-block" style="display: ${sos.silenceEnabled ? "block" : "none"}">
    <div class="form-group">
      <label>Silence Mode</label>
      <select name="sos.silenceMode" class="sos-silence-mode">
        <option value="static"  ${sos.silenceMode === "static" ? "selected" : ""}>Static</option>
        <option value="random"  ${sos.silenceMode === "random" ? "selected" : ""}>Random</option>
      </select>
    </div>

    <div class="form-group sos-silencedur-group">
      <label>Silence Duration (ms)</label>
      <input type="number"
             name="sos.silenceDuration"
             class="sos-silenceDuration"
             value="${sos.silenceDuration}"
             step="100" min="0">
    </div>

    <div class="form-group sos-delay-group" style="display: none;">
      <label>Minimum Delay (ms): <span class="sos-minDelay-val">${sos.minDelay}</span></label>
      <input type="range" name="sos.minDelay" class="sos-minDelay"
        min="0" max="${sos.silenceDuration}" step="100" value="${sos.minDelay}">
      <label>Maximum Delay (ms): <span class="sos-maxDelay-val">${sos.maxDelay}</span></label>
      <input type="range" name="sos.maxDelay" class="sos-maxDelay"
       min="0" max="${sos.silenceDuration}" step="100" value="${sos.maxDelay}">
    </div>
  </div>
`);


  // Insert extra fields after Fade Duration
  fadeRow.after($fields);

  // --- Handle show/hide for random mode ---
  function updateFields() {
    const mode = html.find('select[name="sos.silenceMode"]').val();
    if (mode === "random") {
      html.find('.sos-delay-group').show();
    } else {
      html.find('.sos-delay-group').hide();
    }
  }

  // Toggle silence block on checkbox change
  html.find('input[name="sos.silenceEnabled"]').on('change', function () {
    const enabled = $(this).is(':checked');
    html.find('.sos-silence-block').toggle(enabled);
  });

  html.find('select[name="sos.silenceMode"]').on('change', updateFields);
  updateFields();

  // --- When Silence Duration changes, update slider maxes and reset values if needed ---
  html.find('input[name="sos.silenceDuration"]').on('input', function () {
    const silVal = Number($(this).val()) || 0;
    const minDelayInput = html.find('input[name="sos.minDelay"]');
    const maxDelayInput = html.find('input[name="sos.maxDelay"]');

    minDelayInput.attr('max', silVal);
    maxDelayInput.attr('max', silVal);

    // If sliders are now out of bounds, move them to the edge or as close as possible
    if (Number(minDelayInput.val()) > silVal) {
      minDelayInput.val(silVal).trigger('input');
    }
    if (Number(maxDelayInput.val()) > silVal) {
      maxDelayInput.val(silVal).trigger('input');
    }
    // If both are 0 (default), set min to 0, max to silVal (for quick reset usability)
    if (silVal > 0 && Number(minDelayInput.val()) === 0 && Number(maxDelayInput.val()) === 0) {
      maxDelayInput.val(silVal).trigger('input');
    }
  });

  // --- Prevent sliders from crossing each other ---
  function clampSliders(changed) {
    const $min = html.find('input[name="sos.minDelay"]');
    const $max = html.find('input[name="sos.maxDelay"]');
    let minVal = Number($min.val());
    let maxVal = Number($max.val());

    if (changed === "min" && minVal > maxVal) {
      maxVal = minVal;
      $max.val(maxVal);
      html.find('.sos-maxDelay-val').text(maxVal);
    }
    if (changed === "max" && maxVal < minVal) {
      minVal = maxVal;
      $min.val(minVal);
      html.find('.sos-minDelay-val').text(minVal);
    }
  }
  html.find('input[name="sos.minDelay"]').on('input', function () {
    html.find('.sos-minDelay-val').text(this.value);
    clampSliders("min");
  });
  html.find('input[name="sos.maxDelay"]').on('input', function () {
    html.find('.sos-maxDelay-val').text(this.value);
    clampSliders("max");
  });

  // --- Show initial slider labels ---
  html.find('.sos-minDelay-val').text(html.find('input[name="sos.minDelay"]').val());
  html.find('.sos-maxDelay-val').text(html.find('input[name="sos.maxDelay"]').val());

  const $crossfadeFields = $(`
  <div class="form-group sos-crossfade-group">
    <label>Auto-Crossfade</label>
    <input type="checkbox" name="sos.crossfade" ${sos.crossfade ? "checked" : ""}/>
  </div>
  `);

  const $transitionToggles = $(`
    <div class="form-group sos-toggle-pair">
      <label>Playback Transition</label>
      <div class="flexrow" style="gap: 1em;">
        <label class="checkbox" style="font-size: 1.05em;">
          <input type="checkbox" name="sos.silenceEnabled" style="transform: scale(1.3); margin-right: 0.25em;" ${sos.silenceEnabled ? "checked" : ""}>
          Enable Silence
        </label>
        <label class="checkbox" style="font-size: 1.05em;">
          <input type="checkbox" name="sos.crossfade" style="transform: scale(1.3); margin-right: 0.25em;" ${sos.crossfade ? "checked" : ""}>
          Auto-Crossfade
        </label>
      </div>
    </div>
  `);

  $fields.last().after($transitionToggles);

  // Show/hide overlap duration field based on checkbox
  html.find('input[name="sos.crossfade"]').on('change', function () {
    html.find('.sos-xfade-ms').toggle(this.checked);
  }).trigger('change');

  function updateToggleDisables() {
    const silenceBox = html.find('input[name="sos.silenceEnabled"]');
    const crossfadeBox = html.find('input[name="sos.crossfade"]');

    const silenceOn = silenceBox.is(":checked");
    const crossfadeOn = crossfadeBox.is(":checked");

    if (silenceOn) {
      crossfadeBox.prop("disabled", true);
    } else {
      crossfadeBox.prop("disabled", false);
    }

    if (crossfadeOn) {
      silenceBox.prop("disabled", true);
      html.find('.sos-silence-block').hide();
    } else {
      silenceBox.prop("disabled", false);
    }

    // Show/hide silence settings
    html.find('.sos-silence-block').toggle(silenceOn && !crossfadeOn);
  }

  // Attach listeners
  html.find('input[name="sos.silenceEnabled"], input[name="sos.crossfade"]').on("change", updateToggleDisables);
  updateToggleDisables(); // initial state



});
