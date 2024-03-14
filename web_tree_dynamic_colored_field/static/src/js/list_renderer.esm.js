/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {ListRenderer} from "@web/views/list/list_renderer";
import {evaluateBooleanExpr} from "@web/core/py_js/py";

patch(ListRenderer.prototype, {
    /**
     * @param {Object} column represents field
     * @param {Record} record
     * @returns {String} style code for the html element
     */
    getDynamicColoredStyle(column, record) {
        let style = "";

        let color = this.getDynamicColor(column, record, "bg_color");
        if (color !== undefined) {
            style += `background-color: ${color};`;
        }

        color = this.getDynamicColor(column, record, "fg_color");
        if (color !== undefined) {
            // $td.css('color', color);
            style += `color: ${color};`;
        }

        return style;
    },

    /**
     * Return the `color` that has truthfull expresssion
     *
     * @param column {Object} represents field
     * @param record {Record}
     * @param color_target {String} 'bg_color' or 'fg_color'
     * @returns {String | undefined} color
     */
    getDynamicColor(column, record, color_target) {
        if (color_target in column.options) {
            const definition = column.options[color_target];
            let result = "";
            for (const color_def of definition.split(";")) {
                const color_to_expression = this.pairColorParse(color_def);
                if (color_to_expression !== undefined) {
                    const [color, expression] = color_to_expression;
                    if (
                        evaluateBooleanExpr(
                            expression,
                            record.evalContextWithVirtualIds
                        )
                    ) {
                        // We don't return first match,
                        // as it can be default color (with "True" expression),
                        // and later more precise condition may be found.
                        result = color;
                    }
                }
            }
            return result || undefined;
        }
    },

    /**
     * @param {String} pairColor `color: expression` pair
     * @returns {Array} undefined or array of color, expression
     */
    pairColorParse: function (pairColor) {
        if (pairColor !== "") {
            var pairList = pairColor.split(":"),
                color = pairList[0],
                // If one passes a bare color instead of an expression,
                // then we consider that color is to be shown in any case
                expression = pairList[1] ? pairList[1] : "True";
            return [color, expression];
        }
        return undefined;
    },
});
