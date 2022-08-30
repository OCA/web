odoo.define("support_branding.UserMenu", function (require) {
    "use strict";

    var user_menu = require("web.UserMenu");

    user_menu.include({
        _onMenuSupport: function () {
            var url = this.support_url || "https://www.odoo.com/buy";
            window.open(url, "_blank");
        },
        willStart: function () {
            var self = this;
            var def = self
                ._rpc({
                    model: "ir.config_parameter",
                    method: "get_param",
                    args: ["support_company_url"],
                })
                .then(function (site) {
                    if (site && site !== "") {
                        self.support_url = site;
                    }
                });
            return $.when(this._super.apply(this, arguments), def);
        },
    });
});
