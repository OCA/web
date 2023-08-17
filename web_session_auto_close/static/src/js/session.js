odoo.define("web_session_auto_close.Session", function(require) {
    "use strict";

    const LocalStorageServiceMixin = require("web_session_auto_close.LocalStorageServiceMixin");
    const WebSession = require("web.Session");

    return WebSession.include(
        Object.assign(LocalStorageServiceMixin, {
            /**
             * @override
             */
            session_init() {
                const result = this._super.apply(this, arguments);
                if (!this.session_is_valid()) {
                    this._clearLocalStorageLastPresence();
                }
                return result;
            },
        })
    );
});
