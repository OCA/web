odoo.define( "web_widget_x2many_2d_matrix.matrix_limit_extend", function (require) {
"use strict";

        var AbstractView = require("web.AbstractView");

        AbstractView.include({
            // We extend this method so that the view is not limited to
            // just 40 cells when the 'x2many_2d_matrix' widget is used.
            _setSubViewLimit: function (attrs) {
                this._super(attrs);
                if (attrs.widget === "x2many_2d_matrix") {
                    attrs.limit = Infinity;
                }
            },
        });
    }
);
