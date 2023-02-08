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
                    model: "res.company",
                    method: "get_support_branding_config_param_data",
                    args: [],
                })
                .then(function (result) {
                    if (
                        result &&
                        "support_company_url" in result &&
                        result.support_company_url !== ""
                    ) {
                        self.support_url = result.support_company_url;
                    }
                });
            return $.when(this._super.apply(this, arguments), def);
        },
    });
});
