/* Copyright 2022 ForgeFlow S.L.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define("web_confirm_duplicate.basic_view", function (require) {
    "use strict";

    var BasicView = require("web.BasicView");

    BasicView.include({
        init: function () {
            this._super.apply(this, arguments);
            this.controllerParams.confirmOnDuplicate = true;
        },
    });
});
