// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.BasicView", function (require) {
    "use strict";

    var core = require("web.core");
    var pyUtils = require("web.py_utils");
    var BasicView = require("web.BasicView");

    var _t = core._t;

    // py.js _ -> _t() call
    var PY_t = new py.PY_def.fromJSON(function() {
        var args = py.PY_parseArgs(arguments, ['str']);
        return py.str.fromJSON(_t(args.str.toJSON()));
    });

    BasicView.include({
        /**
         * @override
         */
        _processField: function (viewType, field, attrs) {
            /* We need process 'options' attribute to handle translations and special replacements */
            if (attrs.widget === "one2many_product_picker" && !_.isObject(attrs.options)) {
                attrs.options = attrs.options ? pyUtils.py_eval(attrs.options, {
                    _: PY_t,
                    number_search: '$number_search',
                }) : {};
            }
            return this._super(viewType, field, attrs);
        },
    });

});
