odoo.define("support_branding.ResConfigEdition", function (require) {
    "use strict";

    var ResConfigEdition = require("base_setup.ResConfigEdition");

    ResConfigEdition.include({
        willStart: function () {
            var self = this;
            var def_1 = this._rpc({
                model: "res.company",
                method: "get_support_branding_config_param_data",
                args: [],
            }).then(function (result) {
                if (result && 'support_company' in result)
                    self.support_cp_name = result['support_company'];
                if (result && 'support_company_url' in result)
                    self.support_cp_url = result['support_company_url'];
                if (result && 'support_email' in result)
                    self.support_cp_email = result['support_email'];
                if (result && 'support_release' in result)
                    self.support_cp_release = result['support_release'];
                if (result && 'support_branding_color' in result)
                    self.support_branding_color = result[
                    'support_branding_color'];
            });

            return $.when(this._super.apply(this, arguments), def_1);
        },
    });
});
