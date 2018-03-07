odoo.define('web_tree_dynamic_colored_field', function (require) {
    'use strict';

    var ListRenderer = require('web.ListRenderer');
    var pyeval = require('web.pyeval');

    ListRenderer.include({
        /**
         * Look up for a `color_field` parameter in tree `colors` attribute
         *
         * @override
         */
        _renderBody: function () {
            if (this.arch.attrs.colors) {
                var colorAttr = this.arch.attrs.colors.split(';')
                    .filter(color => color.trim().startsWith('color_field'));
                if (colorAttr.length > 0) {
                    var colorField = colorAttr[0].split(':')[1].trim();
                    // validate the presence of that field in tree view
                    var fieldNames = _(this.columns).map(
                        (value) => { return value.attrs.name; }
                    );
                    if (fieldNames.indexOf(colorField) === -1) {
                        console.warn(
                            "No field named '" + colorField + "' present in view."
                        );
                    } else {
                        this.colorField = colorField;
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
            // apply <field>'s own `options`
            if (!node.attrs.options) { return; }
            if (node.tag !== 'field') { return; }
            var nodeOptions = node.attrs.options;
            if (!_.isObject(nodeOptions)) {
                nodeOptions = pyeval.py_eval(nodeOptions);
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
         * evaluatable expressions
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
                pyeval.context()
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
