/** @odoo-module alias=web_notify.AudioPlayer **/

import {Component, useState} from "@odoo/owl";

/**
 * @typedef AudioPlayerProps
 * @property {string} src URL of the audio file to be played
 * @property {number} [volume=1.0] Volume level of the audio (from 0.0 to 1.0)
 * @property {boolean} [loop=false] Whether the audio should loop
 * @property {Function} [onEnded] Callback function to be called when the audio ends
 */

/**
 * The AudioPlayer component is responsible for playing audio files with
 * specified settings like volume and looping. It also provides the ability
 * to trigger actions when the audio playback ends.
 */
export class AudioPlayer extends Component {
    setup() {
        this.state = useState({isPlaying: false});
        this.audioElement = new Audio(this.props.src);

        // Set audio properties
        this.audioElement.volume = this.props.volume || 1.0;
        this.audioElement.loop = this.props.loop || false;

        // Start playing the audio
        this.audioElement
            .play()
            .then(() => {
                this.state.isPlaying = true;
            })
            .catch((error) => {
                console.error("Audio playback failed:", error);
            });

        // Listen for the end of the audio playback
        this.audioElement.addEventListener("ended", this.onAudioEnded.bind(this));
    }

    /**
     * Stops the audio playback and triggers the onEnded callback if provided.
     */
    stopAudio() {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.state.isPlaying = false;

        if (this.props.onEnded) {
            this.props.onEnded();
        }
    }

    /**
     * Handler for when the audio playback ends.
     */
    onAudioEnded() {
        if (!this.props.loop) {
            this.stopAudio();
        }
    }

    willUnmount() {
        // Clean up the audio element and listeners
        this.audioElement.removeEventListener("ended", this.onAudioEnded);
        this.audioElement.pause();
    }
}

AudioPlayer.template = "web_notify.AudioPlayer";
