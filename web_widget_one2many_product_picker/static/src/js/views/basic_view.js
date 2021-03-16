/* global py */
// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.BasicView", function(require) {
    "use strict";

    const core = require("web.core");
    const pyUtils = require("web.py_utils");
    const BasicView = require("web.BasicView");

    const _t = core._t;

    // Add ref to _() -> _t() call
    const PY_t = new py.PY_def.fromJSON(function() {
        const args = py.PY_parseArgs(arguments, ["str"]);
        return py.str.fromJSON(_t(args.str.toJSON()));
    });

    BasicView.include({
        /**
         * @override
         */
        _processField: function(viewType, field, attrs) {
            /**
             * We need process 'options' attribute to handle translations and
             * special replacements
             */
            if (
                attrs.widget === "one2many_product_picker" &&
                !_.isObject(attrs.options)
            ) {
                attrs.options = attrs.options
                    ? pyUtils.py_eval(attrs.options, {
                          _: PY_t,

                          // Hack: This allow use $number_search out of an string
                          number_search: "$number_search",
                      })
                    : {};
            }
            return this._super(viewType, field, attrs);
        },
    });
});
