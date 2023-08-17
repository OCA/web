odoo.define("web_session_auto_close.LocalStorageServiceMixin", function() {
    "use strict";

    return {
        /**
         * Get the local storage key to use to manage the last presence time.
         * @returns {String} the key of the local storage.
         * @private
         */
        _getLocalStorageLastPresenceKey() {
            const window_origin = location.protocol + "//" + location.host;
            // Replace ':', '/' & '//' by '_'
            const sanitized_origin = window_origin.replace(/:\/{0,2}/g, "_");
            return `web_session_auto_close.${sanitized_origin}.lastPresenceTime`;
        },

        /**
         * Update the last presence time in the local storage.
         * @private
         */
        _updateLocalStorageLastPresence() {
            const now = new Date().getTime();
            localStorage.setItem(
                this._getLocalStorageLastPresenceKey(),
                now.toString()
            );
        },

        /**
         * Get the last presence time from the local storage.
         * @returns {String} the last presence time stored in the local storage.
         * @private
         */
        _getLocalStorageLastPresence() {
            return localStorage.getItem(this._getLocalStorageLastPresenceKey());
        },

        /**
         * Clear the last presence key in the local storage.
         * @private
         */
        _clearLocalStorageLastPresence() {
            localStorage.removeItem(this._getLocalStorageLastPresenceKey());
        },
    };
});
