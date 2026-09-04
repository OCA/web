import {ListRenderer} from "@web/views/list/list_renderer";
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {patch} from "@web/core/utils/patch";

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
            style += `color: ${color};`;
        }

        return style;
    },

    /**
     * Return the `color` that has truthfull expresssion
     *
     * @param {Object} column represents field
     * @param {Record} record
     * @param {String} color_target 'bg_color' or 'fg_color'
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
                    let matches = false;
                    try {
                        matches = evaluateBooleanExpr(
                            expression,
                            record.evalContextWithVirtualIds
                        );
                    } catch (error) {
                        // The expression may reference a field that is not
                        // loaded in the view. Skip this condition instead of
                        // letting the error bubble up and crash the whole
                        // list render (OwlError). Logged at debug level: this
                        // fires per row per render, so warn would flood the
                        // console (and trip strict CI log checks).
                        console.debug(
                            `web_tree_dynamic_colored_field: ignoring ${color_target} expression "${expression}": ${error.message || error}`
                        );
                        continue;
                    }
                    if (matches) {
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
