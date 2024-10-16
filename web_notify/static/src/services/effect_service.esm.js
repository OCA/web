/** @odoo-module **/

import {registry} from "@web/core/registry";
import {AudioPlayer} from "../components/audio_player.esm";
const effectRegistry = registry.category("effects");

// -----------------------------------------------------------------------------
// Audio effect
// -----------------------------------------------------------------------------

/**
 * Handles effect of type "audio_effect". It returns the AudioPlayer component
 * with the given audio source URL and other properties.
 *
 * @param {Object} env
 * @param {Object} [params={}]
 * @param {string} params.src
 *    The URL of the audio file to play.
 * @param {number} [params.volume=1.0] Volume level of the audio (from 0.0 to 1.0)
 * @param {boolean} [params.loop=false] Whether the audio should loop
 * @param {Function} [params.onEnded] Callback function to be called when the audio ends
 */

function audioEffect(env, params = {}) {
    if (!params.src) {
        console.warn(
            "Audio effect requires a 'src' parameter with the URL of the audio file."
        );
        return;
    }

    return {
        Component: AudioPlayer,
        props: {
            src: params.src,
            volume: params.volume || 1.0,
            loop: params.loop || false,
            onEnded: params.onEnded,
        },
    };
}

effectRegistry.add("audio_effect", audioEffect);
