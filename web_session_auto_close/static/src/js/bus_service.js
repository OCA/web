odoo.define("web_session_auto_close.BusService", function(require) {
    "use strict";

    const BusService = require("bus.BusService");
    const LocalStorageServiceMixin = require("web_session_auto_close.LocalStorageServiceMixin");

    return BusService.include(
        Object.assign(LocalStorageServiceMixin, {
            /**
             * @override
             * @private
             */
            _heartbeat() {
                this._updateLocalStorageLastPresence();
                this._super.apply(this, arguments);
            },

            /**
             * Return whether the current session is valid and does not require a logout.
             * @returns {Boolean}
             */
            isSessionStillValid() {
                let sessionLastPresenceTime = this._getLocalStorageLastPresence() || 0;
                try {
                    sessionLastPresenceTime = parseInt(sessionLastPresenceTime);
                } catch (e) {
                    this._clearLocalStorageLastPresence();
                    sessionLastPresenceTime = 0;
                }
                const timeSinceLastPageRefresh =
                    new Date().getTime() - sessionLastPresenceTime;
                return (
                    sessionLastPresenceTime === 0 ||
                    timeSinceLastPageRefresh < this.HEARTBEAT_KILL_OLD_PERIOD
                );
            },
        })
    );
});
