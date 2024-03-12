odoo.define("web_pwa_cache.BasicView", function(require) {
    "use strict";

    var BasicView = require("web.BasicView");
    var WebClientObj = require("web.web_client");

    BasicView.include({
        /**
         * @override
         */
        _processField: function(viewType, field, attrs) {
            if (WebClientObj.pwa_manager.isPWAStandalone() && attrs.mode) {
                var modes = attrs.mode.split(",");
                if (modes[0] === "tree" && modes.indexOf("kanban") !== -1) {
                    attrs.mode = "kanban";
                }
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _processNode: function(node) {
            if (typeof node === "object" && "attrs" in node && node.attrs.class) {
                const node_classes = node.attrs.class.split(" ");
                if (
                    (node_classes.indexOf("oe_pwa_online_only") !== -1 &&
                        WebClientObj.pwa_manager.isOfflineMode()) ||
                    (node_classes.indexOf("oe_pwa_offline_only") !== -1 &&
                        !WebClientObj.pwa_manager.isOfflineMode())
                ) {
                    return false;
                }
            }
            return this._super.apply(this, arguments);
        },
    });
});
