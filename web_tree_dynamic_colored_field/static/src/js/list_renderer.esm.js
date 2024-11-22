/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {ListRenderer} from "@web/views/list/list_renderer";
import {evaluateExpr} from "@web/core/py_js/py";

patch(ListRenderer.prototype, "web_tree_dynamic_colored_field_list_renderer", {
    /**
     * @param {Object} column represents field
     * @param {Record} record
     * @returns {String} style code for the html element
     */
    getDynamicColoredStyle(column, record) {
        let definition
            expression
            color
        let style = ''
        if (column.options){
            if (column?.options?.bg_color){
                definition = column.options.bg_color
                for (const color_def of definition.split(";")) {
                    var pairList = color_def.split(":"),
                    color = pairList[0],
                    expression = pairList[1] ? pairList[1] : "True";
                    if (evaluateExpr(expression, record.evalContext)) {
                        style += `background-color: ${color} !important;`;
                    }
                }
            }
            if (column?.options?.fg_color){
                definition = column.options.fg_color
                for (const color_def of definition.split(";")) {
                    var pairList = color_def.split(":"),
                    color = pairList[0],
                    expression = pairList[1] ? pairList[1] : "True";
                    console.log("expression", expression)
                    if (evaluateExpr(expression, record.evalContext)) {
                        style += `color: ${color} !important`;
                    }
                }
            }
        }
        return style
    },

});
