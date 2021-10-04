odoo.define("web_widget_x2many_2d_matrix.matrix_limit_extend", function (require) {
    "use strict";

    var FormView = require("web.FormView");

    FormView.include({
        // We extend this method so that the view is not limited to
        // just 40 cells when the 'x2many_2d_matrix' widget is used.
        _setSubViewLimit: function (attrs) {
            this._super(attrs);
            if (attrs.widget === "x2many_2d_matrix") {
                attrs.limit = Infinity;
            }
        },
    });
    var BasicRenderer = require("web.BasicRenderer");
    BasicRenderer.include({
        _handleAttributes: function ($el, node) {
            this._super($el, node);
            if (node.attrs.disabled) {
                $el.attr("disabled", node.attrs.disabled);
            }
            if (node.attrs.hidden) {
                $el.attr("hidden", node.attrs.hidden);
            }
        },
    });
});
