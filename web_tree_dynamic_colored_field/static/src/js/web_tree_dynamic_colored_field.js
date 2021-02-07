odoo.define("web_tree_dynamic_colored_field", function (require) {
    "use strict";

    var ListRenderer = require("web.ListRenderer");
    var pyUtils = require("web.py_utils");
    var py = window.py;

    ListRenderer.include({
        /**
         * Colorize a cell during it's render
         *
         * @override
         */
        _renderBodyCell: function (record, node) {
            var $td = this._super.apply(this, arguments);
            var ctx = this.getEvalContext(record);
            this.applyColorize($td, record, node, ctx);
            return $td;
        },

        /**
         * Colorize the current cell depending on expressions provided.
         *
         * @param {Element} $td a <td> tag inside a table representing a list view
         * @param {Object} record
         * @param {Object} node an XML node (must be a <field>)
         * @param {Object} ctx evaluation context for the record
         */
        applyColorize: function ($td, record, node, ctx) {
            if (!node.attrs.options) {
                return;
            }
            if (node.tag !== "field") {
                return;
            }
            var nodeOptions = node.attrs.options;
            if (!_.isObject(nodeOptions)) {
                nodeOptions = pyUtils.py_eval(nodeOptions);
            }
            this.applyColorizeHelper($td, nodeOptions, node, "fg_color", "color", ctx);
            this.applyColorizeHelper(
                $td,
                nodeOptions,
                node,
                "bg_color",
                "background-color",
                ctx
            );
        },
        /**
         * @param {Element} $td a <td> tag inside a table representing a list view
         * @param {Object} nodeOptions a mapping of nodeOptions parameters to the color itself
         * @param {Object} node an XML node (must be a <field>)
         * @param {String} nodeAttribute an attribute of a node to apply a style onto
         * @param {String} cssAttribute a real CSS-compatible attribute
         * @param {Object} ctx evaluation context for the record
         */
        applyColorizeHelper: function (
            $td,
            nodeOptions,
            node,
            nodeAttribute,
            cssAttribute,
            ctx
        ) {
            if (nodeOptions[nodeAttribute]) {
                var colors = _(nodeOptions[nodeAttribute].split(";"))
                    .chain()
                    .map(this.pairColors)
                    .value()
                    .filter(function CheckUndefined(value) {
                        return value !== undefined;
                    });
                for (var i = 0, len = colors.length; i < len; ++i) {
                    var pair = colors[i],
                        color = pair[0],
                        expression = pair[1];
                    if (py.evaluate(expression, ctx).toJSON()) {
                        $td.css(cssAttribute, color);
                    }
                }
            }
        },

        /**
         * Parse `<color>: <field> <operator> <value>` forms to
         * evaluable expressions
         *
         * @param {String} pairColor `color: expression` pair
         * @returns {Array} undefined or array of color, parsed expression,
         * original expression
         */
        pairColors: function (pairColor) {
            if (pairColor !== "") {
                var pairList = pairColor.split(":"),
                    color = pairList[0],
                    // If one passes a bare color instead of an expression,
                    // then we consider that color is to be shown in any case
                    expression = pairList[1] ? pairList[1] : "True";
                return [color, py.parse(py.tokenize(expression)), expression];
            }
            return undefined;
        },
        /**
         * Construct domain evaluation context, mostly by passing
         * record's fields's values to local scope.
         *
         * @param {Object} record a record to build a context from
         * @returns {Object} evaluation context for the record
         */
        getEvalContext: function (record) {
            var ctx = _.extend({}, record.data, pyUtils.context());
            for (var key in ctx) {
                var value = ctx[key];
                if (ctx[key] instanceof moment) {
                    // Date/datetime fields are represented w/ Moment objects
                    // docs: https://momentjs.com/
                    ctx[key] = value.format("YYYY-MM-DD hh:mm:ss");
                }
            }
            return ctx;
        },
    });
});
