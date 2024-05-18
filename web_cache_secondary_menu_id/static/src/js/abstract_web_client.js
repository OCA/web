odoo.define("web_cache_secondary_menu_id.AbstractWebClient", function (require) {
    "use strict";

    var AbstractWebClient = require("web.AbstractWebClient");

    AbstractWebClient.include({
        /*
         * A re-bind for the custom menu parameter is needed is
         * needed at some point otherwise the parameter will not
         * be left in the definitive URL. Prefer do_push_state()
         * override over getState() as getState() will not keep
         * the menu id in some cases e.g. dashboard view. Also
         * prefer this over _onPushState() because do_push_state()
         * is also executed on page refresh
         */
        do_push_state: function (state) {
            var url = window.location.href;
            var searchParams = new URLSearchParams(url.split("#")[1]);
            // Rely on URL param in order to perform this re-serialization:
            // do not check key this.current_secondary_menu as it has some
            // inconsistency, e.g. it doesn't get removed when switching
            // to another APP menu
            var secondary_menu_id = searchParams.get("secondary_menu_id");
            if (secondary_menu_id) {
                // UPDATE URL:
                // Every key/value pair contained in 'state' object
                // is going to be serialized and added to the URL
                // in method AbstractWebClient.do_push_state()
                // The method originally serialize only the primary
                // menu ID. Binding the secondary menu ID to the object
                // 'state' will lead to the serialization of a custom
                // URL parameter for the secondary menu
                state.secondary_menu_id = secondary_menu_id;
            } else if (!secondary_menu_id && "secondary_menu_id" in state) {
                delete state.secondary_menu_id;
            }
            this._super.apply(this, arguments);
        },
    });
});
