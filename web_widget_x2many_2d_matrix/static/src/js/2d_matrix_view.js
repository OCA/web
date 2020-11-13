/* Copyright 2019 Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_widget_x2many_2d_matrix.X2Many2dMatrixView", function (require) {
    "use strict";

    var BasicView = require("web.BasicView");

    BasicView.include({
        _processField: function (viewType, field, attrs) {
            // Workaround for kanban mode rendering.
            // Source of the issue: https://github.com/OCA/OCB/blob/12.0/addons/web/static/src/js/views/basic/basic_view.js#L303 .
            // See https://github.com/OCA/web/pull/1404#pullrequestreview-305813206 .
            //  In the long term we should a way to handle kanban mode
            // better (eg: a specific renderer).
            if (attrs.widget === "x2many_2d_matrix") {
                attrs.mode = "tree";
            }
            return this._super(viewType, field, attrs);
        },
    });
});
