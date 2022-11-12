odoo.define("support_branding.ResConfigEdition", function (require) {
    "use strict";

    var ResConfigEdition = require("base_setup.ResConfigEdition");

    ResConfigEdition.include({
        willStart: function () {
            var self = this;
            var def_1 = this._rpc({
                model: "ir.config_parameter",
                method: "get_param",
                args: ["support_company"],
            }).then(function (name) {
                self.support_cp_name = name;
            });
            var def_2 = this._rpc({
                model: "ir.config_parameter",
                method: "get_param",
                args: ["support_company_url"],
            }).then(function (url) {
                self.support_cp_url = url;
            });
            var def_3 = this._rpc({
                model: "ir.config_parameter",
                method: "get_param",
                args: ["support_email"],
            }).then(function (email) {
                self.support_cp_email = email;
            });
            return $.when(this._super.apply(this, arguments), def_1, def_2, def_3);
        },
    });
});
