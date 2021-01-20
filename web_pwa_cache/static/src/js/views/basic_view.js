odoo.define("web_pwa_cache.BasicView", function (require) {
    "use strict";

    var BasicView = require("web.BasicView");
    var WebClientObj = require("web.web_client");


    BasicView.include({
        /**
         * @override
         */
        _processField: function (viewType, field, attrs) {
            if (WebClientObj.pwa_manager.isPWAStandalone() && attrs.mode) {
                var modes = attrs.mode.split(",");
                if (modes[0] === "tree" && modes.indexOf("kanban") !== -1) {
                    attrs.mode = "kanban";
                }
            }
            return this._super.apply(this, arguments);
        },
    });
});
