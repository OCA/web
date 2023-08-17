odoo.define("web_session_auto_close.WebClient", function(require) {
    "use strict";

    const WebClient = require("web.WebClient");

    return WebClient.include({
        dependencies: ["bus_service", WebClient.prototype.dependencies],

        /**
         * @override
         */
        start: function() {
            const isSessionStillValid = this.call("bus_service", "isSessionStillValid");
            if (!isSessionStillValid) {
                window.location = "/web/session/logout";
                return;
            }
            const result = this._super.apply(this, arguments);
            // We need to ensure that the polling has started as this module relies on that process.
            this.call("bus_service", "startPolling");
            return result;
        },
    });
});
