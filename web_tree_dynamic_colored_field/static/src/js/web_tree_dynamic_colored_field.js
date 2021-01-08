odoo.define('web_tree_dynamic_colored_field', function (require) {
    'use strict';

    var ListRenderer = require('web.ListRenderer');
    var pyUtils = require("web.py_utils");

    ListRenderer.include({
        /**
         * Look up for a `color_field` parameter in tree `colors` attribute
         *
         * @override
         */
        _renderBody: function () {
            if (this.arch.attrs.colors) {
                var colorAttr = this.arch.attrs.colors.split(';');
                for (var i=0, len=colorAttr.length; i<len; i++) {
                    var attr = colorAttr[i].split(':')
                    if (attr.length == 2) {
                        var attrName = attr[0].trim();
                        var attrValue = attr[1].trim();
                        // validate the presence of that field in tree view
                        if (this.state.data.length && attrValue in this.state.data[0].data) {
                            if (attrName == 'color_field') {
                                this.colorField = attrValue;
                            }
                            else if (attrName == 'background_color_field') {
                                this.backgroundColorField = attrValue;
                            }
                        } else {
                            console.warn(
                                "No field named '" + attrValue + "' present in view."
                            );
                        }
                    } else {
                        console.warn("Invalid color attribute:", attr);
                    }
                }
            }
            return this._super();
        },
        /**
         * Colorize a cell during it's render
         *
         * @override
         */
        _renderBodyCell: function (record, node, colIndex, options) {
            var $td = this._super.apply(this, arguments);
            var ctx = this.getEvalContext(record);
            this.applyColorize($td, record, node, ctx);
            return $td;
        },

        /**
         * Colorize the current cell depending on expressions provided.
         *
         * @param {Query Node} $td a <td> tag inside a table representing a list view
         * @param {Object} node an XML node (must be a <field>)
         */
        applyColorize: function ($td, record, node, ctx) {
            // safely resolve value of `color_field` given in <tree>
            var treeColor = record.data[this.colorField];
            if (treeColor) {
                $td.css('color', treeColor);
            }
            // safely resolve value of `background_color_field` given in <tree>
            var treeBackgroundColor = record.data[this.backgroundColorField];
            if (treeBackgroundColor) {
                $td.css('background-color', treeBackgroundColor);
            }
            // apply <field>'s own `options`
            if (!node.attrs.options) { return; }
            if (node.tag !== 'field') { return; }
            var nodeOptions = node.attrs.options;
            if (!_.isObject(nodeOptions)) {
                nodeOptions = pyUtils.py_eval(nodeOptions);
            }
            this.applyColorizeHelper($td, nodeOptions, node, 'fg_color', 'color', ctx);
            this.applyColorizeHelper($td, nodeOptions, node, 'bg_color', 'background-color', ctx);
        },
        /**
         * @param {Object} nodeOptions a mapping of nodeOptions parameters to the color itself
         * @param {Object} node an XML node (must be a <field>)
         * @param {string} nodeAttribute an attribute of a node to apply a style onto
         * @param {string} cssAttribute a real CSS-compatible attribute
         */
        applyColorizeHelper: function ($td, nodeOptions, node, nodeAttribute, cssAttribute, ctx) {
            if (nodeOptions[nodeAttribute]) {
                var colors = _(nodeOptions[nodeAttribute].split(';'))
                    .chain()
                    .map(this.pairColors)
                    .value()
                    .filter(function CheckUndefined(value, index, ar) {
                        return value !== undefined;
                    });
                for (var i=0, len=colors.length; i<len; ++i) {
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
         * @param {string} pairColor `color: expression` pair
         */
        pairColors: function (pairColor) {
            if (pairColor !== "") {
                var pairList = pairColor.split(':'),
                    color = pairList[0],
                    // if one passes a bare color instead of an expression,
                    // then we consider that color is to be shown in any case
                    expression = pairList[1]? pairList[1] : 'True';
                return [color, py.parse(py.tokenize(expression)), expression];
            }
            return undefined;
        },
        /**
         * Construct domain evaluation context, mostly by passing
         * record's fields's values to local scope.
         *
         * @param {Object} record a record to build a context from
         */
        getEvalContext: function (record) {
            var ctx = _.extend(
                {},
                record.data,
                pyUtils.context()
            );
            for (var key in ctx) {
                var value = ctx[key];
                if (ctx[key] instanceof moment) {
                    // date/datetime fields are represented w/ Moment objects
                    // docs: https://momentjs.com/
                    ctx[key] = value.format('YYYY-MM-DD hh:mm:ss');
                }
            }
            return ctx;
        }
    });
});
