/** @odoo-module **/

import {registry} from "@web/core/registry";

/**
 * The notificationSoundService is responsible for handling the playback of audio
 * notifications when a new notification is added. This service integrates with
 * the notification system and the effect service to provide audible feedback
 * based on the type of notification.
 *
 * Dependencies:
 * - notification: The service responsible for displaying notifications on the UI.
 * - effect: The service that handles visual and auditory effects in the application.
 */

export const notificationSoundService = {
    dependencies: ["notification", "effect"],

    /**
     * Starts the notification sound service, enabling sound playback for notifications.
     *
     * @param {Object} env The environment object, providing access to various services.
     * @param {Object} services An object containing the dependencies (notification, effect).
     * @returns {Object} The add function, used to add notifications with sound.
     */
    start(env, {notification, effect}) {
        /**
         * Adds a notification with an associated sound effect.
         *
         * @param {String} message The message to be displayed in the notification.
         * @param {Object} [options={}] Additional options for the notification, such as type, sound and etc
         * @returns {Function} A function to close the notification.
         */
        function add(message, options = {}) {
            const sound = options.sound || false;
            delete options.sound; // Remove sound option from the options before passing to notification

            const closeFn = notification.add(message, options);

            if (sound)
                // Trigger the audio effect.
                effect.add({
                    type: "audio_effect",
                    src: sound,
                    volume: 0.8,
                    loop: false,
                    onEnded: () => {
                        // Placeholder for any action after sound ends
                    },
                });
            return closeFn;
        }
        return {add};
    },
};

// Register the notification sound service in the service registry
registry.category("services").add("notification_sound", notificationSoundService);
