/* Copyright 2022 ForgeFlow S.L.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define("web_confirm_duplicate", function (require) {
    "use strict";

    var FormController = require("web.FormController");
    var Dialog = require("web.Dialog");
    var _t = require("web.core")._t;

    FormController.include({
        init: function (parent, model, renderer, params) {
            this._super.apply(this, arguments);
            this.confirmOnDuplicate = params.confirmOnDuplicate;
        },

        _onDuplicateRecord: function () {
            var self = this;
            async function doIt() {
                self.model.duplicateRecord(self.handle).then(function (handle) {
                    self.handle = handle;
                    self._updateControlPanel();
                    self._setMode("edit");
                });
            }
            if (this.confirmOnDuplicate) {
                Dialog.confirm(
                    this,
                    _t("Are you sure you want to duplicate this record ?"),
                    {
                        confirm_callback: doIt,
                    }
                );
            } else {
                return self._super.apply(this, arguments);
            }
        },
    });
});
