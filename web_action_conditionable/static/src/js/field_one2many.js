/* global py */
/* Copyright 2019 Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define("web.web_action_conditionable", function (require) {
    "use strict";

    var FieldOne2Many = require("web.relational_fields").FieldOne2Many;

    FieldOne2Many.include({
        init: function () {
            var self = this;
            try {
                return this._super.apply(this, arguments);
            } catch (error) {
                var arch = this.view && this.view.arch;
                if (arch) {
                    ["create", "delete"].forEach(function (item) {
                        if (!_.has(arch.attrs, item)) {
                            return;
                        }
                        var expr = arch.attrs[item];
                        try {
                            self.activeActions[item] = py
                                .evaluate(py.parse(py.tokenize(expr)), self.recordData)
                                .toJSON();
                        } catch (ignored) {
                            console.log(
                                "[web_action_conditionable] unrecognized expr '" +
                                    expr +
                                    "', ignoring"
                            );
                        }
                    });
                    this.editable = arch.attrs.editable;
                }
                if (this.attrs.columnInvisibleFields) {
                    this._processColumnInvisibleFields();
                }
            }
        },
    });
});
